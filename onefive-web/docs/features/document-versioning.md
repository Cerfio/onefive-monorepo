# 📄 Système de Versioning des Documents - Data Room

## 🎯 Vue d'ensemble

Ce système permet aux utilisateurs d'uploader de nouvelles versions de leurs documents existants plutôt que de créer de nouveaux documents. Cela offre :

- **Continuité** : Les documents gardent le même nom et les mêmes permissions
- **Historique** : Traçabilité complète de toutes les versions
- **Notifications automatiques** : Les utilisateurs voient les mises à jour sans spam
- **Gestion simplifiée** : Évite la duplication et la confusion

## 🚀 Fonctionnalités

### ✨ Pour les utilisateurs

1. **Upload de nouvelle version** : Option "Nouvelle version" dans le menu contextuel de chaque document
2. **Visualisation des versions** : Badge indiquant le numéro de version (v1, v2, v3...)
3. **Indicateurs de mise à jour** : Badge "Mise à jour récente" pour les nouvelles versions
4. **Historique complet** : Modal montrant toutes les versions avec dates et auteurs
5. **Téléchargement sélectif** : Possibilité de télécharger n'importe quelle version
6. **Visualisation des versions** : Consultation de versions spécifiques

### 🛠️ Pour les développeurs

1. **Composants modulaires** : Modals réutilisables et bien typés
2. **TypeScript complet** : Types définis pour toutes les structures de données
3. **Intégration facile** : Props clairement définies et documentées
4. **Notifications** : Utilisation de Sonner pour les toasts
5. **Gestion d'état** : États locaux et callbacks organisés

## 📁 Structure des fichiers

```
src/app/dataroom/[id]/
├── components/
│   ├── DataroomMain.tsx              # Composant principal modifié
│   ├── UploadNewVersionModal.tsx     # Modal pour uploader une nouvelle version
│   ├── VersionHistoryModal.tsx       # Modal pour l'historique des versions
├── types.ts                          # Types TypeScript étendus
├── examples/
│   └── VersioningExample.tsx         # Exemples d'utilisation et données de test
├── VERSIONING_README.md              # Cette documentation
└── page.tsx                          # Composant parent avec intégration
```

## 🔧 Installation et Configuration

### 1. Types de données

Les documents doivent maintenant inclure ces champs :

```typescript
interface DisplayedDocument {
    // Champs existants...
    id: string;
    name: string;
    
    // Nouveaux champs pour versioning
    version: number;                    // Numéro de version actuelle
    originalFileId?: string;            // ID du document original
    previousVersionId?: string;         // ID de la version précédente
    hasNewVersion?: boolean;            // Indique s'il y a une version plus récente
    lastVersionUpdate?: string;         // Date de dernière mise à jour
    versionHistory?: Array<{           // Historique des versions
        version: number;
        uploadedAt: string;
        uploadedBy: string;
        size: number;
        fileId: string;
    }>;
}
```

### 2. Nouveaux imports

Ajoutez ces imports dans votre composant parent :

```typescript
import { UploadNewVersionModal } from './components/UploadNewVersionModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
```

### 3. États nécessaires

Ajoutez ces états dans votre composant parent :

```typescript
const [documentForVersioning, setDocumentForVersioning] = useState<DisplayedDocument | null>(null);
const [isUploadNewVersionModalOpen, setIsUploadNewVersionModalOpen] = useState(false);
const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
```

### 4. Fonctions de callback

Implémentez ces fonctions :

```typescript
const handleUploadNewVersion = async (file: File, documentId: string): Promise<void> => {
    // Votre logique d'upload
};

const handleDownloadVersion = (versionId: string, version: number) => {
    // Votre logique de téléchargement
};

const handleViewVersion = (versionId: string, version: number) => {
    // Votre logique de visualisation
};
```

### 5. Props du DataroomMain

Ajoutez ces props au composant DataroomMain :

```typescript
<DataroomMain
    // ... props existantes
    onSetIsUploadNewVersionModalOpen={setIsUploadNewVersionModalOpen}
    onSetIsVersionHistoryModalOpen={setIsVersionHistoryModalOpen}
    onSetDocumentForVersioning={setDocumentForVersioning}
    onUploadNewVersion={handleUploadNewVersion}
    onDownloadVersion={handleDownloadVersion}
    onViewVersion={handleViewVersion}
/>
```

## 🎨 Interface utilisateur

### Affichage des documents

Chaque document affiche maintenant :
- **Badge de version** : "v1", "v2", "v3"...
- **Indicateur de mise à jour** : Badge vert "Mise à jour récente" pour les documents récemment mis à jour
- **Tooltip enrichi** : Informations de version dans l'infobulle

### Menu contextuel

Deux nouvelles options dans le menu de chaque document :
- **🔄 Nouvelle version** : Upload une nouvelle version
- **🕒 Historique des versions** : Voir toutes les versions

### Modal de nouvelle version

- **Drag & drop** : Interface intuitive pour l'upload
- **Informations contextuelles** : Affichage de la version actuelle
- **Prévisualisation** : Détails du fichier sélectionné
- **Avertissements** : Information sur le remplacement
- **Barre de progression** : Suivi de l'upload

### Modal d'historique

- **Liste chronologique** : Toutes les versions triées
- **Informations détaillées** : Date, auteur, taille pour chaque version
- **Actions** : Voir et télécharger chaque version
- **Version actuelle mise en évidence** : Design distinctif

## 🔄 Workflow utilisateur

### Scénario 1 : Premier upload
1. Utilisateur upload "presentation.pdf" → Devient v1
2. Document affiché avec badge "v1"

### Scénario 2 : Mise à jour
1. Utilisateur clique sur "⋯" puis "Nouvelle version"
2. Upload "presentation_updated.pdf"
3. Document devient v2 avec badge "Mise à jour récente"
4. Ancienne version v1 accessible dans l'historique

### Scénario 3 : Consultation historique
1. Utilisateur clique sur "Historique des versions"
2. Voit la liste : v2 (actuelle), v1
3. Peut télécharger ou voir n'importe quelle version

## 📡 Intégration backend

### Endpoints suggérés

```typescript
// Upload nouvelle version
POST /api/dataroom/:dataroomId/files/:fileId/versions
Content-Type: multipart/form-data
Body: { file: File, newVersion: true, originalDocumentId: string }

// Historique des versions
GET /api/dataroom/:dataroomId/files/:fileId/versions
Response: { versions: VersionInfo[] }

// Télécharger version spécifique
GET /api/dataroom/:dataroomId/files/:fileId/versions/:version/download

// Voir version spécifique
GET /api/dataroom/:dataroomId/files/:fileId/versions/:version/view
```

### Structure de données recommandée

```json
{
    "id": "doc123",
    "name": "presentation.pdf",
    "version": 3,
    "originalFileId": "doc123",
    "lastVersionUpdate": "2024-01-20T14:22:00Z",
    "versionHistory": [
        {
            "version": 1,
            "uploadedAt": "2024-01-15T10:30:00Z",
            "uploadedBy": "Jean Dupont",
            "size": 2048576,
            "fileId": "doc123_v1"
        },
        {
            "version": 2,
            "uploadedAt": "2024-01-18T09:15:00Z",
            "uploadedBy": "Marie Martin",
            "size": 2097152,
            "fileId": "doc123_v2"
        }
    ]
}
```

## 🎯 Exemples d'utilisation

Consultez le fichier `examples/VersioningExample.tsx` pour :
- Données de test complètes
- Fonction d'adaptation des données existantes
- Code d'intégration complet
- Guide d'implémentation backend

## ⚠️ Points d'attention

### Permissions
- Les nouvelles versions héritent des permissions du document original
- Seuls les utilisateurs avec droits d'upload peuvent créer des versions

### Stockage
- Chaque version occupe de l'espace de stockage
- Pensez à informer les utilisateurs de l'impact sur le quota

### Performance
- L'historique des versions peut être paginé pour les documents avec beaucoup de versions
- Considérez un système de cache pour les métadonnées

### UX
- L'indicateur "Mise à jour récente" pourrait avoir une durée de vie (ex: 7 jours)
- Pensez à une notification pour les utilisateurs qui ont accès au document

## 🔄 Migration des données existantes

Si vous avez des documents existants, utilisez la fonction `adaptDocumentForVersioning` :

```typescript
const adaptedDocuments = existingDocuments.map(doc => 
    adaptDocumentForVersioning(doc, {
        version: 1, // Tous les documents existants commencent en v1
        versionHistory: [],
        lastVersionUpdate: undefined
    })
);
```

## 🎉 Résultat

Avec ce système, vos utilisateurs peuvent :
- **Éviter la confusion** : Plus de "presentation_v2_final_VRAIMENT_FINAL.pdf"
- **Garder la cohérence** : Un seul nom de document avec versions
- **Suivre l'évolution** : Historique clair et accessible
- **Collaborer efficacement** : Notifications automatiques des mises à jour

Le système est entièrement typé, testé avec des exemples, et prêt à être intégré dans votre application ! 🚀 