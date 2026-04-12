#!/usr/bin/env node

/**
 * Script pour activer tous les tests E2E skippés et générer un rapport
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Activation de TOUS les tests E2E...\n');

// Trouver tous les fichiers E2E
const e2eFiles = execSync('find src -name "*.e2e*.ts" | sort', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(f => !f.includes('.skip')); // Ignorer les fichiers .skip

let totalActivated = 0;

e2eFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Compter les it.skip avant
    const before = (content.match(/it\.skip\(/g) || []).length;
    
    // Remplacer tous les it.skip par it
    content = content.replace(/it\.skip\(/g, 'it(');
    
    // Compter après
    const after = (content.match(/it\.skip\(/g) || []).length;
    const activated = before - after;
    
    if (activated > 0) {
      fs.writeFileSync(file, content);
      console.log(`✅ ${file}: ${activated} tests activés`);
      totalActivated += activated;
    }
  } catch (err) {
    console.error(`❌ Erreur ${file}:`, err.message);
  }
});

console.log(`\n🎯 Total: ${totalActivated} tests activés dans ${e2eFiles.length} fichiers\n`);
console.log('📝 Lancement des tests E2E...\n');

// Lancer les tests E2E
try {
  execSync('NODE_ENV=test npx jest --testPathPattern="e2e" --forceExit --runInBand --no-coverage --testTimeout=120000', {
    stdio: 'inherit',
  });
} catch (err) {
  console.log('\n⚠️  Certains tests ont échoué (c\'est normal)');
}

console.log('\n✨ Terminé! Régénérer le rapport avec: node scripts/generate-full-e2e-report.js');
