# Dépannage - Aucune requête envoyée lors de la création de réalisation

## 🔍 Diagnostic rapide

J'ai ajouté des **logs de débogage** dans les composants pour identifier le problème.

### Étape 1: Ouvrir la console

1. Ouvrir la console du navigateur: **F12** (ou **Cmd+Option+I** sur Mac)
2. Aller dans l'onglet **Console**
3. Essayer de créer une réalisation
4. Observer les logs colorés 🟣 🟡 🔵 🟢 🔴

---

## 📊 Que signifient les logs?

| Emoji | Signification | Quand apparaît-il? |
|-------|---------------|-------------------|
| 🟣 | Composant chargé | Au chargement de la page |
| 🟡 | Input modifié | Quand vous tapez dans Titre/Description |
| 🔵 | Enregistrement démarré | Quand vous cliquez sur "Enregistrer" |
| 🟢 | Succès | Quand la sauvegarde réussit |
| 🔴 | Erreur | Quand il y a une erreur |

---

## ✅ Scénario normal (tout fonctionne)

Quand tout fonctionne correctement, vous devriez voir ces logs dans l'ordre:

```
🟣 AchievementsCardNew - Props: { achievementsCount: 0, currentUser: true, hasOnSave: true }
[Vous cliquez sur le bouton "Ajouter"]
🟡 handleChange - index: 0, field: "title", value: "Mon titre"
🟡 Nouvel état: [{ id: "new_...", title: "Mon titre", ... }]
🟡 handleChange - index: 0, field: "description", value: "Ma description"
🟡 Nouvel état: [{ id: "new_...", title: "Mon titre", description: "Ma description", ... }]
[Vous cliquez sur "Enregistrer"]
🔵 handleSave appelé
🔵 localAchievements: [{ id: "new_...", title: "Mon titre", description: "Ma description", ... }]
🔵 deletedIds: []
🟢 Données à envoyer: { filteredAchievements: [...], deletedIds: [] }
🟢 onSave existe? "function"
🟢 Sauvegarde réussie
```

Si vous voyez tout ça → **Tout fonctionne!** La requête est envoyée.

---

## ❌ Problèmes courants

### Problème 1: `hasOnSave: false`

**Symptôme:**
```
🟣 AchievementsCardNew - Props: { achievementsCount: 0, currentUser: true, hasOnSave: false }
```

**Cause:** La fonction `onSave` n'est pas passée au composant

**Solution:**
```tsx
// ❌ Mauvais
<AchievementsCardNew
  achievements={achievements}
  currentUser={true}
/>

// ✅ Bon
import { useBatchUpdateAchievements } from "@/queries/profile";

const MyComponent = () => {
  const batchUpdateMutation = useBatchUpdateAchievements();

  const handleSave = async (achievements, deleteIds) => {
    await batchUpdateMutation.mutateAsync({ achievements, deleteIds });
  };

  return (
    <AchievementsCardNew
      achievements={achievements}
      currentUser={true}
      onSave={handleSave}  // ← Important!
    />
  );
};
```

---

### Problème 2: Erreurs de validation

**Symptôme:**
```
🔵 handleSave appelé
🔴 Erreurs de validation: ["Réalisation 1: Le titre est requis", "Réalisation 1: La description est requise"]
```

**Cause:** Vous avez cliqué sur "Enregistrer" sans remplir les champs

**Solution:** Remplir **à la fois** le Titre ET la Description (les deux sont obligatoires)

---

### Problème 3: Aucun log 🟡 quand vous tapez

**Symptôme:** Quand vous tapez dans les champs, rien n'apparaît dans la console

**Cause possible:** 
- Le modal ne s'est pas ouvert correctement
- Le composant Input n'est pas le bon

**Solution:** 
1. Vérifier que le modal s'ouvre bien (écran semi-transparent, popup au centre)
2. Vérifier les imports:
```tsx
import { Input } from "@/components/base/input/input"; // ✅ Correct
```

---

### Problème 4: `onSave existe? "undefined"`

**Symptôme:**
```
🟢 Données à envoyer: { ... }
🟢 onSave existe? "undefined"
```

**Cause:** La fonction onSave a été perdue entre le composant parent et le modal

**Solution:** Ce ne devrait pas arriver avec le code actuel. Si vous voyez ça, c'est un bug. Vérifier que vous utilisez bien `AchievementsCardNew` et pas une ancienne version.

---

### Problème 5: Erreur API (401, 403, 500, etc.)

**Symptôme:**
```
🔵 handleSave appelé
🟢 Données à envoyer: { ... }
🔴 Erreur lors de la sauvegarde: ...
```

**Cause:** La requête est envoyée mais le backend retourne une erreur

**Vérifications:**

1. **Backend accessible?**
```bash
curl http://localhost:3001/health
# ou votre URL d'API
```

2. **Authentifié?**
   - Ouvrir DevTools > Application > Cookies
   - Vérifier qu'un cookie `token` ou de session existe

3. **Variable d'environnement?**
```bash
# Dans .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Vérifier dans la console:
```tsx
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
```

4. **Onglet Network:**
   - Ouvrir DevTools > Network
   - Chercher `achievements/batch`
   - Regarder le code de statut et la réponse

---

## 🧪 Page de test

Une page de test a été créée pour tester sans connexion au backend:

**Fichier:** `onefive-front/src/components/profile/AchievementsTestPage.tsx`

**Utilisation:**

1. Créer une route de test:
```tsx
// app/(protected)/test-achievements/page.tsx
import AchievementsTestPage from "@/components/profile/AchievementsTestPage";

export default AchievementsTestPage;
```

2. Accéder à `/test-achievements` dans le navigateur

3. Tester l'ajout/modification/suppression

Cette page utilise un état local (pas de backend) pour isoler les problèmes.

---

## 📝 Checklist de débogage

Avant de demander de l'aide, vérifier:

- [ ] Console ouverte (F12)
- [ ] Onglet Network ouvert
- [ ] `hasOnSave: true` dans les logs
- [ ] J'ai cliqué sur le bouton d'édition (icône crayon)
- [ ] Le modal s'est ouvert (popup au centre)
- [ ] J'ai cliqué sur "Ajouter"
- [ ] J'ai rempli **Titre**
- [ ] J'ai rempli **Description**
- [ ] J'ai cliqué sur "Enregistrer"
- [ ] Je vois les logs 🟣 🟡 🔵 dans la console
- [ ] `NEXT_PUBLIC_API_URL` est défini dans `.env.local`
- [ ] Le backend est accessible

---

## 🔧 Exemples de code corrects

### Exemple minimal

```tsx
"use client";

import { AchievementsCardNew } from "@/components/profile/AchievementsCardNew";
import { useBatchUpdateAchievements } from "@/queries/profile";

export default function MyPage() {
  const batchUpdateMutation = useBatchUpdateAchievements();

  const handleSave = async (achievements, deleteIds) => {
    await batchUpdateMutation.mutateAsync({ 
      achievements, 
      deleteIds 
    });
  };

  return (
    <AchievementsCardNew
      achievements={[]}
      currentUser={true}
      onSave={handleSave}
    />
  );
}
```

### Exemple avec données du profil

```tsx
"use client";

import { AchievementsCardNew } from "@/components/profile/AchievementsCardNew";
import { useBatchUpdateAchievements, getProfile } from "@/queries/profile";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: profileData } = useQuery({
    queryKey: ["profile", params.id],
    queryFn: () => getProfile(params.id),
  });

  const batchUpdateMutation = useBatchUpdateAchievements();

  const handleSave = async (achievements, deleteIds) => {
    await batchUpdateMutation.mutateAsync({ 
      achievements, 
      deleteIds 
    });
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <AchievementsCardNew
      achievements={profileData.achievements || []}
      currentUser={true}
      onSave={handleSave}
    />
  );
}
```

### Exemple avec le composant d'intégration

```tsx
import { AchievementsIntegrationExample } from "@/components/profile/AchievementsIntegrationExample";

export default function ProfilePage({ params }) {
  const { data: profileData } = useQuery({
    queryKey: ['profile', params.id],
    queryFn: () => getProfile(params.id),
  });

  return (
    <AchievementsIntegrationExample
      profileId={params.id}
      achievements={profileData?.achievements || []}
    />
  );
}
```

---

## 🗑️ Retirer les logs

Une fois le problème résolu, retirer les `console.log` en cherchant:

```
🟣 🟡 🔵 🟢 🔴
```

Ou faire un find/replace de `console.log` → `// console.log`

---

## 📚 Documentation complète

- **README_ACHIEVEMENTS.md** - Documentation des composants
- **USAGE_EXAMPLE.tsx** - 5 exemples d'utilisation
- **DEBUG_GUIDE.md** - Guide de débogage détaillé
- **AchievementsTestPage.tsx** - Page de test

---

## 💡 Besoin d'aide supplémentaire?

Si le problème persiste après avoir suivi ce guide:

1. **Copier tous les logs** de la console (Ctrl+A, Ctrl+C)
2. **Prendre une capture d'écran** de l'onglet Network
3. **Partager le code** où vous utilisez `AchievementsCardNew`
4. **Indiquer** à quelle étape ça bloque (d'après les logs)

Avec ces informations, le diagnostic sera beaucoup plus rapide! 🚀




