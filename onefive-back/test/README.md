# Tests OneFive Backend

Ce document explique la stratégie de tests implémentée selon les règles Cursor.

## 🎯 Stratégie de Tests

### Tests E2E (End-to-End)
- **Cible** : Controllers
- **Obligatoire** : ✅ **Obligatoire** pour tous les controllers
- **Technologie** : Supertest + Testcontainers
- **Avantages** : Tests réels avec vraie base de données, validation complète des endpoints

### Tests Unitaires
- **Cible** : Handlers
- **Obligatoire** : ✅ **Obligatoire** pour tous les handlers
- **Technologie** : Jest + Mocks
- **Avantages** : Tests rapides, isolation parfaite, TDD facilité

### Tests de Services (Conditionnels)
- **Cible** : Services
- **Obligatoire** : ⚠️ **Conditionnel** (seulement si logique non-triviale)
- **Technologie** : Jest + Mocks
- **Critère** : Si le service contient de la logique métier complexe

## 📁 Structure des Tests

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.controller.e2e-spec.ts    # Tests E2E du controller
│   ├── auth.service.ts
│   ├── auth.service.spec.ts           # Tests unitaires du service (si nécessaire)
│   └── handlers/
│       ├── signup.handler.ts
│       └── signup.handler.spec.ts     # Tests unitaires du handler
└── profile/
    ├── profile.controller.ts
    ├── profile.controller.e2e-spec.ts # Tests E2E du controller
    └── handlers/
        ├── create-profile.handler.ts
        └── create-profile.handler.spec.ts # Tests unitaires du handler
```

## 🚀 Commandes de Test

### Exécuter tous les tests
```bash
npm test
```

### Exécuter seulement les tests unitaires
```bash
npm run test:unit
```

### Exécuter seulement les tests E2E
```bash
npm run test:e2e
```

### Exécuter les tests en mode watch
```bash
npm run test:watch
```

### Exécuter avec couverture de code
```bash
npm run test:cov
```

## 🧪 Exemples de Tests

### Test E2E (Controller)
```typescript
describe('AuthController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;
  });

  it('should create a new user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### Test Unitaire (Handler)
```typescript
describe('SignupHandler', () => {
  let handler: SignupHandler;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignupHandler,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();
    
    handler = module.get<SignupHandler>(SignupHandler);
  });

  it('should create user and session successfully', async () => {
    // Arrange
    usersService.create.mockResolvedValue(mockUser);
    
    // Act
    const result = await handler.execute({ transactionId, email, password });
    
    // Assert
    expect(result.sessionId).toBeDefined();
    expect(usersService.create).toHaveBeenCalledWith(expectedData);
  });
});
```

## 🔧 Configuration

### Testcontainers (E2E)
- PostgreSQL avec PostGIS
- Base de données isolée par test
- Schema Prisma généré automatiquement

### Jest (Unitaires)
- Mocks automatiques pour bcrypt, uuid, crypto
- Setup/teardown automatique
- Timeout configuré à 10s

## 📊 Couverture de Code

Les tests visent une couverture de :
- **Controllers** : 100% des endpoints (E2E)
- **Handlers** : 100% de la logique métier (Unitaires)
- **Services** : Selon la complexité (Unitaires conditionnels)

## 🛠️ Utilitaires de Test

### Helpers disponibles
```typescript
import { 
  createMockLogger, 
  createMockUser, 
  createMockSession,
  createMockProfile,
  TestData 
} from '../test/utils/test-helpers';
```

### Données de test communes
```typescript
TestData.validEmail()      // 'test@example.com'
TestData.invalidEmail()    // 'invalid-email'
TestData.validPassword()   // 'password123'
TestData.validUUID()       // UUID valide
TestData.validDate()       // Date ISO valide
```

## ⚠️ Bonnes Pratiques

### Tests E2E
- ✅ Toujours tester les cas de succès ET d'erreur
- ✅ Valider les réponses API standardisées `{ success: true, data: ... }`
- ✅ Tester la validation des DTOs (champs manquants, invalides)
- ✅ Tester l'authentification (endpoints protégés vs publics)

### Tests Unitaires
- ✅ Mocker toutes les dépendances externes
- ✅ Tester tous les cas de succès et d'erreur
- ✅ Vérifier les appels aux services avec les bons paramètres
- ✅ Tester le logging avec `@Log()` decorator

### Général
- ✅ Un test par cas d'usage
- ✅ Noms de tests descriptifs
- ✅ Arrange-Act-Assert pattern
- ✅ Nettoyer les mocks entre les tests

## 🐛 Debugging

### Tests E2E qui échouent
```bash
# Voir les logs détaillés
DEBUG=* npm run test:e2e

# Debug avec breakpoints
npm run test:debug
```

### Tests unitaires qui échouent
```bash
# Mode verbose
npm run test:unit -- --verbose

# Tests spécifiques
npm run test:unit -- --testNamePattern="SignupHandler"
```

## 📈 Métriques

### Objectifs de qualité
- **Temps d'exécution** : < 30s pour tous les tests
- **Couverture** : > 80% pour les handlers, > 90% pour les controllers
- **Fiabilité** : 0% de tests flaky

### Monitoring
```bash
# Voir la couverture détaillée
npm run test:cov
open coverage/lcov-report/index.html
```

---

## 🎯 Tests de Flows (Scénarios E2E)

En plus des tests E2E par controller, le projet inclut des **tests de flows** qui valident des parcours utilisateurs complets. Consultez `FLOWS-TESTS.md` pour plus de détails.

### Fichiers de Flows Disponibles

- ✅ `test/e2e/flows/auth.flows.e2e-spec.ts` - Flows d'authentification
- ✅ `test/e2e/flows/startup.flows.e2e-spec.ts` - Flows de création de startup
- ✅ `test/e2e/flows/social.flows.e2e-spec.ts` - Flows sociaux
- ✅ `test/e2e/flows/discussion.flows.e2e-spec.ts` - Flows de discussions
- ✅ `test/e2e/flows/messaging.flows.e2e-spec.ts` - Flows de messagerie
- ✅ `test/e2e/flows/dataroom.flows.e2e-spec.ts` - Flows de dataroom
- ✅ `test/e2e/flows/referral.flows.e2e-spec.ts` - Flows de référencement

### Lancer les Tests de Flows

```bash
# Tous les flows
NODE_ENV=test npx jest --testPathPattern="flows.*e2e" --forceExit --runInBand

# Un flow spécifique
NODE_ENV=test npx jest --testPathPattern="auth.flows" --forceExit --runInBand
```

### Documentation Complète

- `FLOWS-TESTS.md` - Guide complet des tests de flows
- `FLOWS-VERIFICATION.md` - Rapport de vérification et corrections

---

**Note** : Cette stratégie de tests respecte parfaitement les règles Cursor définies pour l'architecture monolithique OneFive.