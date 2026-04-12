# Page Support OneFive

## 🎯 Vue d'ensemble

La page support OneFive est un centre d'aide complet qui permet aux utilisateurs de trouver rapidement des réponses à leurs questions, d'accéder à des ressources utiles et de contacter l'équipe support.

## 📁 Structure des fichiers

```
src/app/support/
├── components/
│   ├── ChatWidget.tsx          # Widget de chat (pour usage futur)
│   └── index.ts               # Export des composants
├── page.tsx                    # Page principale du support
├── layout.tsx                  # Layout avec métadonnées
└── README.md                   # Documentation
```

## ✨ Fonctionnalités

### 🔍 FAQ Interactive
- **Recherche en temps réel** : Filtrage des questions par mots-clés
- **Filtres par catégorie** : Datarooms, Analytics, Profil, etc.
- **Système de notation** : Les utilisateurs peuvent évaluer l'utilité des réponses
- **Tags contextuels** : Chaque FAQ est taggée pour une meilleure organisation

### 📚 Guides Pratiques
- **Guides étape par étape** : Tutoriels détaillés pour chaque fonctionnalité
- **Niveaux de difficulté** : Facile, Moyen, Avancé
- **Temps estimé** : Durée approximative pour chaque guide
- **Icônes contextuelles** : Identification visuelle rapide

### 💬 Support Direct
- **Contact Email** : support@onefive.app pour toute question
- **Discord communautaire** : Lien vers la communauté Discord OneFive (aussi accessible via la navbar)
- **Support 24/7** : Équipe disponible en permanence
- **Interface simple** : Contact direct sans formulaire complexe

## 🎨 Design et UX

### Cohérence avec l'écosystème OneFive
- **Palette de couleurs** : Utilisation des couleurs principales (#5E6AD2, #101828, #475467)
- **Composants shadcn/ui** : Cohérence avec le design system
- **Animations Framer Motion** : Transitions fluides et engageantes
- **Responsive design** : Adaptation parfaite sur tous les écrans

### Expérience utilisateur
- **Navigation intuitive** : Onglets clairs et organisation logique
- **Feedback visuel** : Toasts sonner pour les actions utilisateur
- **États de chargement** : Animations pendant les requêtes
- **Accessibilité** : Respect des standards d'accessibilité web

## 🚀 Utilisation

### Intégration dans le projet
La page support s'intègre naturellement dans l'écosystème OneFive :

```typescript
// Navigation vers la page support
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/support');
```

### Personnalisation des FAQs
```typescript
// Ajouter une nouvelle FAQ
const newFAQ: FAQItem = {
  id: 'new-faq',
  question: 'Comment faire X ?',
  answer: 'Pour faire X, vous devez...',
  category: 'dataroom',
  tags: ['débutant', 'guide'],
  helpful: 0,
  notHelpful: 0
};
```

### Configuration du Chat Widget
```typescript
// Personnaliser les réponses du bot
const botResponses = [
  "Réponse personnalisée 1",
  "Réponse personnalisée 2",
  // ... plus de réponses
];
```

## 🔧 Composants Techniques

### ChatWidget
Le widget de chat est un composant autonome qui offre :
- **Interface conversationnelle** : Bulles de message avec avatars
- **Indicateurs de statut** : En ligne, hors ligne, en train d'écrire
- **Réponses automatiques** : Simulation d'un bot intelligent
- **Minimisation/maximisation** : Contrôle de l'affichage
- **Responsive** : Adaptation mobile et desktop

### Gestion des États
```typescript
// États principaux de la page
const [activeTab, setActiveTab] = useState('faq');
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('all');
const [contactForm, setContactForm] = useState<ContactForm>({...});
```

## 📊 Analytics et Métriques

### Statistiques Affichées
- **Tickets résolus** : Nombre total de demandes traitées
- **Temps de réponse** : Moyenne du temps de première réponse
- **Satisfaction client** : Note moyenne des utilisateurs

### Animations des Chiffres
```typescript
// Animation progressive des statistiques
useEffect(() => {
  const timer = setTimeout(() => {
    setAnimatedStats({
      totalTickets: 1247,
      avgResponseTime: 2.4,
      satisfaction: 4.8
    });
  }, 500);
}, []);
```

## 🛠️ Extension et Maintenance

### Ajouter un Nouveau Service au Status
```typescript
const newService: ServiceStatus = {
  id: 'new-service',
  name: 'Nouveau Service',
  status: 'operational',
  description: 'Description du service',
  lastUpdated: new Date().toISOString()
};
```

### Créer un Nouveau Guide
```typescript
const newGuide: SupportGuide = {
  id: 'new-guide',
  title: 'Nouveau Guide',
  description: 'Description du guide',
  category: 'nouvelle-categorie',
  duration: '15 min',
  difficulty: 'moyen',
  tags: ['guide', 'tutoriel'],
  icon: BookOpen // Icône Lucide
};
```

### Personnaliser les Catégories de Contact
```typescript
const contactCategories = [
  { value: 'technical', label: 'Problème technique' },
  { value: 'billing', label: 'Facturation' },
  { value: 'feature', label: 'Demande de fonctionnalité' },
  // Ajouter de nouvelles catégories ici
];
```

## 🎯 Bonnes Pratiques

### Performance
- **Recherche optimisée** : Filtrage côté client pour une réactivité maximale
- **Lazy loading** : Chargement des ressources à la demande
- **Memoization** : Utilisation de useMemo pour les calculs coûteux

### Accessibilité
- **Navigation au clavier** : Support complet du clavier
- **Lecteurs d'écran** : Annotations ARIA appropriées
- **Contrastes** : Respect des ratios de contraste WCAG

### Maintenance
- **Code modulaire** : Composants réutilisables et bien organisés
- **Types TypeScript** : Typage strict pour éviter les erreurs
- **Documentation** : Commentaires et documentation inline

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- **Chat Widget** : Widget de chat en temps réel avec bot intelligent
- **Formulaire de contact** : Système de tickets avec catégorisation
- **Status des services** : Monitoring en temps réel des services OneFive
- **Ressources** : Documentation API, tutoriels vidéo, etc.
- **Recherche avancée** : Filtres multi-critères pour les FAQs
- **Base de connaissances** : Articles détaillés et tutoriels

### Améliorations Récentes
- **✅ Discord intégré** : Lien Discord ajouté dans la navbar pour un accès rapide
- **✅ Logo Discord officiel** : Utilisation du vrai logo Discord avec les couleurs officielles
- **✅ Support 24/7** : Suppression des horaires d'ouverture pour refléter la disponibilité continue

### Intégrations Possibles
- **Intercom/Zendesk** : Intégration avec des outils de support existants
- **Analytics** : Suivi des interactions utilisateur  
- **Notifications** : Alertes en temps réel sur les nouveaux tickets
- **IA** : Amélioration des réponses automatiques avec l'IA

## 📱 Responsive Design

La page support est entièrement responsive et s'adapte à tous les écrans :
- **Mobile** : Interface optimisée pour les petits écrans
- **Tablet** : Adaptation des grilles et des espacements
- **Desktop** : Exploitation maximale de l'espace disponible

## 🔒 Sécurité

### Protection des Données
- **Validation des formulaires** : Sanitization des entrées utilisateur
- **Gestion des erreurs** : Logging sécurisé des erreurs
- **Tokens CSRF** : Protection contre les attaques CSRF

Cette page support simplifiée offre une expérience utilisateur claire et efficace, focalisée sur l'essentiel : répondre aux questions des utilisateurs via FAQ, guides pratiques et contact direct. Parfaitement intégrée dans l'écosystème OneFive tout en restant facilement extensible pour de futures fonctionnalités (chat, formulaire de contact avancé, etc.). 