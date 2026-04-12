# Plan de Migration Frontend - Validation Limits

## ✅ État Actuel (Phase 2 COMPLÈTE À 100%)

### Phase 1: Backend (100% ✅)
Tous les DTOs backend utilisent désormais `VALIDATION_LIMITS` constants:
- ✅ Auth (signup, password reset, update password)
- ✅ Profile (update profile, skills, interests)
- ✅ Post (create, repost, comment)
- ✅ Discussion (create, update, answers, replies)
- ✅ Messaging (send message, create conversation)
- ✅ Experience/Education (create, batch update)
- ✅ Startup (create, invite members)
- ✅ DataRoom (categories, files, tracking events)

### Phase 2: Frontend (100% ✅ - COMPLET)
- ✅ **Fichiers de constantes créés**:
  - `/onefive-front/src/constants/validation-limits.ts`
  - `/onefive-front/src/examples/validation-limits-usage.tsx`
  - `/onefive-back/VALIDATION_LIMITS_GUIDE.md`
  - `/onefive-back/FRONTEND_VALIDATION_MIGRATION_PLAN.md`
  
- ✅ **Formulaires Profile** (COMPLÉTÉS):
  - `EditProfileHeaderModal.tsx`: Zod schemas + maxLength + character counters
  - `EditAboutModal.tsx`: Experience/Education avec VALIDATION_LIMITS
  
- ✅ **Formulaires Post** (COMPLÉTÉS):
  - `post.api.ts`: Zod schemas mis à jour (createPostSchema, editPostSchema)
  - `CreatePost.tsx`: maxLength + character counter (affichage à 80%+)
  - `CreatePostModal.tsx`: maxLength + character counter
  
- ✅ **Formulaires Discussion** (COMPLÉTÉS):
  - `CreateDiscussionModal.tsx`: Validation complète avec character counters
  
- ✅ **Formulaires Messaging** (COMPLÉTÉS):
  - `MessageActionTextarea.tsx`: maxLength pour message content
  - `CreateConversationModal.tsx`: maxLength + character counter pour initialMessage
  
- ✅ **Formulaires Startup** (COMPLÉTÉS):
  - `EditAboutModal.tsx` (startup): description, website, linkedin avec validation
  - `DetailsStep.tsx`: Zod schema avec VALIDATION_LIMITS (website, linkedin, city)
  - `IdentityStep.tsx`: Zod schema avec VALIDATION_LIMITS (name, tagline, description)
  
- ✅ **Formulaires Experience/Education** (COMPLÉTÉS):
  - `EditAboutModal.tsx` (profile): Tous les champs Experience/Education avec VALIDATION_LIMITS
  
- ✅ **Character Counters** (COMPLÉTÉS):
  - Compteurs inline implémentés sur tous les champs longs
  - Format: "current / max"
  - Couleurs: gris < 80%, jaune 80-99%, rouge ≥ 100%

---

## 🎯 Travail Restant - Frontend

### A. Formulaires à Mettre à Jour (Par Priorité)

#### 1. **Post** (Priorité: HAUTE)
**Fichiers:**
- `src/features/post/components/CreatePost.tsx`
- `src/components/feed/CreatePostModal.tsx`
- `src/features/post/post.api.ts` (Zod schema)

**Actions:**
```typescript
// Dans post.api.ts
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

export const createPostSchema = z.object({
  content: z.string()
    .max(VALIDATION_LIMITS.POST.CONTENT_MAX, VALIDATION_MESSAGES.CONTENT_TOO_LONG)
    .optional(),
  medias: z.array(z.any())
    .max(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT, VALIDATION_MESSAGES.MEDIAS_TOO_MANY)
    .optional(),
  tags: z.array(z.string())
    .max(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT)
    .optional(),
});

// Dans CreatePost.tsx, ajouter:
<TextArea
  {...register('content')}
  maxLength={VALIDATION_LIMITS.POST.CONTENT_MAX}
/>
```

---

#### 2. **Discussion** (Priorité: HAUTE)
**Fichiers:**
- `src/app/(protected)/discussions/modals/CreateDiscussionModal.tsx`

**Actions:**
```typescript
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

const discussionSchema = z.object({
  question: z.string()
    .min(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN, VALIDATION_MESSAGES.QUESTION_TOO_SHORT)
    .max(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX, VALIDATION_MESSAGES.QUESTION_TOO_LONG),
  content: z.string()
    .max(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX)
    .optional(),
  tags: z.array(z.string())
    .min(VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT)
    .max(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT),
});

// Ajouter maxLength sur tous les Input/TextArea
<Input label="Question" maxLength={VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX} {...field} />
<TextArea label="Détails" maxLength={VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX} {...field} />
```

---

#### 3. **Messaging** (Priorité: MOYENNE)
**Fichiers:**
- Composants de messagerie (SendMessage, CreateConversation)

**Actions:**
```typescript
const messageSchema = z.object({
  content: z.string()
    .max(VALIDATION_LIMITS.MESSAGING.MESSAGE_CONTENT_MAX, VALIDATION_MESSAGES.MESSAGE_TOO_LONG),
});

const conversationSchema = z.object({
  name: z.string()
    .max(VALIDATION_LIMITS.MESSAGING.CONVERSATION_NAME_MAX)
    .optional(),
  initialMessage: z.string()
    .max(VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX)
    .optional(),
});
```

---

#### 4. **Startup** (Priorité: MOYENNE)
**Fichiers:**
- `src/components/startup/modals/EditAboutModal.tsx`
- Formulaires de création de startup

**Actions:**
```typescript
const startupSchema = z.object({
  name: z.string()
    .min(VALIDATION_LIMITS.STARTUP.NAME_MIN)
    .max(VALIDATION_LIMITS.STARTUP.NAME_MAX, VALIDATION_MESSAGES.NAME_REQUIRED),
  tagline: z.string()
    .max(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX, VALIDATION_MESSAGES.TAGLINE_REQUIRED),
  description: z.string()
    .max(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED),
  categories: z.array(z.string())
    .max(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT, VALIDATION_MESSAGES.CATEGORIES_TOO_MANY),
});
```

---

#### 5. **Experience / Education** (Priorité: BASSE)
**Fichiers:**
- Formulaires d'expérience/éducation

**Actions:**
```typescript
const experienceSchema = z.object({
  title: z.string()
    .min(VALIDATION_LIMITS.EXPERIENCE.TITLE_MIN)
    .max(VALIDATION_LIMITS.EXPERIENCE.TITLE_MAX),
  company: z.string()
    .min(VALIDATION_LIMITS.EXPERIENCE.COMPANY_MIN)
    .max(VALIDATION_LIMITS.EXPERIENCE.COMPANY_MAX),
  description: z.string()
    .max(VALIDATION_LIMITS.EXPERIENCE.DESCRIPTION_MAX)
    .optional(),
});
```

---

### B. Compteurs de Caractères (Phase 2.5)

**Créer un composant réutilisable:**
```typescript
// src/components/ui/CharacterCounter.tsx
interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter = ({ current, max, className }: CharacterCounterProps) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 80;
  const isError = percentage >= 100;
  
  return (
    <div className={cn(
      "text-sm",
      isError ? "text-red-500" : isWarning ? "text-yellow-600" : "text-gray-500",
      className
    )}>
      {current} / {max}
    </div>
  );
};
```

**Intégrer dans les TextArea:**
```typescript
<div>
  <TextArea
    maxLength={VALIDATION_LIMITS.POST.CONTENT_MAX}
    value={content}
    onChange={(e) => setContent(e.target.value)}
  />
  <CharacterCounter 
    current={content.length} 
    max={VALIDATION_LIMITS.POST.CONTENT_MAX} 
  />
</div>
```

**Où ajouter des compteurs:**
- ✅ Post content (3000 chars)
- ✅ Profile bio (500 chars)
- ✅ Discussion content (2000 chars)
- ✅ Startup description (2000 chars)
- ✅ Message content (5000 chars)

---

## 📋 Checklist de Migration par Formulaire

### Profile
- [x] EditProfileHeaderModal: Zod + maxLength + imports
- [ ] EditAboutModal (second file): Vérifier + mettre à jour si nécessaire
- [ ] EditSkillsModal: Skills/Interests arrays
- [ ] EditSocialsModal: Social links

### Post
- [ ] CreatePost: content, medias, tags
- [ ] CreatePostModal: content, medias, tags
- [ ] EditPost: content (si applicable)
- [ ] CreateComment: content

### Discussion
- [ ] CreateDiscussionModal: question, content, tags, options
- [ ] EditDiscussion: question, content
- [ ] CreateAnswer: content
- [ ] CreateReply: content

### Messaging
- [ ] SendMessage: content
- [ ] CreateConversation: name, initialMessage

### Startup
- [ ] CreateStartup: name, tagline, description, categories
- [ ] EditStartup: name, tagline, description
- [ ] InviteMember: firstName, lastName, position, message

### Experience/Education
- [ ] CreateExperience: title, company, description
- [ ] EditExperience: title, company, description
- [ ] CreateEducation: degree, school, description

---

## 🧪 Phase 3: Tests (À faire)

### Tests Backend
**Fichier:** `onefive-back/src/**/*.spec.ts` (tests unitaires)

**Exemple:**
```typescript
describe('CreatePostDto', () => {
  it('should reject content exceeding max length', async () => {
    const dto = {
      content: 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX + 1),
    };
    
    const errors = await validate(plainToClass(CreatePostDto, dto));
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });
  
  it('should accept content at exact max length', async () => {
    const dto = {
      content: 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX),
    };
    
    const errors = await validate(plainToClass(CreatePostDto, dto));
    expect(errors).toHaveLength(0);
  });
});
```

### Tests E2E
**Fichier:** `onefive-back/test/e2e/flows/*.e2e-spec.ts`

**Scénarios à tester:**
1. **Edge Cases:**
   - Payload à la limite exacte (maxLength)
   - Payload dépassant d'1 caractère
   - Payload vide vs null vs undefined

2. **Arrays:**
   - Batch operations aux limites (20 items)
   - Arrays vides
   - Arrays avec 1 item au-delà de la limite

3. **Messages d'Erreur:**
   - Vérifier que `VALIDATION_MESSAGES` est retourné correctement
   - Status code 400 avec détails de validation

**Exemple E2E:**
```typescript
it('POST /posts - should reject content > 3000 chars', async () => {
  const response = await request(app.getHttpServer())
    .post('/posts')
    .set('Cookie', sessionCookie)
    .send({
      content: 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX + 1),
    })
    .expect(400);
    
  expect(response.body.message).toContain('trop long');
});
```

---

## 🎨 Améliorations UX Suggérées

### 1. Feedback Visuel Progressif
```typescript
// Afficher le compteur seulement après 50% de la limite
{content.length > VALIDATION_LIMITS.POST.CONTENT_MAX * 0.5 && (
  <CharacterCounter current={content.length} max={VALIDATION_LIMITS.POST.CONTENT_MAX} />
)}
```

### 2. Couleurs Adaptatives
- Gris: < 80%
- Jaune: 80-99%
- Rouge: 100%

### 3. Validation en Temps Réel
```typescript
const contentError = content.length > VALIDATION_LIMITS.POST.CONTENT_MAX
  ? VALIDATION_MESSAGES.CONTENT_TOO_LONG
  : undefined;

<TextArea error={contentError} />
```

---

## 🔄 Workflow de Synchronisation

### Quand Modifier une Limite

1. **Backend:** Modifier `onefive-back/src/common/constants/validation-limits.constants.ts`
2. **Frontend:** Copier exactement dans `onefive-front/src/constants/validation-limits.ts`
3. **Tester:** Vérifier que les deux validations (front + back) sont cohérentes
4. **Commit:** Utiliser un commit atomic pour les deux changements

### Commandes Utiles
```bash
# Vérifier la synchronisation
diff onefive-back/src/common/constants/validation-limits.constants.ts \
     onefive-front/src/constants/validation-limits.ts

# Copier les limites du back vers le front
cp onefive-back/src/common/constants/validation-limits.constants.ts \
   onefive-front/src/constants/validation-limits.ts
```

---

## 📚 Références

- **Guide d'utilisation:** `onefive-back/VALIDATION_LIMITS_GUIDE.md`
- **Exemples React:** `onefive-front/src/examples/validation-limits-usage.tsx`
- **Backend constants:** `onefive-back/src/common/constants/validation-limits.constants.ts`
- **Frontend constants:** `onefive-front/src/constants/validation-limits.ts`

---

## ✨ Quick Wins (Recommandations)

1. **Priorité 1:** Migrer les formulaires Post et Discussion (haute fréquence d'utilisation)
2. **Priorité 2:** Ajouter les compteurs de caractères sur les champs longs
3. **Priorité 3:** Tests E2E pour valider la synchronisation backend/frontend
4. **Priorité 4:** Compléter les formulaires restants (Messaging, Startup, etc.)

---

## 🐛 Points d'Attention

- ⚠️ **Ne pas utiliser de magic numbers** : Toujours référencer `VALIDATION_LIMITS`
- ⚠️ **Synchronisation:** Toute modification doit être dupliquée front + back
- ⚠️ **Messages:** Utiliser `VALIDATION_MESSAGES` pour la cohérence
- ⚠️ **Tests:** Ajouter des tests pour chaque nouvelle limite intégrée
