# Guide : Synchronisation des Limites de Validation Frontend/Backend

## 📋 Vue d'ensemble

Pour garantir une expérience utilisateur cohérente et une validation robuste, les limites de validation **DOIVENT** être identiques côté backend et frontend.

---

## 📁 Fichiers de Constantes

### Backend
```
onefive-back/src/common/constants/validation-limits.constants.ts
```

### Frontend
```
onefive-front/src/constants/validation-limits.ts
```

---

## 🔄 Workflow de Synchronisation

### 1. Modification des Limites Backend

Si vous modifiez une limite dans un DTO backend :

```typescript
// Avant
@MaxLength(100)
title: string;

// Après
@MaxLength(150)  // ← Changement
title: string;
```

**Actions requises :**

1. **Mettre à jour `validation-limits.constants.ts` (backend)**
   ```typescript
   PROFILE: {
     TITLE_MAX: 150,  // ← Mise à jour
   }
   ```

2. **Mettre à jour `validation-limits.ts` (frontend)**
   ```typescript
   PROFILE: {
     TITLE_MAX: 150,  // ← Mise à jour identique
   }
   ```

3. **Vérifier les composants frontend** qui utilisent cette limite

4. **Tester** côté backend ET frontend

---

## 📝 Exemples d'Utilisation

### Backend (NestJS)

```typescript
import { VALIDATION_LIMITS } from '@/common/constants/validation-limits.constants';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX)
  @SanitizeText()
  firstName: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX)
  @SanitizeText()
  lastName: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROFILE.TITLE_MAX)
  @SanitizeText()
  title: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROFILE.BIO_MAX)
  @SanitizeHtml()
  bio: string;

  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX, { each: true })
  @SanitizeArray()
  skills?: string[];
}
```

### Frontend (React)

```typescript
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

// Exemple 1 : Formulaire avec react-hook-form + zod
const profileSchema = z.object({
  firstName: z.string()
    .min(1, VALIDATION_MESSAGES.FIRST_NAME_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX, VALIDATION_MESSAGES.FIRST_NAME_TOO_LONG),
  
  lastName: z.string()
    .min(1, VALIDATION_MESSAGES.LAST_NAME_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX, VALIDATION_MESSAGES.LAST_NAME_TOO_LONG),
  
  title: z.string()
    .min(1, VALIDATION_MESSAGES.TITLE_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.TITLE_MAX, VALIDATION_MESSAGES.TITLE_TOO_LONG),
  
  bio: z.string()
    .min(1, VALIDATION_MESSAGES.BIO_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.BIO_MAX, VALIDATION_MESSAGES.BIO_TOO_LONG),
  
  skills: z.array(z.string().max(VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX))
    .max(VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT, VALIDATION_MESSAGES.SKILLS_TOO_MANY)
    .optional(),
});

// Exemple 2 : Input HTML avec maxLength
<Input
  label="Prénom"
  placeholder="Votre prénom"
  maxLength={VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX}
  {...register('firstName')}
/>

<Input
  label="Titre professionnel"
  placeholder="Ex: Founder & CEO"
  maxLength={VALIDATION_LIMITS.PROFILE.TITLE_MAX}
  {...register('title')}
/>

<TextArea
  label="Bio"
  placeholder="Parlez-nous de vous..."
  maxLength={VALIDATION_LIMITS.PROFILE.BIO_MAX}
  rows={4}
  {...register('bio')}
/>

// Exemple 3 : Validation manuelle
const handleAddSkill = (skill: string) => {
  if (skills.length >= VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT) {
    toast.error(VALIDATION_MESSAGES.SKILLS_TOO_MANY);
    return;
  }
  
  if (skill.length > VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX) {
    toast.error(`Une compétence ne peut pas dépasser ${VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX} caractères`);
    return;
  }
  
  setSkills([...skills, skill]);
};
```

---

## ✅ Checklist de Synchronisation

Quand vous modifiez une limite :

- [ ] **Backend** : Modifier le DTO concerné
- [ ] **Backend** : Mettre à jour `validation-limits.constants.ts`
- [ ] **Frontend** : Mettre à jour `validation-limits.ts`
- [ ] **Frontend** : Vérifier tous les composants qui utilisent cette limite
- [ ] **Frontend** : Mettre à jour les schémas Zod si applicable
- [ ] **Frontend** : Mettre à jour les attributs `maxLength` des inputs/textareas
- [ ] **Tests** : Vérifier les tests backend (validation DTO)
- [ ] **Tests** : Vérifier les tests frontend (validation formulaire)
- [ ] **Documentation** : Mettre à jour ce guide si nécessaire

---

## 🎯 Bonnes Pratiques

### 1. **Toujours utiliser les constantes**

❌ **MAUVAIS** :
```typescript
// Backend
@MaxLength(100)
title: string;

// Frontend
<Input maxLength={100} />
```

✅ **BON** :
```typescript
// Backend
@MaxLength(VALIDATION_LIMITS.PROFILE.TITLE_MAX)
title: string;

// Frontend
<Input maxLength={VALIDATION_LIMITS.PROFILE.TITLE_MAX} />
```

### 2. **Afficher le compteur de caractères**

```tsx
<div className="relative">
  <TextArea
    value={bio}
    maxLength={VALIDATION_LIMITS.PROFILE.BIO_MAX}
    onChange={(e) => setBio(e.target.value)}
  />
  <span className="absolute bottom-2 right-2 text-xs text-gray-400">
    {bio.length} / {VALIDATION_LIMITS.PROFILE.BIO_MAX}
  </span>
</div>
```

### 3. **Validation côté client + serveur**

**Toujours valider côté serveur**, même si validation côté client :
- Côté client : Meilleure UX (feedback immédiat)
- Côté serveur : Sécurité (protection contre bypass)

### 4. **Messages d'erreur clairs**

```typescript
// Utiliser les constantes de messages
if (content.length > VALIDATION_LIMITS.POST.CONTENT_MAX) {
  toast.error(VALIDATION_MESSAGES.CONTENT_TOO_LONG);
}
```

---

## 📊 Limites Actuelles par Module

| Module | Champ | Limite | Notes |
|--------|-------|--------|-------|
| **Auth** | Email | 255 char | Standard email |
| | Password | 8-128 char | Avec complexité |
| **Profile** | Prénom/Nom | 50 char | Noms courts |
| | Titre | 100 char | Titre professionnel |
| | Bio | 500 char | Bio courte |
| | Skills | 20 max, 50 char/item | Limité pour UX |
| **Post** | Content | 3000 char | Post long |
| | Medias | 10 max | Galerie photo |
| | Tags | 10 max, 50 char/tag | |
| **Discussion** | Question | 5-200 char | Question claire |
| | Content | 2000 char | Réponse détaillée |
| | Tags | 1-5 max | Focus |
| **Messaging** | Message | 5000 char | Conversation longue |
| **Experience** | Titre/Entreprise | 100 char | |
| | Description | 2000 char | |
| | Max par profil | 10 | Évite spam |
| **Startup** | Name | 100 char | |
| | Description | 2000 char | Pitch |
| | Categories | 5 max | Focus |
| **DataRoom** | File name | 255 char | Standard filename |
| | Batch upload | 20 files | Évite surcharge |

---

## 🚨 Alertes

### ⚠️ **Ne JAMAIS modifier une limite sans synchroniser**

Une limite différente entre backend et frontend crée :
- ❌ Mauvaise UX (utilisateur bloqué côté serveur)
- ❌ Failles de sécurité (bypass validation)
- ❌ Bugs difficiles à débugger

### ⚠️ **Vérifier l'impact business**

Avant de modifier une limite, vérifier :
- Impact sur les données existantes
- Impact sur l'UX
- Cohérence avec les autres limites

### ⚠️ **Tester après modification**

- Tests unitaires backend (DTO validation)
- Tests E2E backend (avec payloads limites)
- Tests frontend (soumission formulaire)
- Tests manuels (UX)

---

## 📞 Support

En cas de doute sur une limite :
1. Consulter ce guide
2. Vérifier les DTOs backend
3. Tester avec un payload limite
4. Demander validation tech lead

---

**Dernière mise à jour** : 14 février 2026
