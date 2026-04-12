#!/usr/bin/env node

/**
 * Script global pour fixer tous les tests E2E
 * - Remplace password123 par validPassword
 * - Remplace emails fixes par createUniqueEmail()
 * - Corrige country → countryCode
 * - Ajoute les imports nécessaires
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Trouver tous les fichiers E2E
console.log('🔍 Recherche des fichiers E2E...');
const e2eFiles = execSync('find src -name "*.e2e*.ts" -type f', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

console.log(`✅ Trouvé ${e2eFiles.length} fichiers E2E\n`);

let totalChanges = 0;

e2eFiles.forEach((file) => {
  console.log(`📝 Traitement: ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;
  const originalContent = content;

  // 1. Ajouter les imports si pas déjà présents
  if (!content.includes('validPassword') && !content.includes('createUniqueEmail')) {
    const importMatch = content.match(/import \* as request from 'supertest';/);
    if (importMatch) {
      content = content.replace(
        /import \* as request from 'supertest';/,
        "import * as request from 'supertest';\nimport { validPassword, createUniqueEmail } from '../../test/helpers/fixtures';"
      );
      changes++;
      console.log('  ✓ Ajout des imports');
    }
  }

  // 2. Remplacer password123 par validPassword
  const passwordMatches = (content.match(/'password123'/g) || []).length;
  if (passwordMatches > 0) {
    content = content.replace(/'password123'/g, 'validPassword');
    content = content.replace(/"password123"/g, 'validPassword');
    changes += passwordMatches;
    console.log(`  ✓ Remplacé ${passwordMatches} occurrences de password123`);
  }

  // 3. Remplacer emails fixes par createUniqueEmail()
  const emailPatterns = [
    { pattern: /'test@example\.com'/g, replacement: "createUniqueEmail('test')" },
    { pattern: /'user@example\.com'/g, replacement: "createUniqueEmail('user')" },
    { pattern: /'admin@example\.com'/g, replacement: "createUniqueEmail('admin')" },
    { pattern: /'john@example\.com'/g, replacement: "createUniqueEmail('john')" },
    { pattern: /'jane@example\.com'/g, replacement: "createUniqueEmail('jane')" },
  ];

  emailPatterns.forEach(({ pattern, replacement }) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      content = content.replace(pattern, replacement);
      changes += matches;
      console.log(`  ✓ Remplacé ${matches} emails fixes`);
    }
  });

  // 4. Corriger country → countryCode
  const countryMatches = (content.match(/\bcountry:/g) || []).length;
  if (countryMatches > 0) {
    content = content.replace(/\bcountry:/g, 'countryCode:');
    changes += countryMatches;
    console.log(`  ✓ Corrigé ${countryMatches} occurrences de country → countryCode`);
  }

  // 5. Sauvegarder si changements
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalChanges += changes;
    console.log(`  ✅ ${changes} changements appliqués\n`);
  } else {
    console.log(`  ⏭️  Aucun changement nécessaire\n`);
  }
});

console.log(`\n🎉 Terminé! ${totalChanges} changements appliqués sur ${e2eFiles.length} fichiers`);
