#!/usr/bin/env node
/**
 * Creates re-export stub files in onefive-backoffice/src/components/
 * for every file that was moved to @onefive/ui.
 *
 * This ensures business-specific code that currently does:
 *   import { Button } from "@/components/base/buttons/button";
 * continues to work without any changes.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname, relative, resolve, extname } from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PKG_SRC = join(REPO_ROOT, "packages/ui/src");
const BACKOFFICE_COMPONENTS = join(REPO_ROOT, "onefive-backoffice/src/components");

// Directories in the package that correspond to src/components/
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

for (const dir of COMPONENT_DIRS) {
  const pkgDir = join(PKG_SRC, dir);
  const files = getAllFiles(pkgDir);

  for (const pkgFile of files) {
    const ext = extname(pkgFile);
    if (![".ts", ".tsx"].includes(ext)) continue;

    // Compute the path relative to packages/ui/src/components/
    // e.g. "base/buttons/button.tsx"
    const relToComponents = relative(join(PKG_SRC, "components"), pkgFile);

    // Target path in backoffice
    const targetFile = join(BACKOFFICE_COMPONENTS, relToComponents);

    mkdirSync(dirname(targetFile), { recursive: true });

    // The import path from the package — strip .tsx extension for the module path
    // Use the subpath export pattern: @onefive/ui/components/base/buttons/button
    const relToSrc = relative(PKG_SRC, pkgFile).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    const packageImportPath = `@onefive/ui/${relToSrc}`;

    const stub = `// Re-export from @onefive/ui — voir packages/ui/src/${relToSrc}
export * from "${packageImportPath}";
`;
    writeFileSync(targetFile, stub, "utf-8");
    created++;
  }
}

console.log(`✅ Created ${created} re-export stubs in onefive-backoffice/src/components/`);
