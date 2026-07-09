import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import {
  createCanvas,
  DOMMatrix,
  Path2D,
  ImageData,
} from '@napi-rs/canvas';
import { createRequire } from 'module';

// pdfjs a besoin de ces globals côté Node (le canvas @napi-rs les fournit).
const g = globalThis as any;
if (!g.DOMMatrix) g.DOMMatrix = DOMMatrix;
if (!g.Path2D) g.Path2D = Path2D;
if (!g.ImageData) g.ImageData = ImageData;

// pdfjs-dist (build legacy) est ESM-only ; le backend compile en CommonJS, donc
// `await import()` serait transpilé en require() et casserait le chargement ESM.
// On préserve un vrai import dynamique via `new Function`.
const dynamicImport = new Function('s', 'return import(s)') as (
  s: string,
) => Promise<any>;

// Résout le dossier des polices base-14 empaquetées avec pdfjs.
const nodeRequire = createRequire(__filename);
const STANDARD_FONT_DATA_URL = nodeRequire
  .resolve('pdfjs-dist/package.json')
  .replace(/package\.json$/, 'standard_fonts/');

/**
 * Rasterise des pages PDF en PNG côté serveur avec un filigrane baké dans les
 * pixels (identité du lecteur + horodatage). Sert le vrai « view-only » : le
 * client ne reçoit jamais le PDF brut — pas de couche texte copiable, filigrane
 * inarrachable. Cf. item backlog « rendu PDF serveur en images ».
 */
@Injectable()
export class PdfRenderService {
  private pdfjsPromise: Promise<any> | null = null;

  // Cache court des octets bruts par storageId, pour ne pas re-télécharger le
  // PDF depuis S3 à chaque page rendue d'un même document.
  private readonly bufferCache = new Map<
    string,
    { buffer: Buffer; expiresAt: number }
  >();
  private readonly BUFFER_TTL_MS = 5 * 60 * 1000;

  constructor(@Inject('Logger') private readonly logger: LogService) {}

  private getPdfjs(): Promise<any> {
    if (!this.pdfjsPromise) {
      this.pdfjsPromise = dynamicImport('pdfjs-dist/legacy/build/pdf.mjs');
    }
    return this.pdfjsPromise;
  }

  cacheBuffer(storageId: string, buffer: Buffer): void {
    this.bufferCache.set(storageId, {
      buffer,
      expiresAt: Date.now() + this.BUFFER_TTL_MS,
    });
  }

  getCachedBuffer(storageId: string): Buffer | null {
    const entry = this.bufferCache.get(storageId);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.bufferCache.delete(storageId);
      return null;
    }
    return entry.buffer;
  }

  private async loadDocument(pdf: Buffer): Promise<any> {
    const pdfjs = await this.getPdfjs();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdf),
      disableWorker: true,
      isEvalSupported: false,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
      useSystemFonts: false,
      // Silence les warnings verbeux de pdfjs en prod.
      verbosity: 0,
    });
    return loadingTask.promise;
  }

  /** Nombre de pages d'un PDF. */
  async getPageCount(pdf: Buffer): Promise<number> {
    const doc = await this.loadDocument(pdf);
    const n = doc.numPages;
    await doc.destroy();
    return n;
  }

  /**
   * Rend une page en PNG avec le filigrane baké. `scale` borné pour éviter les
   * images démesurées (DoS mémoire).
   */
  async renderPage({
    pdf,
    pageNumber,
    watermark,
    scale = 2,
  }: {
    pdf: Buffer;
    pageNumber: number;
    watermark: string;
    scale?: number;
  }): Promise<Buffer> {
    const safeScale = Math.max(1, Math.min(3, scale));
    const doc = await this.loadDocument(pdf);
    try {
      if (pageNumber < 1 || pageNumber > doc.numPages) {
        throw new Error(
          `Page ${pageNumber} hors limites (1..${doc.numPages})`,
        );
      }
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: safeScale });
      const width = Math.ceil(viewport.width);
      const height = Math.ceil(viewport.height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Fond blanc (les PDF supposent un fond papier).
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      await page.render({ canvasContext: ctx as any, viewport }).promise;

      this.bakeWatermark(ctx, width, height, watermark);

      return canvas.toBuffer('image/png');
    } finally {
      await doc.destroy();
    }
  }

  /** Filigrane diagonal tuilé, baké dans les pixels. */
  private bakeWatermark(
    ctx: any,
    width: number,
    height: number,
    label: string,
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);
    const diag = Math.ceil(Math.sqrt(width * width + height * height));
    const stepX = 340;
    const stepY = 84;
    for (let y = -diag; y < diag; y += stepY) {
      for (let x = -diag; x < diag; x += stepX) {
        ctx.fillText(label, x, y);
      }
    }
    ctx.restore();
  }
}
