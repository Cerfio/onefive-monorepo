#!/usr/bin/env node
/**
 * Crée des stubs de re-export dans onefive-web/src/components/
 * UNIQUEMENT pour les fichiers qui existent dans packages/ui.
 *
 * Les fichiers propres à onefive-web (spinner, input-password, etc.)
 * ne sont pas touchés.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, relative, resolve, extname } from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PKG_SRC = join(REPO_ROOT, "packages/ui/src");
const WEB_COMPONENTS = join(REPO_ROOT, "onefive-web/src/components");

const COMPONENT_DIRS = [
  "components/base",
  "components/foundations",
  "components/application",
  "components/shared-assets",
];

function getAllFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        results.push(...getAllFiles(full));
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return results;
}

let created = 0;
let skipped = 0;

for (const dir of COMPONENT_DIRS) {
  const pkgDir = join(PKG_SRC, dir);
  const files = getAllFiles(pkgDir);

  for (const pkgFile of files) {
    const ext = extname(pkgFile);
    if (![".ts", ".tsx"].includes(ext)) continue;

    const relToComponents = relative(join(PKG_SRC, "components"), pkgFile);
    const targetFile = join(WEB_COMPONENTS, relToComponents);

    // Ne remplacer que si le fichier existe déjà dans onefive-web
    if (!existsSync(targetFile)) {
      skipped++;
      continue;
    }

    mkdirSync(dirname(targetFile), { recursive: true });

    const relToSrc = relative(PKG_SRC, pkgFile).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    const packageImportPath = `@onefive/ui/${relToSrc}`;

    const stub = `// Re-export depuis @onefive/ui — voir packages/ui/src/${relToSrc}
export * from "${packageImportPath}";
`;
    writeFileSync(targetFile, stub, "utf-8");
    created++;
  }
}

console.log(`✅ ${created} stubs créés, ${skipped} fichiers ignorés (propres à onefive-web).`);
