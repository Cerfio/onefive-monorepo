#!/usr/bin/env node

/**
 * Script pour générer un rapport EXHAUSTIF de tous les endpoints et leur couverture E2E
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Génération du rapport E2E exhaustif...\n');

// 1. Extraire tous les controllers et leurs endpoints
const controllers = execSync('find src -name "*.controller.ts" | sort', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const apiEndpoints = [];

controllers.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  const controllerMatch = content.match(/@Controller\(['"](.*?)['"]\)/);
  if (!controllerMatch) return;
  
  const basePath = controllerMatch[1] || '';
  const moduleName = file.split('/').slice(1, -1).join('/'); // src/auth/... → auth
  const shortModule = file.split('/')[1]; // Premier niveau
  
  const methodRegex = /@(Get|Post|Put|Delete|Patch)\((['"].*?['"]|\))/g;
  let match;
  const routes = [];
  
  while ((match = methodRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let path = match[2];
    
    if (path === ')') {
      path = '';
    } else {
      path = path.replace(/['"]/g, '');
    }
    
    const fullPath = `/${basePath}${path}`.replace(/\/+/g, '/');
    routes.push({ method, path: fullPath });
  }
  
  if (routes.length > 0) {
    apiEndpoints.push({
      module: shortModule,
      fullModule: moduleName,
      controller: file,
      basePath: `/${basePath}`,
      routes,
    });
  }
});

// 2. Analyser tous les fichiers E2E
const e2eFiles = execSync('find src -name "*.e2e*.ts" 2>/dev/null || true', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const e2eInfo = {};

e2eFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const module = file.split('/')[1];
    
    // Détecter si fichier entier skippé
    const isFullySkipped = content.match(/^describe\.skip\(/m);
    
    // Compter les tests
    const totalTests = (content.match(/it\(/g) || []).length + (content.match(/it\.skip\(/g) || []).length;
    const skippedTests = (content.match(/it\.skip\(/g) || []).length;
    const skippedDescribes = (content.match(/describe\.skip\(/g) || []).length;
    const activeTests = totalTests - skippedTests;
    
    if (!e2eInfo[module]) {
      e2eInfo[module] = {
        files: [],
        totalTests: 0,
        activeTests: 0,
        skippedTests: 0,
        skippedDescribes: 0,
      };
    }
    
    e2eInfo[module].files.push({
      path: file,
      fullySkipped: !!isFullySkipped,
      totalTests,
      activeTests,
      skippedTests,
      skippedDescribes,
    });
    
    e2eInfo[module].totalTests += totalTests;
    e2eInfo[module].activeTests += activeTests;
    e2eInfo[module].skippedTests += skippedTests;
    e2eInfo[module].skippedDescribes += skippedDescribes;
  } catch (err) {
    console.error(`⚠️  Erreur lecture ${file}:`, err.message);
  }
});

// 3. Générer le README
let readme = `# 📚 OneFive Backend - Rapport E2E Exhaustif

> **Dernière mise à jour:** ${new Date().toLocaleString('fr-FR')}

## 📊 Vue d'ensemble Globale

| Métrique | Valeur |
|----------|--------|
| **Total Modules** | ${apiEndpoints.length} |
| **Total Endpoints API** | ${apiEndpoints.reduce((sum, e) => sum + e.routes.length, 0)} |
| **Modules avec E2E** | ${Object.keys(e2eInfo).length} |
| **Modules sans E2E** | ${apiEndpoints.length - Object.keys(e2eInfo).length} |
| **Total Fichiers E2E** | ${e2eFiles.length} |
| **Tests E2E Total** | ${Object.values(e2eInfo).reduce((sum, m) => sum + m.totalTests, 0)} |
| **Tests E2E Actifs** | ${Object.values(e2eInfo).reduce((sum, m) => sum + m.activeTests, 0)} ✅ |
| **Tests E2E Skippés** | ${Object.values(e2eInfo).reduce((sum, m) => sum + m.skippedTests, 0)} ⏭️ |

---

## 🎯 Modules avec E2E Tests (Détails)

`;

Object.entries(e2eInfo)
  .sort()
  .forEach(([module, info]) => {
    const moduleEndpoints = apiEndpoints.filter(e => e.module === module);
    const totalEndpoints = moduleEndpoints.reduce((sum, e) => sum + e.routes.length, 0);
    const coverage = info.totalTests > 0 ? `${Math.round((info.activeTests / info.totalTests) * 100)}%` : '0%';
    const status = info.activeTests > 0 ? '🟢' : '🔴';
    
    readme += `\n### ${status} \`${module}\` - Couverture: ${coverage}\n\n`;
    readme += `**Endpoints API:** ${totalEndpoints} | **Tests E2E:** ${info.totalTests} (${info.activeTests} actifs, ${info.skippedTests} skippés)\n\n`;
    
    if (info.skippedDescribes > 0) {
      readme += `⚠️ **${info.skippedDescribes} describe.skip** détectés\n\n`;
    }
    
    info.files.forEach(file => {
      const fileStatus = file.fullySkipped ? '🔴 SKIPPÉ' : file.activeTests > 0 ? '🟢 ACTIF' : '🟡 PARTIEL';
      readme += `- ${fileStatus} \`${file.path}\`\n`;
      readme += `  - Tests: ${file.activeTests}/${file.totalTests} actifs`;
      if (file.skippedTests > 0) readme += ` (${file.skippedTests} skippés)`;
      if (file.skippedDescribes > 0) readme += ` | ${file.skippedDescribes} describe.skip`;
      readme += `\n`;
    });
    
    // Lister les endpoints du module
    if (moduleEndpoints.length > 0) {
      readme += `\n**Endpoints:**\n\n`;
      readme += `| Méthode | Path | E2E |\n`;
      readme += `|---------|------|-----|\n`;
      
      moduleEndpoints.forEach(endpoint => {
        endpoint.routes.forEach(route => {
          const hasTest = info.activeTests > 0 ? '✅' : '⏭️';
          readme += `| \`${route.method.padEnd(6)}\` | \`${route.path}\` | ${hasTest} |\n`;
        });
      });
    }
    
    readme += `\n`;
  });

readme += `---

## ❌ Modules SANS E2E Tests

`;

const modulesWithoutE2E = apiEndpoints.filter(e => !e2eInfo[e.module]);
const uniqueModulesWithoutE2E = [...new Set(modulesWithoutE2E.map(e => e.module))].sort();

uniqueModulesWithoutE2E.forEach(module => {
  const moduleEndpoints = apiEndpoints.filter(e => e.module === module);
  const totalEndpoints = moduleEndpoints.reduce((sum, e) => sum + e.routes.length, 0);
  
  readme += `\n### ⬜ \`${module}\` - ${totalEndpoints} endpoints\n\n`;
  
  readme += `| Méthode | Path | E2E |\n`;
  readme += `|---------|------|-----|\n`;
  
  moduleEndpoints.forEach(endpoint => {
    endpoint.routes.forEach(route => {
      readme += `| \`${route.method.padEnd(6)}\` | \`${route.path}\` | ❌ |\n`;
    });
  });
  
  readme += `\n`;
});

readme += `---

## 🚀 Plan d'Action Recommandé

### Phase 1 : Réactiver les Tests Skippés (Priorité HAUTE)

Les modules suivants ont des tests E2E **écrits mais skippés**. Il faut les réactiver :

`;

Object.entries(e2eInfo)
  .filter(([, info]) => info.skippedTests > 0)
  .sort((a, b) => b[1].skippedTests - a[1].skippedTests)
  .forEach(([module, info]) => {
    readme += `- [ ] **${module}** : ${info.skippedTests} tests skippés (${info.skippedDescribes} describe.skip)\n`;
  });

readme += `\n### Phase 2 : Créer les Tests Manquants (Priorité MOYENNE)\n\n`;

uniqueModulesWithoutE2E.slice(0, 10).forEach(module => {
  const moduleEndpoints = apiEndpoints.filter(e => e.module === module);
  const totalEndpoints = moduleEndpoints.reduce((sum, e) => sum + e.routes.length, 0);
  readme += `- [ ] **${module}** : ${totalEndpoints} endpoints sans tests\n`;
});

if (uniqueModulesWithoutE2E.length > 10) {
  readme += `- [ ] ... et ${uniqueModulesWithoutE2E.length - 10} autres modules\n`;
}

readme += `\n---

## 🛠️ Commandes Utiles

### Lancer TOUS les tests E2E
\`\`\`bash
NODE_ENV=test npx jest --testPathPattern="e2e" --forceExit --runInBand
\`\`\`

### Lancer les tests d'un module spécifique
\`\`\`bash
NODE_ENV=test npx jest --testPathPattern="auth.*e2e" --forceExit --runInBand
\`\`\`

### Voir les tests skippés
\`\`\`bash
grep -r "describe.skip\\|it.skip" src --include="*.e2e*.ts"
\`\`\`

### Désactiver temporairement un test
\`\`\`typescript
it.skip('should work', () => { ... }); // Un seul test
describe.skip('Feature X', () => { ... }); // Tout un describe
\`\`\`

---

## 📈 Progression

\`\`\`
Tests Actifs:    ${'█'.repeat(Math.round(Object.values(e2eInfo).reduce((sum, m) => sum + m.activeTests, 0) / 10))} ${Object.values(e2eInfo).reduce((sum, m) => sum + m.activeTests, 0)}
Tests Skippés:   ${'░'.repeat(Math.round(Object.values(e2eInfo).reduce((sum, m) => sum + m.skippedTests, 0) / 10))} ${Object.values(e2eInfo).reduce((sum, m) => sum + m.skippedTests, 0)}
\`\`\`

**Couverture E2E Globale:** ${Math.round((Object.values(e2eInfo).reduce((sum, m) => sum + m.activeTests, 0) / Object.values(e2eInfo).reduce((sum, m) => sum + m.totalTests, 0)) * 100)}% des tests écrits sont actifs

---

**🤖 Généré automatiquement par \`scripts/generate-full-e2e-report.js\`**
`;

// Sauvegarder
fs.writeFileSync('E2E-REPORT.md', readme);

console.log('✅ Rapport généré: E2E-REPORT.md\n');
console.log('📊 Statistiques:');
console.log(`   - ${apiEndpoints.length} modules API`);
console.log(`   - ${apiEndpoints.reduce((sum, e) => sum + e.routes.length, 0)} endpoints totaux`);
console.log(`   - ${Object.keys(e2eInfo).length} modules avec E2E`);
console.log(`   - ${uniqueModulesWithoutE2E.length} modules sans E2E`);
console.log(`   - ${Object.values(e2eInfo).reduce((sum, m) => sum + m.totalTests, 0)} tests E2E écrits`);
console.log(`   - ${Object.values(e2eInfo).reduce((sum, m) => sum + m.activeTests, 0)} tests E2E actifs ✅`);
console.log(`   - ${Object.values(e2eInfo).reduce((sum, m) => sum + m.skippedTests, 0)} tests E2E skippés ⏭️`);
