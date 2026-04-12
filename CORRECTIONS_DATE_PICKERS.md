# ✅ Corrections apportées aux Date Pickers

## 🐛 Problèmes corrigés

### 1. ✅ "Date invalide" au lieu de "Présent"

**Problème** : Quand "En cours" était coché, `formatExperienceDate()` essayait de parser une date invalide et retournait "Date invalide".

**Solution** : 
- Ajout d'une vérification `isNaN(date.getTime())` dans `formatExperienceDate()`
- Si la date est invalide, retourne "Présent" au lieu de "Date invalide"
- Ajout de logs `console.warn` pour débugger

**Fichier modifié** : `src/utils/dateUtils.ts`

```typescript
export function formatExperienceDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Présent';
  
  try {
    const date = new Date(isoString);
    
    // ✅ Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return 'Présent';
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', isoString, error);
    return 'Présent'; // ✅ Retourne "Présent" au lieu de "Date invalide"
  }
}
```

---

### 2. ✅ Utilisation du Checkbox d'Untitled UI

**Problème** : La checkbox "En cours" utilisait un input HTML standard au lieu du composant design system.

**Solution** : 
- Remplacé `<input type="checkbox">` par le composant `<Checkbox>` d'Untitled UI
- Import du composant depuis `@/components/base/checkbox/checkbox`
- Utilisation des props React Aria (`isSelected`, `onChange`, `isDisabled`)

**Fichier modifié** : `src/components/application/date-picker/month-year-picker.tsx`

**Avant** ❌ :
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={present}
    onChange={handlePresentToggle}
    disabled={isDisabled}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
  />
  <span className="text-sm text-gray-700 whitespace-nowrap">En cours</span>
</label>
```

**Après** ✅ :
```tsx
<Checkbox
  isSelected={present}
  onChange={handlePresentToggle}
  isDisabled={isDisabled}
  size="sm"
  label="En cours"
/>
```

**Avantages** :
- ✅ Design cohérent avec le reste de l'app
- ✅ Accessibilité améliorée (React Aria)
- ✅ Support du dark mode automatique
- ✅ Animations et états visuels

---

### 3. ✅ Afficher seulement la dernière expérience/éducation dans le ProfileHeader

**Problème** : Le ProfileHeader affichait potentiellement toutes les expériences/éducations, alors qu'il devrait afficher seulement la plus récente (celle en cours ou la dernière).

**Solution** : 
- Modification de `mapProfileToHeaderData()` pour créer deux versions des listes :
  - `mostRecentExperience` / `mostRecentEducation` : Seulement la première (pour le ProfileHeader)
  - `experienceList` / `educationList` : Toutes les entrées (pour le AboutCard)
- Le backend trie déjà par date décroissante (`orderBy: { from: 'desc' }`), donc `[0]` = la plus récente

**Fichiers modifiés** :
- `src/app/(protected)/profile/[id]/page.tsx`
- `src/components/profile/AboutCard.tsx`

**Changements dans `mapProfileToHeaderData()`** :

```typescript
// ✅ Pour le ProfileHeader : seulement la plus récente
const mostRecentExperience = profile.experiences?.[0] 
  ? [{
      id: profile.experiences[0].id,
      title: profile.experiences[0].title,
      company: profile.experiences[0].company,
      domain: profile.experiences[0].domain ?? profile.experiences[0].company,
      startDate: profile.experiences[0].startDate,
      endDate: profile.experiences[0].endDate ?? 'Present',
    }]
  : [];

// ✅ Pour AboutCard : toutes les expériences
const experienceList = profile.experiences?.map(exp => ({
  id: exp.id,
  title: exp.title,
  company: exp.company,
  domain: exp.domain ?? exp.company,
  startDate: exp.startDate,
  endDate: exp.endDate ?? 'Present',
})) ?? [];

return {
  // ...
  // ProfileHeader affiche seulement la plus récente
  experience: mostRecentExperience,
  education: mostRecentEducation,
  // AboutCard affiche toutes les expériences/éducations
  allExperiences: experienceList,
  allEducations: educationList,
  // ...
};
```

**Changements dans `AboutCard`** :

```typescript
export const AboutCard = ({ profileData, currentUser, onEdit }) => {
  // ✅ AboutCard affiche toutes les expériences/éducations (pas seulement la plus récente)
  const experiences = profileData.allExperiences || profileData.experience || [];
  const educations = profileData.allEducations || profileData.education || [];
  
  // ...
};
```

---

## 📊 Résultat final

### ProfileHeader
- ✅ Affiche seulement la dernière expérience (celle en cours ou la plus récente)
- ✅ Affiche seulement la dernière formation
- ✅ Format : "OneFive" (sans les dates, juste le logo et le nom)

### AboutCard
- ✅ Affiche TOUTES les expériences
- ✅ Affiche TOUTES les formations
- ✅ Format : "Jan. 2023 - Présent" ou "Jan. 2023 - Juin 2025"

### MonthYearPicker
- ✅ Checkbox "En cours" utilise le design system Untitled UI
- ✅ Design cohérent et moderne

### Format des dates
- ✅ "Présent" s'affiche correctement (plus de "Date invalide")
- ✅ Dates formatées : "Jan. 2023", "Févr. 2024", etc.

---

## 🧪 Tests à effectuer

### Test 1 : Vérifier "Présent"
1. Créer une expérience
2. Cocher "En cours"
3. Enregistrer
4. ✅ Vérifier que ça affiche "Présent" et pas "Date invalide"

### Test 2 : Vérifier ProfileHeader
1. Avoir plusieurs expériences
2. ✅ Vérifier que seule la plus récente s'affiche dans le header
3. ✅ Vérifier que AboutCard affiche toutes les expériences

### Test 3 : Vérifier Checkbox Untitled UI
1. Ouvrir le modal d'édition
2. ✅ Vérifier que la checkbox "En cours" est stylisée comme les autres composants
3. ✅ Vérifier qu'elle fonctionne correctement (cliquer, désactiver le date picker)

---

## 📝 Fichiers modifiés

| Fichier | Type de changement |
|---------|-------------------|
| `src/utils/dateUtils.ts` | 🐛 Bug fix - "Date invalide" → "Présent" |
| `src/components/application/date-picker/month-year-picker.tsx` | ✨ Feature - Checkbox Untitled UI |
| `src/app/(protected)/profile/[id]/page.tsx` | ✨ Feature - Filtrer dernière exp/edu |
| `src/components/profile/AboutCard.tsx` | ✨ Feature - Afficher toutes les exp/edu |

---

**Date des corrections** : 5 octobre 2025  
**Status** : ✅ Tous les bugs corrigés  
**Prêt pour les tests** : ✅ Oui


