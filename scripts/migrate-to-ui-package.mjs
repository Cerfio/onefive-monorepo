#!/usr/bin/env node
/**
 * Migration script: copies shared Untitled UI components from onefive-backoffice
 * to packages/ui/src/, fixing internal @/ path aliases to relative imports.
 *
 * Usage: node scripts/migrate-to-ui-package.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname, relative, resolve } from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SOURCE = join(REPO_ROOT, "onefive-backoffice/src");
const TARGET_PKG = join(REPO_ROOT, "packages/ui/src");

// Directories to copy (relative to src/)
const COPY_DIRS = [
  "components/base",
  "components/foundations",
  "components/application",
  "components/shared-assets",
  "utils",
  "types",
];

function getAllFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...getAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/**
 * Given a file at `filePath` (absolute) inside TARGET_PKG/src/,
 * compute the relative prefix to reach TARGET_PKG/src/.
 * e.g. for a file at TARGET_PKG/src/components/base/buttons/button.tsx
 *   → '../../../'
 */
function computeRelativePrefix(filePath) {
  const srcDir = TARGET_PKG; // packages/ui/src
  const fileDir = dirname(filePath);
  const rel = relative(fileDir, srcDir);
  return rel ? rel + "/" : "./";
}

/**
 * Transforms @/ path aliases to relative paths based on the file's location
 * within packages/ui/src/.
 */
function transformImports(content, filePath) {
  const prefix = computeRelativePrefix(filePath);
  return content.replace(
    /from ["']@\/([^"']+)["']/g,
    (match, importPath) => `from "${prefix}${importPath}"`
  ).replace(
    /import ["']@\/([^"']+)["']/g,
    (match, importPath) => `import "${prefix}${importPath}"`
  );
}

let copied = 0;
let skipped = 0;

for (const dir of COPY_DIRS) {
  const sourceDir = join(SOURCE, dir);
  try {
    const files = getAllFiles(sourceDir);
    for (const srcFile of files) {
      const relToSrc = relative(SOURCE, srcFile);
      const targetFile = join(TARGET_PKG, relToSrc);

      mkdirSync(dirname(targetFile), { recursive: true });

      const ext = srcFile.split(".").pop();
      if (["ts", "tsx"].includes(ext)) {
        const content = readFileSync(srcFile, "utf-8");
        const transformed = transformImports(content, targetFile);
        writeFileSync(targetFile, transformed, "utf-8");
        if (content !== transformed) {
          const importCount = (transformed.match(/from "(?:\.\.\/|\.\/)/g) || []).length;
          console.log(`  transformed (${importCount} imports rewritten): ${relToSrc}`);
        } else {
          console.log(`  copied: ${relToSrc}`);
        }
        copied++;
      } else {
        // CSS, etc — copy as-is
        copyFileSync(srcFile, targetFile);
        console.log(`  copied (binary): ${relToSrc}`);
        copied++;
      }
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      console.warn(`⚠ Directory not found, skipping: ${dir}`);
      skipped++;
    } else {
      throw e;
    }
  }
}

console.log(`\n✅ Done. ${copied} files copied, ${skipped} directories skipped.`);
