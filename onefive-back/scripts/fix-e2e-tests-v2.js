#!/usr/bin/env node

/**
 * Script v2 pour fixer les tests E2E
 * - Corrige les beforeEach avec emails/users partagés
 * - Détecte et corrige les variables réutilisées
 * - Ajoute createUniqueEmail() dans les beforeEach
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Recherche des fichiers E2E...');
const e2eFiles = execSync('find src -name "*.e2e*.ts" -type f', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(f => !f.includes('auth.controller.e2e-spec.ts')); // Skip auth (déjà fixé)

console.log(`✅ Trouvé ${e2eFiles.length} fichiers E2E à fixer\n`);

let totalChanges = 0;

e2eFiles.forEach((file) => {
  console.log(`📝 Traitement: ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;
  const originalContent = content;

  // 1. Fixer les beforeEach avec signup/signin qui créent des users
  // Pattern: await request(...).post('/auth/signup').send({ email: 'fixed@example.com', password: ... })
  const signupPattern = /await request\([^)]+\)\.post\(['"]\/auth\/signup['"]\)\.send\(\{[^}]*email:\s*['"]([^'"]+)['"]/g;
  
  let match;
  const fixedEmails = new Set();
  while ((match = signupPattern.exec(originalContent)) !== null) {
    const email = match[1];
    if (email.includes('@example.com') && !email.includes('createUniqueEmail')) {
      fixedEmails.add(email);
    }
  }

  // Remplacer les emails fixes dans les signup
  fixedEmails.forEach(email => {
    const prefix = email.split('@')[0];
    const regex = new RegExp(`email:\\s*['"]${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, `email: createUniqueEmail('${prefix}')`);
      changes += matches;
      console.log(`  ✓ Remplacé ${matches} occurrences de ${email}`);
    }
  });

  // 2. Détecter et corriger les variables d'auth token partagées
  // Pattern: let authToken: string; ... authToken = response.body.data.token;
  const authTokenPattern = /let\s+(\w*[Tt]oken)\s*:\s*string;[\s\S]*?\1\s*=\s*[^;]+\.body\.data\.token;/g;
  const authMatches = content.match(authTokenPattern);
  if (authMatches && authMatches.length > 0) {
    // S'assurer que le beforeEach utilise createUniqueEmail
    const beforeEachPattern = /beforeEach\(async\s+\(\)\s+=>\s+\{[\s\S]*?await request\([^)]+\)\.post\(['"]\/auth\/signup['"]\)/;
    if (beforeEachPattern.test(content)) {
      console.log(`  ✓ Détecté beforeEach avec auth - déjà géré par les fixes précédents`);
    }
  }

  // 3. Corriger les références à des emails fixes dans les tests
  const emailReferences = [
    { pattern: /email:\s*'test@example\.com'/g, replacement: "email: createUniqueEmail('test')" },
    { pattern: /email:\s*'user@example\.com'/g, replacement: "email: createUniqueEmail('user')" },
  ];

  emailReferences.forEach(({ pattern, replacement }) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      content = content.replace(pattern, replacement);
      changes += matches;
      console.log(`  ✓ Corrigé ${matches} références d'email`);
    }
  });

  // 4. Ajouter .expect() avec un code de succès générique si manquant
  // Chercher les requêtes sans .expect() qui devraient en avoir un
  const requestWithoutExpect = /await request\([^)]+\)\.(post|get|put|delete|patch)\([^)]+\)[^;]*;(?!\s*\.expect)/g;
  // Note: C'est complexe, on skip pour l'instant

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
