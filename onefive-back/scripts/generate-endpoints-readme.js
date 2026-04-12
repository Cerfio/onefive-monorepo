#!/usr/bin/env node

/**
 * Script pour extraire TOUS les endpoints de l'API
 * Parse les @Controller et @Get/@Post/@Put/@Delete/@Patch
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Extraction de TOUS les endpoints...\n');

const controllers = execSync('find src -name "*.controller.ts" | sort', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const endpoints = [];

controllers.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Extraire le @Controller decorator
  const controllerMatch = content.match(/@Controller\(['"](.*?)['"]\)/);
  if (!controllerMatch) return;
  
  const basePath = controllerMatch[1] || '';
  const moduleName = file.split('/').slice(-2, -1)[0]; // Nom du dossier parent
  
  // Extraire tous les endpoints
  const methodRegex = /@(Get|Post|Put|Delete|Patch)\((['"].*?['"]|\))/g;
  let match;
  const routes = [];
  
  while ((match = methodRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let path = match[2];
    
    // Nettoyer le path
    if (path === ')') {
      path = ''; // Endpoint sans path spécifique
    } else {
      path = path.replace(/['"]/g, '');
    }
    
    const fullPath = `/${basePath}${path}`.replace(/\/+/g, '/');
    routes.push({ method, path: fullPath });
  }
  
  if (routes.length > 0) {
    endpoints.push({
      module: moduleName,
      controller: file.split('/').pop().replace('.ts', ''),
      basePath: `/${basePath}`,
      routes,
    });
  }
});

// Vérifier quels modules ont des tests E2E
const e2eFiles = execSync('find src -name "*.e2e*.ts" -o -name "*.e2e*.test.ts"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .map(f => {
    const moduleName = f.split('/')[1]; // src/auth/... → auth
    return moduleName;
  });

const e2eModules = new Set(e2eFiles);

// Générer le README
let readme = `# 📚 OneFive Backend - API Endpoints & E2E Test Coverage

> **Dernière mise à jour:** ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}

## 📊 Vue d'ensemble

- **Total Modules:** ${endpoints.length}
- **Total Endpoints:** ${endpoints.reduce((sum, e) => sum + e.routes.length, 0)}
- **Modules avec E2E:** ${e2eModules.size}
- **Modules sans E2E:** ${endpoints.length - e2eModules.size}

---

## 🗺️ Endpoints par Module

`;

endpoints.forEach(({ module, controller, basePath, routes }) => {
  const hasE2E = e2eModules.has(module);
  const statusIcon = hasE2E ? '✅' : '❌';
  
  readme += `\n### ${statusIcon} \`${module}\` - ${controller}\n`;
  readme += `**Base Path:** \`${basePath}\`\n\n`;
  readme += `**E2E Tests:** ${hasE2E ? '✅ Présents' : '❌ Manquants'}\n\n`;
  readme += `| Méthode | Endpoint | E2E |\n`;
  readme += `|---------|----------|-----|\n`;
  
  routes.forEach(({ method, path }) => {
    const checkbox = hasE2E ? '✅' : '⬜';
    readme += `| \`${method.padEnd(6)}\` | \`${path}\` | ${checkbox} |\n`;
  });
  
  readme += `\n`;
});

readme += `---

## 📈 Statistiques Détaillées

### Modules avec E2E Tests (${e2eModules.size})

`;

endpoints
  .filter(({ module }) => e2eModules.has(module))
  .forEach(({ module, routes }) => {
    readme += `- ✅ **${module}** (${routes.length} endpoints)\n`;
  });

readme += `\n### Modules sans E2E Tests (${endpoints.length - e2eModules.size})\n\n`;

endpoints
  .filter(({ module }) => !e2eModules.has(module))
  .forEach(({ module, routes }) => {
    readme += `- ❌ **${module}** (${routes.length} endpoints)\n`;
  });

readme += `\n---

## 🎯 Prochaines Étapes

### Priorité Haute (Core Features)
- [ ] Réactiver les tests E2E skippés dans auth (OAuth, SMS, Email)
- [ ] Compléter les tests E2E de profile (18 tests skippés)
- [ ] Ajouter E2E pour post (endpoints critiques)
- [ ] Ajouter E2E pour discussion (endpoints critiques)

### Priorité Moyenne
- [ ] Ajouter E2E pour network
- [ ] Ajouter E2E pour education
- [ ] Ajouter E2E pour experience
- [ ] Ajouter E2E pour follows

### Priorité Basse
- [ ] Dataroom E2E (skippé car dépendances complexes)
- [ ] Spotlight E2E (skippé car dépendances complexes)
- [ ] Messaging E2E (WebSocket - nécessite setup spécial)

---

## 🛠️ Outils Disponibles

### Helpers de test
\`\`\`typescript
import { validPassword, createUniqueEmail, validProfileData, createProfileData } from '../../test/helpers/fixtures';
\`\`\`

### Scripts
\`\`\`bash
# Fixer les tests E2E automatiquement
node scripts/fix-e2e-tests.js

# Fix massif de tous les E2E
node scripts/mega-fix-e2e.js

# Lancer les tests E2E
NODE_ENV=test npx jest --testPathPattern="e2e" --forceExit --runInBand
\`\`\`

---

## 📝 Notes

- **Tests E2E utilisent Testcontainers** : Docker requis
- **Format de réponse unifié** : \`{ success, data/error }\`
- **Validation stricte** : Passwords complexes, emails uniques
- **Setup temps** : ~70s pour tous les E2E (Testcontainers + migrations)

---

**Généré automatiquement par \`scripts/generate-endpoints-readme.js\`**
`;

// Sauvegarder
fs.writeFileSync('E2E-ENDPOINTS.md', readme);
console.log(`\n✅ README généré: E2E-ENDPOINTS.md`);
console.log(`\n📊 Résumé:`);
console.log(`   - ${endpoints.length} modules`);
console.log(`   - ${endpoints.reduce((sum, e) => sum + e.routes.length, 0)} endpoints`);
console.log(`   - ${e2eModules.size} modules avec E2E`);
console.log(`   - ${endpoints.length - e2eModules.size} modules sans E2E`);
