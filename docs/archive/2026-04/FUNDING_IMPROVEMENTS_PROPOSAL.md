# Propositions d'améliorations - Section Financement

## Contexte
Améliorer la section financement de la page startup pour la rendre plus simple et intuitive.

---

## 1. Historique des financements ✅ VALIDÉ (a)
**Décision : Garder l'historique tel quel**

L'historique permet de tracer tous les financements passés avec :
- Date de la levée
- Montant levé
- Valorisation (optionnel)
- Tour (Love Money, Preseed, Seed, Series A, etc.)

---

## 2. Total levé 🔄 EN DISCUSSION (b - calcul automatique)
**Proposition : Calculer automatiquement à partir de l'historique**

### Option A : Input manuel
```
Total levé: [500000€] (input manuel)
```
- Avantage : Flexibilité totale
- Inconvénient : Risque d'incohérence avec l'historique

### Option B : Calcul automatique ✅ CHOISIE
```
Total levé: 1.2M€ (calculé : 500K€ + 300K€ + 400K€)
```
- Avantage : Toujours cohérent avec l'historique
- Inconvénient : Pas de flexibilité (mais c'est voulu)

**Implémentation :**
- Calculer automatiquement la somme de tous les montants dans l'historique
- Afficher en format lisible (K€, M€)
- Champ en lecture seule (pas d'édition manuelle)

---

## 3. Investisseurs ❓ À CLARIFIER

### Option A : Liste mixte (strings + profils OneFive)
```typescript
investisseurs: [
  { type: "profile", profileId: "123", name: "Jean Dupont" },  // Membre OneFive
  { type: "text", name: "Sequoia Capital" }                     // Texte libre
]
```

**Fonctionnement :**
- Champ de recherche intelligent (comme TeamStep)
- Si trouvé sur OneFive → ajoute comme profil lié (avec avatar)
- Si email/non trouvé → ajoute comme texte libre
- Affichage :
  - Profil OneFive : Avatar + Nom (cliquable vers profil)
  - Texte libre : Badge simple avec le nom

**Avantages :**
- Valorise l'écosystème OneFive
- Permet de suivre les connexions entre startups et investisseurs
- Toujours flexible (texte libre possible)

### Option B : Liste simple de strings (actuel)
```typescript
investisseurs: ["Jean Dupont", "Sequoia Capital", "BPI France"]
```

**Fonctionnement :**
- Input simple, ajoute des noms en texte
- Pas de lien avec les profils OneFive
- Affichage : Badges simples

**Avantages :**
- Plus simple à implémenter
- Pas de complexité de recherche
- Plus rapide à remplir

### 🔍 Quelle différence ?
- **Option A** : Recherche intelligente + liens vers profils OneFive (comme pour les co-fondateurs)
- **Option B** : Simple liste de noms en texte (pas de liens, pas de recherche)

---

## 4. Type de financement (structured/rolling/none) ✅ VALIDÉ (b)
**Décision : Garder en backend, ne plus afficher dans l'interface**

**Actions :**
- Supprimer du modal `EditFundingModal`
- Supprimer de l'affichage `FundingCard`
- Garder dans le schéma backend (pour compatibilité future)
- Mettre valeur par défaut à "none"

---

## Résumé des modifications à faire (Frontend uniquement)

### FundingCard.tsx
- ✅ Afficher l'historique (déjà fait)
- 🔄 Calculer et afficher le total automatiquement
- 🔄 Supprimer l'affichage du type de financement (structured/rolling)
- ❓ Améliorer l'affichage des investisseurs (selon choix option A ou B)

### EditFundingModal.tsx
- 🔄 Supprimer le champ "Type de financement"
- 🔄 Supprimer les sections "Levée structurée" et "Investissement continu"
- 🔄 Transformer "Total levé" en champ lecture seule calculé
- ❓ Améliorer le champ "Investisseurs" (selon choix option A ou B)

### EditFundingHistoryModal.tsx
- ✅ Déjà créé et fonctionnel
- Permet d'ajouter/modifier/supprimer des entrées d'historique

---

## Question à clarifier

**Pour les investisseurs (point 3), préférez-vous :**

- **Option A** : Système intelligent avec recherche de profils OneFive
  - Recherche comme pour les co-fondateurs
  - Affichage avec avatars pour les membres OneFive
  - Possibilité de cliquer pour voir le profil
  - Toujours possible d'ajouter du texte libre

- **Option B** : Système simple actuel
  - Juste ajouter des noms en texte
  - Badges simples sans liens
  - Plus rapide à remplir

**Recommandation :** Option A pour valoriser l'écosystème OneFive et créer du lien entre startups et investisseurs.




