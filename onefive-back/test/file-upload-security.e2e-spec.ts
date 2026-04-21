/**
 * File upload security — defense-in-depth validation :
 * 1. MIME type whitelist (11 types autorisés)
 * 2. Extension blacklist (43 dangereuses)
 * 3. Sanitization filename (anti path-traversal)
 * 4. Size limit 50 MB / fichier
 * 5. Count limit 20 fichiers / upload
 * 6. MIME spoofing bloqué par la double couche MIME + extension
 *
 * Utilise StorageService mocké (pas de vrai appel R2).
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { createDataroomForUser } from './helpers/flow-helpers';
import { installMocks, ExternalCallMocks } from './helpers/mocks';
import {
  sanitizeFilename,
  validateMimeType,
  validateExtension,
  validateFileSize,
  validateFileCount,
} from '../src/common/utils/file-validation.utils';

describe('File upload security', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;
  let dataroomId: string;
  let ownerToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);

    const owner = await createAuthenticatedUser(app, request, 'fu-owner');
    ownerToken = owner.token;
    const dr = await createDataroomForUser(app, request, owner, { prisma });
    if (!dr.dataroomId) throw new Error('dataroom not created');
    dataroomId = dr.dataroomId;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ── Pure validation utilities ─────────────────────────────

  describe('sanitizeFilename', () => {
    it('strips path traversal ../ and leading directories', () => {
      // Implementation strips the whole path prefix first (regex ^.*[/\\])
      // so only the basename "passwd" survives — no directory component leaks
      expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    });
    it('strips leading directory components', () => {
      expect(sanitizeFilename('/home/user/document.pdf')).toBe('document.pdf');
    });
    it('preserves safe chars (alphanumeric, dot, hyphen, underscore)', () => {
      expect(sanitizeFilename('My_Doc-2024.v1.pdf')).toBe('My_Doc-2024.v1.pdf');
    });
    it('replaces unsafe chars (spaces, unicode, control chars)', () => {
      const sanitized = sanitizeFilename('my file ' + String.fromCharCode(0) + '!.pdf');
      expect(sanitized).toMatch(/\.pdf$/);
      expect(sanitized).not.toContain(' ');
      expect(sanitized).not.toContain(String.fromCharCode(0));
    });
    it('returns "unnamed" for an all-stripped filename', () => {
      expect(sanitizeFilename('../../..')).toBe('unnamed');
    });
    it('truncates at 255 chars preserving extension', () => {
      const long = 'a'.repeat(500) + '.pdf';
      const safe = sanitizeFilename(long);
      expect(safe.length).toBeLessThanOrEqual(255);
      expect(safe).toMatch(/\.pdf$/);
    });
  });

  describe('validateMimeType', () => {
    it('accepts pdf', () => {
      expect(() => validateMimeType('application/pdf', 'doc.pdf')).not.toThrow();
    });
    it('rejects text/html', () => {
      expect(() => validateMimeType('text/html', 'doc.html')).toThrow(/not allowed/);
    });
    it('rejects application/octet-stream', () => {
      expect(() => validateMimeType('application/octet-stream', 'bin')).toThrow();
    });
  });

  describe('validateExtension', () => {
    it('rejects .exe', () => {
      expect(() => validateExtension('malware.exe')).toThrow(/not allowed/);
    });
    it('rejects .svg (can contain JS)', () => {
      expect(() => validateExtension('logo.svg')).toThrow();
    });
    it('rejects .html', () => {
      expect(() => validateExtension('page.html')).toThrow();
    });
    it('rejects .js', () => {
      expect(() => validateExtension('script.js')).toThrow();
    });
    it('accepts .pdf', () => {
      expect(() => validateExtension('doc.pdf')).not.toThrow();
    });
  });

  describe('validateFileSize', () => {
    it('accepts 49 MB', () => {
      expect(() => validateFileSize(49 * 1024 * 1024, 'ok.pdf')).not.toThrow();
    });
    it('rejects 51 MB', () => {
      expect(() => validateFileSize(51 * 1024 * 1024, 'big.pdf')).toThrow(/too large/);
    });
  });

  describe('validateFileCount', () => {
    it('rejects 0', () => {
      expect(() => validateFileCount(0)).toThrow(/No files/);
    });
    it('accepts 20', () => {
      expect(() => validateFileCount(20)).not.toThrow();
    });
    it('rejects 21', () => {
      expect(() => validateFileCount(21)).toThrow(/Too many/);
    });
  });

  // ── HTTP upload endpoint — real multipart ────────────────

  function attachFile(
    req: request.Test,
    field: string,
    content: Buffer,
    filename: string,
    contentType: string,
  ): request.Test {
    return req.attach(field, content, { filename, contentType });
  }

  it('rejects .exe upload even with spoofed MIME type (defense-in-depth extension check)', async () => {
    const res = await attachFile(
      request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${ownerToken}`)
        .field('files[0].category', 'Legal'),
      'files[0].file',
      Buffer.from('MZ\x90\x00'), // PE header bytes
      'malware.exe',
      'application/pdf', // spoofed MIME
    );
    expect([400, 415]).toContain(res.status);
  });

  it('rejects text/html MIME type (blocked)', async () => {
    const res = await attachFile(
      request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${ownerToken}`)
        .field('files[0].category', 'Legal'),
      'files[0].file',
      Buffer.from('<h1>hi</h1>'),
      'page.html',
      'text/html',
    );
    expect([400, 415]).toContain(res.status);
  });

  it('rejects filename with path traversal (sanitization strips it)', async () => {
    const res = await attachFile(
      request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${ownerToken}`)
        .field('files[0].category', 'Legal'),
      'files[0].file',
      Buffer.from('%PDF-1.4\n'),
      '../../../etc/passwd.pdf',
      'application/pdf',
    );

    // Either rejected, or accepted with sanitized name — check DB for no traversal
    if ([200, 201].includes(res.status)) {
      const files = await prisma.dataroomFile.findMany({
        where: { dataroomId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      expect(files[0]?.name || '').not.toMatch(/\.\./);
      expect(files[0]?.name || '').not.toMatch(/\//);
    }
  });

  it('accepts a valid PDF upload (storage mocked) + mocks.storageUpload called', async () => {
    if (!mocks.storageUpload) {
      // Storage mock not installed — skip
      return;
    }
    const before = mocks.storageUpload.mock.calls.length;

    const res = await attachFile(
      request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${ownerToken}`)
        .field('files[0].category', 'Docs'),
      'files[0].file',
      Buffer.from('%PDF-1.4\nhello'),
      'legit.pdf',
      'application/pdf',
    );

    if (![200, 201].includes(res.status)) {
      // eslint-disable-next-line no-console
      console.error('PDF upload failed:', res.status, JSON.stringify(res.body));
    }
    expect([200, 201]).toContain(res.status);
    expect(mocks.storageUpload.mock.calls.length).toBeGreaterThan(before);
  });

  it('rejects empty upload (no files)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/dataroom/${dataroomId}/file`)
      .set('Cookie', `token=${ownerToken}`)
      .set('Content-Type', 'multipart/form-data; boundary=----boundary')
      .send(
        '------boundary--\r\n',
      );
    expect([400, 415]).toContain(res.status);
  });
});
