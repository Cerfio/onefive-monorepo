# 🎨 Guide de Vérification Frontend - Tâches Backend 1-21

**Date** : 10 février 2026  
**Contexte** : Suite aux corrections backend (tâches 1-21), ce guide liste les vérifications et ajustements nécessaires côté frontend.

---

## 🔥 PRIORITÉ 1 : Waitlist Guard (#8) - CRITIQUE UX

### ❌ Problème
Le backend bloque maintenant TOUS les utilisateurs avec `waitlistStatus !== 'ACTIVE'` via un guard global.  
Si le frontend ne vérifie pas le statut, les utilisateurs WAITING verront des erreurs 403 partout.

### ✅ Solution Frontend

#### 1. Vérifier que le User State inclut `waitlistStatus`

**Localisation** : Contexte/Store d'authentification

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  // ... autres champs
  waitlistStatus: 'WAITING' | 'ACTIVE'; // ✅ DOIT être présent
}
```

#### 2. Créer un Hook de vérification

```typescript
// hooks/useWaitlistStatus.ts
import { useAuth } from '@/contexts/AuthContext';

export function useWaitlistStatus() {
  const { user } = useAuth();
  
  const isActive = user?.waitlistStatus === 'ACTIVE';
  const isWaiting = user?.waitlistStatus === 'WAITING';
  
  return {
    isActive,
    isWaiting,
    status: user?.waitlistStatus,
  };
}
```

#### 3. Composant Bannière Waitlist

```tsx
// components/WaitlistBanner.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function WaitlistBanner() {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <InfoIcon className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        Vous êtes sur liste d'attente. 
        <strong> Vérifiez votre email</strong> pour activer votre compte et accéder à toutes les fonctionnalités.
      </AlertDescription>
    </Alert>
  );
}
```

#### 4. HOC pour protéger les pages

```tsx
// components/WithWaitlistCheck.tsx
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { WaitlistBanner } from './WaitlistBanner';

export function withWaitlistCheck<P extends object>(
  Component: React.ComponentType<P>,
  options?: { showBanner?: boolean }
) {
  return function WaitlistProtectedComponent(props: P) {
    const { isActive, isWaiting } = useWaitlistStatus();
    
    if (isWaiting) {
      return options?.showBanner !== false ? <WaitlistBanner /> : null;
    }
    
    return <Component {...props} />;
  };
}

// Usage :
export default withWaitlistCheck(CreatePostPage);
```

#### 5. Pages à protéger (OBLIGATOIRE)

**✅ Bloquer complètement** (afficher bannière) :
- `/posts/new` - Créer un post
- `/discussions/new` - Créer une discussion
- `/messages` - Envoyer des messages
- `/startup/new` - Créer une startup
- `/dataroom/*` - Accès data room

**✅ Autoriser** (pas de vérification) :
- `/profile` - Compléter profil (exempt backend)
- `/settings` - Paramètres (exempt backend)
- `/auth/*` - Authentification (exempt backend)
- `/waitlist` - Page waitlist (exempt backend)

#### 6. Désactiver les boutons dans l'UI

```tsx
// components/CreatePostButton.tsx
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function CreatePostButton() {
  const { isActive, isWaiting } = useWaitlistStatus();
  
  if (isWaiting) {
    return (
      <Tooltip content="Activez votre compte pour publier">
        <Button disabled className="opacity-50">
          Créer un post
        </Button>
      </Tooltip>
    );
  }
  
  return (
    <Button onClick={handleCreatePost}>
      Créer un post
    </Button>
  );
}
```

#### 7. Gérer 403 gracieusement

```typescript
// lib/api-client.ts
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const message = error.response.data.message || '';
      
      // Si erreur liée à la waitlist
      if (message.includes('waitlist') || message.includes('WAITING')) {
        // NE PAS afficher toast d'erreur brutal
        // Rediriger vers page d'info waitlist
        router.push('/waitlist-pending');
        return Promise.reject(error);
      }
    }
    
    // Autres erreurs 403 (permissions normales)
    toast.error('Accès refusé');
    return Promise.reject(error);
  }
);
```

#### 8. Page d'information Waitlist

```tsx
// pages/waitlist-pending.tsx
export default function WaitlistPendingPage() {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Vous êtes sur liste d'attente
      </h1>
      
      <p className="text-gray-600 mb-6">
        Vérifiez votre email pour activer votre compte.
        Si vous avez utilisé un code de parrainage, votre accès sera activé dès la vérification.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Comment activer mon compte ?</h2>
        <ol className="text-left space-y-2 text-sm">
          <li>1️⃣ Vérifiez votre email (lien de vérification)</li>
          <li>2️⃣ Si vous avez un code parrain : activation automatique</li>
          <li>3️⃣ Sinon : Parrainez 10 amis pour devenir Founding Member</li>
        </ol>
      </div>
      
      <Button onClick={() => router.push('/profile')}>
        Compléter mon profil
      </Button>
    </div>
  );
}
```

### 📋 Checklist Waitlist

- [ ] `waitlistStatus` présent dans le type User
- [ ] Hook `useWaitlistStatus` créé
- [ ] Composant `WaitlistBanner` créé
- [ ] HOC `withWaitlistCheck` créé (optionnel)
- [ ] Bouton "Créer post" désactivé si WAITING
- [ ] Bouton "Créer discussion" désactivé si WAITING
- [ ] Bouton "Envoyer message" désactivé si WAITING
- [ ] Page `/waitlist-pending` créée
- [ ] Interceptor 403 gère waitlist gracieusement
- [ ] Tests : User WAITING ne voit pas boutons actifs
- [ ] Tests : User ACTIVE voit boutons actifs

---

## 🔥 PRIORITÉ 2 : File Upload Validation (#3)

### ❌ Problème
Backend rejette maintenant fichiers dangereux avec messages d'erreur spécifiques (400).

### ✅ Solution Frontend

#### 1. Afficher erreurs détaillées

```tsx
// components/FileUpload.tsx
import { toast } from 'sonner';

async function handleUpload(files: File[]) {
  try {
    await uploadFiles(files);
    toast.success('Fichiers uploadés avec succès');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = error.response.data.message;
      
      // Messages détaillés selon l'erreur
      if (message.includes('File type not allowed')) {
        toast.error('Type de fichier non autorisé. Formats acceptés : PDF, Word, Excel, Images, ZIP');
      } else if (message.includes('File too large')) {
        toast.error('Fichier trop volumineux (max 50 MB)');
      } else if (message.includes('Too many files')) {
        toast.error('Trop de fichiers (max 20 par upload)');
      } else if (message.includes('Filename too long')) {
        toast.error('Nom de fichier trop long (max 255 caractères)');
      } else {
        toast.error(message);
      }
    } else {
      toast.error('Erreur lors de l\'upload');
    }
  }
}
```

#### 2. Validation côté client (UX)

```typescript
// utils/file-validation.ts
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_FILES = 20;

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Taille
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Fichier trop volumineux (max 50 MB)' };
  }
  
  // Type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Type ${file.type} non autorisé` };
  }
  
  // Extension dangereuse
  const dangerous = ['.exe', '.bat', '.cmd', '.sh', '.js', '.html', '.svg'];
  if (dangerous.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return { valid: false, error: 'Extension de fichier non autorisée' };
  }
  
  return { valid: true };
}
```

#### 3. UI de prévisualisation avec validation

```tsx
// components/FileUploadWithValidation.tsx
export function FileUploadWithValidation() {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    const newErrors: Record<string, string> = {};
    const validFiles: File[] = [];
    
    // Vérifier nombre total
    if (selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} fichiers autorisés`);
      return;
    }
    
    // Valider chaque fichier
    selectedFiles.forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        newErrors[file.name] = validation.error!;
      } else {
        validFiles.push(file);
      }
    });
    
    setErrors(newErrors);
    setFiles(validFiles);
  }
  
  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip"
        onChange={handleFileChange}
      />
      
      {/* Liste des fichiers valides */}
      {files.map(file => (
        <div key={file.name} className="flex items-center text-green-600">
          <CheckIcon /> {file.name} ({formatBytes(file.size)})
        </div>
      ))}
      
      {/* Erreurs */}
      {Object.entries(errors).map(([name, error]) => (
        <div key={name} className="flex items-center text-red-600">
          <XIcon /> {name}: {error}
        </div>
      ))}
    </div>
  );
}
```

### 📋 Checklist File Upload

- [ ] Validation côté client implémentée (UX)
- [ ] Messages d'erreur détaillés pour chaque cas
- [ ] Attribute `accept` sur input avec types autorisés
- [ ] Affichage taille fichier formatée
- [ ] Indicateur visuel fichiers valides/invalides
- [ ] Tests : Upload fichier valide réussit
- [ ] Tests : Upload .exe est rejeté avec message clair

---

## 🟡 PRIORITÉ 3 : XSS Protection (#7)

### ❌ Problème
Backend sanitise maintenant TOUT le contenu HTML. Frontend doit afficher correctement.

### ✅ Solution Frontend

#### 1. Review des composants avec contenu utilisateur

```tsx
// components/PostContent.tsx

// ❌ DANGEREUX si contenu non sanitisé backend
<div dangerouslySetInnerHTML={{ __html: post.content }} />

// ✅ SAFE car backend sanitise déjà
// Mais toujours auditer l'utilisation de dangerouslySetInnerHTML
<div 
  className="prose"
  dangerouslySetInnerHTML={{ __html: post.content }} 
/>

// ✅ MEILLEUR si contenu est texte pur (pas de HTML)
<div className="whitespace-pre-wrap">{post.content}</div>
```

#### 2. Composant sécurisé pour contenu riche

```tsx
// components/SafeHtmlContent.tsx
import DOMPurify from 'dompurify';

interface Props {
  html: string;
  className?: string;
}

export function SafeHtmlContent({ html, className }: Props) {
  // Double sanitization : backend + frontend (defense-in-depth)
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href'],
  });
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

// Usage :
<SafeHtmlContent html={post.content} className="prose" />
```

#### 3. Ne PAS re-sanitiser les champs texte

```tsx
// ❌ BAD : Le backend a déjà sanitisé
const sanitizedTitle = DOMPurify.sanitize(post.title);

// ✅ GOOD : Afficher directement
<h1>{post.title}</h1>
```

### 📋 Checklist XSS

- [ ] Audit de tous les `dangerouslySetInnerHTML`
- [ ] Composant `SafeHtmlContent` créé (optionnel)
- [ ] Pas de re-sanitization des champs texte
- [ ] Tests : `<script>` dans contenu n'exécute pas
- [ ] Tests : Liens avec `javascript:` sont bloqués

---

## 🟡 PRIORITÉ 4 : Referral Email Verification (#18)

### ❌ Problème
Backend requiert maintenant vérification email avant activation via referral.

### ✅ Solution Frontend

#### 1. Afficher statut après signup

```tsx
// pages/signup-success.tsx
export default function SignupSuccessPage() {
  const { user } = useAuth();
  
  if (user?.waitlistStatus === 'WAITING') {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">
          📧 Vérifiez votre email
        </h1>
        
        <p className="text-gray-600 mb-4">
          Un email de vérification a été envoyé à <strong>{user.email}</strong>
        </p>
        
        {user.referredBy && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">
              Vous avez utilisé un code de parrainage ! 
              Votre compte sera activé dès la vérification de votre email.
            </p>
          </div>
        )}
      </div>
    );
  }
  
  return <div>Compte activé !</div>;
}
```

#### 2. Endpoint de vérification email

```typescript
// api/auth.ts
export async function verifyEmail(token: string) {
  const response = await api.post('/auth/verify-email', { token });
  
  // Backend appelle acceptPendingReferralOnEmailVerification
  // qui peut changer waitlistStatus de WAITING à ACTIVE
  
  return response.data;
}
```

#### 3. Page de vérification avec feedback

```tsx
// pages/verify-email.tsx
export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const { token } = router.query;
  
  useEffect(() => {
    if (token) {
      verifyEmail(token as string)
        .then(() => {
          setStatus('success');
          // Refresh user data
          refetchUser();
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        })
        .catch(() => setStatus('error'));
    }
  }, [token]);
  
  if (status === 'loading') {
    return <div>Vérification en cours...</div>;
  }
  
  if (status === 'success') {
    return (
      <div className="text-center p-8">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Email vérifié !</h1>
        <p>Votre compte est maintenant actif. Redirection...</p>
      </div>
    );
  }
  
  return <div>Erreur de vérification</div>;
}
```

### 📋 Checklist Referral

- [ ] Page signup-success affiche message vérification
- [ ] Page verify-email gère le token
- [ ] Refresh user data après vérification
- [ ] Feedback visuel si code parrainage utilisé
- [ ] Tests : User avec referral passe WAITING → ACTIVE

---

## 🟡 PRIORITÉ 5 : Brute-Force Protection (#21)

### ❌ Problème
Backend bloque après 5 tentatives de code reset (HTTP 429).

### ✅ Solution Frontend

#### 1. Gérer 429 spécifiquement

```tsx
// pages/reset-password/verify.tsx
export default function VerifyResetCodePage() {
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  
  async function handleVerify(code: string) {
    try {
      await verifyResetCode(code, token);
      router.push('/reset-password/new-password');
    } catch (error) {
      if (error.response?.status === 429) {
        // Trop de tentatives
        setBlocked(true);
        toast.error('Trop de tentatives. Demandez un nouveau code.');
      } else if (error.response?.status === 400) {
        // Mauvais code
        setAttempts(prev => prev + 1);
        toast.error(`Code incorrect (${5 - attempts - 1} tentatives restantes)`);
      }
    }
  }
  
  if (blocked) {
    return (
      <div className="text-center p-8">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Trop de tentatives</h2>
        <p className="text-gray-600 mb-4">
          Pour votre sécurité, veuillez demander un nouveau code.
        </p>
        <Button onClick={() => router.push('/reset-password/request')}>
          Demander un nouveau code
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <input 
        type="text"
        placeholder="Entrez le code à 4 caractères"
        maxLength={4}
        disabled={blocked}
      />
      <Button onClick={() => handleVerify(code)}>
        Vérifier ({5 - attempts} tentatives restantes)
      </Button>
    </div>
  );
}
```

### 📋 Checklist Brute-Force

- [ ] Gestion 429 avec message clair
- [ ] Compteur de tentatives affiché
- [ ] Bouton "Demander nouveau code" si bloqué
- [ ] Input désactivé après blocage
- [ ] Tests : Après 5 mauvais codes, UI bloque

---

## 🎯 RÉSUMÉ DES ACTIONS

### Immédiat (Critique)
1. ✅ **Waitlist Guard** : Hook + Bannière + Désactivation boutons (2h)

### Important  
2. ✅ **File Upload** : Messages d'erreur + Validation client (30 min)
3. ✅ **XSS** : Audit `dangerouslySetInnerHTML` (1h)

### Recommandé
4. ✅ **Referral** : Flow onboarding (1h)
5. ✅ **Brute-Force** : Gestion 429 (30 min)

**TOTAL : ~5 heures**

---

## ✅ Tests Frontend Recommandés

```typescript
// __tests__/waitlist-guard.test.tsx
describe('Waitlist Guard', () => {
  it('should disable create post button for WAITING user', () => {
    render(<CreatePostButton />, { user: { waitlistStatus: 'WAITING' } });
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('should enable create post button for ACTIVE user', () => {
    render(<CreatePostButton />, { user: { waitlistStatus: 'ACTIVE' } });
    expect(screen.getByRole('button')).toBeEnabled();
  });
});
```

---

**Prochaine étape** : Tests E2E backend après validation frontend ✅
