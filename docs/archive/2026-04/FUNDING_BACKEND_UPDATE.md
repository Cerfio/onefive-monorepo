# Mise à jour Backend - Funding History

## Résumé des modifications

Ce document récapitule les modifications apportées au backend et frontend pour améliorer la gestion des investisseurs et des rounds de financement.

## Modifications Frontend

### 1. InvestorSearch Component (`onefive-front/src/components/startup/InvestorSearch.tsx`)

#### Style de la bannière d'ajout manuel
- **Avant** : Bannière bleue (`border-blue-200 bg-blue-50/50`)
- **Après** : Bannière grise neutre (`border-gray-200 bg-gray-50/50`)
- Icônes et textes en gris au lieu de bleu pour un look plus discret

#### Champ "Site web" → "Nom de domaine"
- **Avant** : Label "Site web (optionnel)" avec placeholder `https://...`
- **Après** : Label "Nom de domaine (optionnel)" avec placeholder `exemple.com`

#### Récupération automatique du logo
- Fonction `extractDomain()` : nettoie l'input utilisateur (supprime `http://`, `https://`, `www.`, etc.)
- Fonction `getLogoFromDomain()` : génère l'URL du logo via DuckDuckGo Icons (`https://icons.duckduckgo.com/ip3/${domain}.ico`)
- `useEffect` qui met à jour automatiquement le logo quand le domaine change
- Affichage d'un aperçu du logo détecté sous le champ de saisie

#### État du composant
```typescript
const [manualCompany, setManualCompany] = useState({
  name: '',
  domain: '',  // nouveau : remplace 'website'
  logo: '',    // nouveau : URL du logo auto-généré
});
```

### 2. NotesStep Component (`onefive-front/src/components/startup/modals/steps/NotesStep.tsx`)

#### Texte du bouton
- **Avant** : `data?.notes ? 'Mettre à jour' : 'Ajouter ce financement'`
- **Après** : `data?.notes ? 'Créer le round' : 'Ajouter ce financement'`

## Modifications Backend

### 1. Schéma Prisma (`onefive-back/prisma/schema/profile.prisma`)

#### Nouveau enum ProfileRole
```prisma
enum ProfileRole {
  FOUNDER
  BUSINESS_ANGEL
  VENTURE_CAPITALIST
  INSTITUTIONAL_INVESTOR
  MENTOR
  STRATEGIC_ADVISOR
  STUDENT_ENTREPRENEUR
  SERVICE_PROVIDER
  MEDIA
  INCUBATOR_ACCELERATOR
  RECRUITER_HR
  OTHER
}
```

#### Modèle StartupFundingHistory mis à jour
```prisma
model StartupFundingHistory {
  id         String   @id @default(uuid())
  startup    Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)
  startupId  String

  date        DateTime
  amountRaised Float
  valuation   Float?
  round       StartupFundingRound
  
  // Nouveaux champs
  investors   Json?       // Array de FundingInvestor
  leadInvestor String?     // ID de l'investisseur principal
  instrument  String?     // SAFE, BSA_AIR, EQUITY, etc.
  notes       String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([startupId])
  @@index([date])
}
```

### 2. DTOs (`onefive-back/src/startup/dto/funding-history.dto.ts`)

#### Nouveau DTO FundingInvestorDto
```typescript
export class FundingInvestorDto {
  @IsEnum(['person', 'company'])
  type: 'person' | 'company';

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

#### CreateFundingHistoryDto mis à jour
Ajout des champs :
- `investors?: FundingInvestorDto[]`
- `leadInvestor?: string`
- `instrument?: string`
- `notes?: string`

#### UpdateFundingHistoryDto mis à jour
Mêmes champs ajoutés en optionnel.

### 3. Service (`onefive-back/src/startup/startup.service.ts`)

#### `createFundingHistory()` mis à jour
- Accepte et enregistre les nouveaux champs `investors`, `leadInvestor`, `instrument`, `notes`
- Retourne tous les champs dans la réponse

#### `updateFundingHistory()` mis à jour
- Permet la mise à jour des nouveaux champs
- Gère correctement les valeurs `undefined` pour les champs optionnels

#### `getFundingHistory()` mis à jour
- Retourne tous les champs incluant `investors`, `leadInvestor`, `instrument`, `notes`

## Base de données

### Synchronisation
```bash
cd onefive-back
npx prisma generate
npx prisma db push
```

La base de données a été synchronisée avec succès avec le nouveau schéma.

## Structure des données Investors

Les investisseurs sont stockés en JSON dans la base de données avec la structure suivante :

```typescript
interface FundingInvestor {
  type: 'person' | 'company';
  id: string;
  name: string;
  avatar?: string;      // Pour les personnes
  logo?: string;        // Pour les entreprises
  website?: string;
  description?: string;
}
```

## Compatibilité

- ✅ Les anciennes entrées sans les nouveaux champs restent valides
- ✅ Les nouveaux champs sont optionnels
- ✅ Le frontend peut continuer à fonctionner sans ces champs
- ✅ Pas de breaking changes dans l'API

## Tests recommandés

1. **Frontend**
   - Ajouter un fonds avec un nom de domaine → vérifier que le logo s'affiche
   - Tester avec différents formats de domaine (http://, www., etc.)
   - Vérifier le bouton "Créer le round"

2. **Backend**
   - Créer un funding history avec des investisseurs
   - Mettre à jour un funding history existant
   - Récupérer l'historique et vérifier tous les champs
   - Tester avec des investisseurs de type "person" et "company"

3. **Intégration**
   - Flow complet : rechercher un investisseur → l'ajouter → créer le round
   - Vérifier que les données sont correctement enregistrées
   - Vérifier l'affichage de l'historique avec les nouveaux champs

## Notes

- Le logo est récupéré via DuckDuckGo Icons (même service que `CompanyIcon` et `SaaSSelector`)
- L'enum `ProfileRole` a été ajouté au schéma Prisma pour résoudre une erreur existante
- La synchronisation a été faite avec `prisma db push` pour le développement (pas de migration créée)

