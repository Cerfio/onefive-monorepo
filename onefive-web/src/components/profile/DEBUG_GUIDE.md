# Guide de débogage - Réalisations

## Problème: Aucune requête envoyée lors de la création d'une réalisation

### Étapes de débogage

1. **Ouvrir la console du navigateur** (F12 ou Cmd+Option+I sur Mac)

2. **Suivre les logs** lors de l'utilisation :
   - `🟣` = Composant AchievementsCardNew chargé
   - `🟡` = Changement de valeur dans un input
   - `🔵` = Bouton "Enregistrer" cliqué
   - `🟢` = Succès de l'opération
   - `🔴` = Erreur

### Vérifications à faire

#### 1. Le composant reçoit-il la fonction onSave?

Chercher ce log dans la console:
```
🟣 AchievementsCardNew - Props: { achievementsCount: X, currentUser: true, hasOnSave: true }
```

Si `hasOnSave: false` → **Problème: onSave n'est pas passé au composant**

**Solution:**
```tsx
// ❌ Mauvais
<AchievementsCardNew
  achievements={achievements}
  currentUser={true}
  // onSave manquant!
/>

// ✅ Bon
<AchievementsCardNew
  achievements={achievements}
  currentUser={true}
  onSave={handleSave}
/>
```

---

#### 2. Les changements d'input sont-ils détectés?

Quand vous tapez dans "Titre" ou "Description", vous devriez voir:
```
🟡 handleChange - index: 0, field: "title", value: "votre texte"
🟡 Nouvel état: [{ id: "...", title: "votre texte", ... }]
```

Si vous ne voyez pas ces logs → **Problème: onChange ne fonctionne pas**

**Solution:** Vérifier que vous utilisez bien `Input` de `@/components/base/input/input`

---

#### 3. Le bouton "Enregistrer" est-il cliqué?

Quand vous cliquez sur "Enregistrer", vous devriez voir:
```
🔵 handleSave appelé
🔵 localAchievements: [...]
🔵 deletedIds: []
```

Si vous ne voyez pas ces logs → **Problème: Le bouton ne déclenche pas handleSave**

**Vérification:** Le modal est-il bien ouvert? Le bouton "Enregistrer" est-il visible?

---

#### 4. Y a-t-il des erreurs de validation?

Chercher dans la console:
```
🔴 Erreurs de validation: ["Réalisation 1: Le titre est requis", ...]
```

Si vous voyez des erreurs de validation → **Problème: Champs vides ou invalides**

**Solution:** 
- Vérifier que vous avez bien rempli Titre ET Description
- Les deux champs sont obligatoires

---

#### 5. Les données sont-elles envoyées?

Après validation, vous devriez voir:
```
🟢 Données à envoyer: { filteredAchievements: [...], deletedIds: [] }
🟢 onSave existe? "function"
```

Si `onSave existe? "undefined"` → **Problème: onSave n'est pas une fonction**

**Solution:** Vérifier que vous passez bien une fonction à onSave:
```tsx
const handleSave = async (achievements, deleteIds) => {
  await batchUpdateMutation.mutateAsync({ achievements, deleteIds });
};
```

---

#### 6. La requête API est-elle envoyée?

Ouvrir l'onglet **Network** (Réseau) dans les DevTools

Chercher une requête vers:
```
PUT /profile/achievements/batch
```

**Si aucune requête:**
- Vérifier que `NEXT_PUBLIC_API_URL` est défini dans `.env.local`
- Vérifier que le hook `useBatchUpdateAchievements` est bien utilisé
- Vérifier la console pour des erreurs JavaScript

**Si requête envoyée mais erreur:**
- Regarder le code de statut HTTP (401, 403, 500, etc.)
- Regarder la réponse pour plus de détails
- Vérifier que vous êtes bien authentifié (cookie de session)

---

### Exemples de cas courants

#### Cas 1: onSave n'est pas passé
```
🟣 AchievementsCardNew - Props: { achievementsCount: 0, currentUser: true, hasOnSave: false }
```

**Solution:**
```tsx
import { useBatchUpdateAchievements } from "@/queries/profile";

const MyComponent = () => {
  const batchUpdateMutation = useBatchUpdateAchievements();

  const handleSave = async (achievements, deleteIds) => {
    await batchUpdateMutation.mutateAsync({ achievements, deleteIds });
  };

  return (
    <AchievementsCardNew
      achievements={[]}
      currentUser={true}
      onSave={handleSave}  // ← Important!
    />
  );
};
```

---

#### Cas 2: Erreur de validation (champs vides)
```
🔵 handleSave appelé
🔵 localAchievements: [{ id: "new_...", title: "", description: "", dateValue: ... }]
🔴 Erreurs de validation: ["Réalisation 1: Le titre est requis", "Réalisation 1: La description est requise"]
```

**Solution:** Remplir les champs Titre et Description avant de sauvegarder

---

#### Cas 3: Hook non initialisé
```tsx
// ❌ Erreur: hook appelé en dehors d'un composant React
const handleSave = async (achievements, deleteIds) => {
  const mutation = useBatchUpdateAchievements(); // ← Erreur!
  await mutation.mutateAsync({ achievements, deleteIds });
};

// ✅ Correct: hook appelé au niveau du composant
const MyComponent = () => {
  const mutation = useBatchUpdateAchievements(); // ← Correct
  
  const handleSave = async (achievements, deleteIds) => {
    await mutation.mutateAsync({ achievements, deleteIds });
  };
  
  // ...
};
```

---

### Vérification de l'environnement

#### 1. Variables d'environnement

Vérifier `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # ou votre URL d'API
```

**Test:**
```tsx
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
```

#### 2. Backend accessible

Tester l'accès au backend:
```bash
curl http://localhost:3001/health
```

#### 3. Authentification

Vérifier dans DevTools > Application > Cookies:
- Cookie `token` ou session doit être présent

---

### Debug complet - Checklist

- [ ] Console ouverte (F12)
- [ ] Onglet Network ouvert
- [ ] J'ai cliqué sur le bouton d'édition (icône crayon)
- [ ] Le modal s'est ouvert
- [ ] J'ai cliqué sur "Ajouter" pour ajouter une réalisation
- [ ] J'ai rempli le Titre
- [ ] J'ai rempli la Description
- [ ] J'ai cliqué sur "Enregistrer"
- [ ] Je vois les logs dans la console
- [ ] Je vois la requête dans l'onglet Network

---

### Retirer les logs

Une fois le problème résolu, vous pouvez retirer les console.log en cherchant:
```
🟣🟡🔵🟢🔴
```

Ou remplacer tous les `console.log` par des commentaires.

---

### Besoin d'aide supplémentaire?

Si le problème persiste:

1. **Copier tous les logs de la console** (Ctrl+A dans la console, puis Ctrl+C)
2. **Prendre une capture d'écran** de l'onglet Network
3. **Partager** le code où vous utilisez `AchievementsCardNew`
4. **Vérifier** le README_ACHIEVEMENTS.md pour les exemples d'utilisation

