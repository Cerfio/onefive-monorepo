# Propositions de Modals pour la Gestion des Fondateurs

## Problèmes actuels identifiés
- ✅ Modal trop étroite (max-w-6xl)
- ✅ Tableau pas entièrement visible
- ✅ Actions de suppression/ajout peu visibles
- ✅ Flow pas optimal pour ajouter des personnes (OneFive ou non)

---

## Proposition 1 : Modal Pleine Largeur avec Tableau Amélioré ⭐ (Recommandé)

### Concept
Modal presque pleine largeur avec un tableau amélioré et des actions plus visibles.

### Caractéristiques
- **Largeur** : `max-w-[95vw]` ou `w-[calc(100vw-4rem)]` (presque pleine largeur)
- **Structure** :
  - Header fixe avec titre et bouton "Ajouter un fondateur" proéminent
  - Zone de recherche en haut (toujours visible)
  - Tableau scrollable avec colonnes : Avatar | Nom | Email | Rôle | Parts (%) | Actions
  - Footer fixe avec total des parts et boutons d'action
- **Actions** :
  - Bouton "Ajouter" dans le header (plus visible)
  - Bouton supprimer sur chaque ligne (plus visible avec icône + texte)
  - Badge YC visible dans la colonne "Nom" si applicable

### Avantages
- ✅ Plus d'espace pour voir toutes les colonnes
- ✅ Actions clairement visibles
- ✅ Flow simple et intuitif
- ✅ Cohérent avec les autres modals larges (CapTableModal)

### Inconvénients
- ⚠️ Peut être trop large sur petits écrans (nécessite responsive)

---

## Proposition 2 : Modal avec Vue en Cartes/Liste

### Concept
Remplacer le tableau par des cartes empilées verticalement, plus facile à parcourir.

### Caractéristiques
- **Largeur** : `max-w-4xl` ou `max-w-5xl`
- **Structure** :
  - Header avec recherche et bouton "Ajouter"
  - Liste scrollable de cartes (une par fondateur)
  - Chaque carte contient : Avatar + Nom + Email | Rôle (dropdown) | Parts (input) | Bouton supprimer
  - Footer avec total et actions
- **Design des cartes** :
  - Bordure subtile, hover effect
  - Badge YC visible si applicable
  - Layout responsive (stack sur mobile)

### Avantages
- ✅ Plus lisible sur mobile
- ✅ Plus d'espace pour chaque élément
- ✅ Meilleure UX pour éditer les informations
- ✅ Plus facile d'ajouter des détails (email, etc.)

### Inconvénients
- ⚠️ Moins compact qu'un tableau
- ⚠️ Difficile de comparer les parts rapidement

---

## Proposition 3 : Modal avec Sidebar pour Ajouter

### Concept
Modal avec une sidebar qui s'ouvre pour ajouter un nouveau fondateur.

### Caractéristiques
- **Largeur principale** : `max-w-7xl`
- **Structure** :
  - Zone principale : Tableau des fondateurs existants
  - Sidebar droite (slide-in) : Formulaire pour ajouter un fondateur
  - Bouton "Ajouter un fondateur" ouvre/ferme la sidebar
- **Sidebar contient** :
  - Recherche OneFive
  - Champ email pour inviter
  - Formulaire : Nom, Rôle, Parts
  - Bouton "Ajouter" qui ferme la sidebar et ajoute au tableau

### Avantages
- ✅ Séparation claire entre vue et édition
- ✅ Plus d'espace pour le formulaire d'ajout
- ✅ Peut être réutilisé pour éditer un fondateur existant

### Inconvénients
- ⚠️ Plus complexe à implémenter
- ⚠️ Nécessite une gestion d'état supplémentaire

---

## Proposition 4 : Modal avec Formulaire Inline par Ligne

### Concept
Chaque ligne du tableau devient éditable directement, avec un mode "édition" par ligne.

### Caractéristiques
- **Largeur** : `max-w-7xl`
- **Structure** :
  - Tableau avec lignes éditables
  - Mode "Vue" : Affichage simple avec bouton "Modifier"
  - Mode "Édition" : Inputs visibles directement dans la ligne
  - Bouton "Ajouter une ligne" en bas du tableau
- **Interactions** :
  - Clic sur "Modifier" → la ligne passe en mode édition
  - Boutons "Sauvegarder" / "Annuler" apparaissent
  - Nouvelle ligne ajoutée en mode édition par défaut

### Avantages
- ✅ Édition contextuelle (on voit ce qu'on modifie)
- ✅ Pas besoin de sidebar ou modal secondaire
- ✅ Flow rapide pour petites modifications

### Inconvénients
- ⚠️ Peut être confus si plusieurs lignes en édition
- ⚠️ Nécessite une gestion d'état complexe

---

## Proposition 5 : Modal avec Vue en Deux Colonnes (Liste + Formulaire)

### Concept
Split-screen : liste à gauche, formulaire d'édition/ajout à droite.

### Caractéristiques
- **Largeur** : `max-w-[95vw]`
- **Structure** :
  - Colonne gauche (40%) : Liste scrollable des fondateurs avec recherche
  - Colonne droite (60%) : Formulaire pour ajouter/éditer le fondateur sélectionné
  - Séparateur vertical redimensionnable (optionnel)
- **Interactions** :
  - Clic sur un fondateur → formulaire se remplit à droite
  - Bouton "Nouveau fondateur" → formulaire vide à droite
  - Sauvegarde → mise à jour de la liste à gauche

### Avantages
- ✅ Vue d'ensemble + édition détaillée simultanées
- ✅ Beaucoup d'espace pour le formulaire
- ✅ Flow très clair

### Inconvénients
- ⚠️ Nécessite beaucoup d'espace horizontal
- ⚠️ Peut être trop sur mobile (nécessite responsive)

---

## Proposition 6 : Modal avec Drag & Drop pour Réorganiser

### Concept
Modal avec liste réorganisable par drag & drop, utile si l'ordre a de l'importance.

### Caractéristiques
- **Largeur** : `max-w-5xl`
- **Structure** :
  - Liste avec drag handles
  - Réorganisation par glisser-déposer
  - Bouton "Ajouter" en haut
  - Modal d'ajout séparée (plus simple) qui s'ouvre au-dessus
- **Modal d'ajout** :
  - Recherche OneFive + Email
  - Formulaire compact : Nom, Rôle, Parts
  - Bouton "Ajouter" qui ferme et ajoute à la liste

### Avantages
- ✅ Permet de réorganiser l'ordre
- ✅ Modal d'ajout simple et focalisée
- ✅ Bonne UX si l'ordre est important

### Inconvénients
- ⚠️ Drag & drop peut être confus pour certains utilisateurs
- ⚠️ Nécessite une bibliothèque (react-beautiful-dnd ou dnd-kit)

---

## Recommandation Finale : Proposition 1 (Modal Pleine Largeur) + Améliorations

### Implémentation suggérée

```tsx
// Structure proposée
<DialogContent className="max-w-[95vw] w-[calc(100vw-4rem)] max-h-[90vh] overflow-hidden flex flex-col p-0">
  {/* Header fixe */}
  <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b flex-row items-center justify-between">
    <DialogTitle>Gérer les fondateurs et leurs parts</DialogTitle>
    <Button onClick={handleAddNew}>
      <Plus className="w-4 h-4 mr-2" />
      Ajouter un fondateur
    </Button>
  </DialogHeader>

  {/* Zone de recherche fixe */}
  <div className="flex-shrink-0 p-6 pb-4 border-b">
    <SmartProfileSearch ... />
  </div>

  {/* Tableau scrollable */}
  <div className="flex-1 overflow-y-auto">
    <table className="w-full">
      <thead className="sticky top-0 bg-white z-10">
        <tr>
          <th>Membre</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Parts (%)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Lignes avec badge YC visible */}
      </tbody>
    </table>
  </div>

  {/* Footer fixe */}
  <div className="flex-shrink-0 p-6 border-t flex justify-between items-center">
    <div>Total: X% / 100%</div>
    <div className="flex gap-3">
      <Button variant="outline">Annuler</Button>
      <Button>Enregistrer</Button>
    </div>
  </div>
</DialogContent>
```

### Améliorations spécifiques
1. **Colonne Email visible** : Afficher l'email dans une colonne séparée
2. **Badge YC** : Visible dans la colonne "Membre" avec icône
3. **Bouton Ajouter proéminent** : Dans le header, toujours visible
4. **Bouton Supprimer amélioré** : Icône + texte "Supprimer" ou au moins tooltip clair
5. **Header sticky** : Les en-têtes du tableau restent visibles au scroll
6. **Responsive** : Sur mobile, passer en vue cartes

---

## Comparaison Rapide

| Proposition | Largeur | Complexité | Mobile | Actions Visibles | Note |
|------------|---------|------------|--------|------------------|------|
| 1. Pleine largeur | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **9/10** |
| 2. Cartes | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 8/10 |
| 3. Sidebar | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 7/10 |
| 4. Inline edit | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 6/10 |
| 5. Deux colonnes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 7/10 |
| 6. Drag & drop | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 6/10 |

---

## Prochaines Étapes

1. **Choisir une proposition** (recommandation : Proposition 1)
2. **Créer un mockup/wireframe** si nécessaire
3. **Implémenter la solution choisie**
4. **Tester sur différents écrans** (desktop, tablette, mobile)
5. **Itérer selon les retours**




