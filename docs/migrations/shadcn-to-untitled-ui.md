# Migration complète : shadcn/ui → Untitled UI React

> **Statut** : à exécuter
> **Scope** : `onefive-web` (~150 fichiers) et marginalement `onefive-backoffice`
> **Référence canonique** : `docs/untitled-ui-AGENT.md` et https://www.untitledui.com/react/AGENT.md

---

## 1. Contexte et problème

### 1.1 Origine du problème

Le monorepo OneFive est censé utiliser **Untitled UI React** comme design system unique pour tous les fronts (`onefive-web`, `onefive-backoffice`, `landing-page`, `onefive-bo-landing-page`), comme stipulé dans le `.cursorrules` racine et la doc `docs/untitled-ui-AGENT.md`.

En pratique, **`onefive-web` contient encore une copie complète de la lib shadcn/ui** dans `onefive-web/src/components/ui/` (63 fichiers `.tsx`). Ces composants sont importés dans ~150 fichiers de l'app et **coexistent** avec les composants Untitled UI venant du package partagé `@onefive/ui`. Résultat :

- **Deux design systems en parallèle** dans la même app, deux APIs, deux styles visuels (boutons gris vs brand-purple, badges flat vs ring-1, etc.)
- **Incohérence visuelle** sur chaque page (un `<Button>` shadcn à côté d'un `<Button>` Untitled UI ne ressemblent à rien de pareil)
- **Dette technique massive** : maintenance double, divergence de tokens, migrations de version doublées
- **Ambiguïté pour les agents IA** : `from '@/components/ui/button'` (shadcn local) vs `from '@/components/base/buttons/button'` (re-export Untitled UI) — la convention n'est pas évidente

### 1.2 Pourquoi maintenant

Après le fix du `@source` Tailwind v4 (qui restaurait les classes Untitled UI manquantes), le codebase fonctionne **visuellement** mais l'incohérence est plus visible que jamais. Toute nouvelle feature ajoute encore des imports shadcn par habitude/copy-paste.

### 1.3 État cible

- **Zéro import** de `@/components/ui/*` dans `onefive-web/src/`
- Suppression complète du dossier `onefive-web/src/components/ui/` (sauf 3 exceptions documentées plus bas)
- Tous les composants UI viennent soit de `@onefive/ui` (préféré), soit du dossier `onefive-web/src/components/{base,application,foundations}/*` (re-exports/wrappers Untitled UI)
- Une règle ESLint qui bloque définitivement les nouveaux imports shadcn

---

## 2. État actuel — inventaire précis

### 2.1 Composants shadcn locaux (`onefive-web/src/components/ui/`)

63 fichiers, dont les plus utilisés (compté sur `*.tsx` de l'app) :

| Composant shadcn | Fichiers consommateurs | Equiv. Untitled UI |
|---|---:|---|
| `button` | 73 | `@onefive/ui/components/base/buttons/button` |
| `card` (+ `CardContent`, `CardHeader`, `CardTitle`, `CardAction`) | 46 | **N'existe pas** — pattern `<div>` avec tokens |
| `badge` | 41 | `@onefive/ui/components/base/badges/badges` |
| `dialog` (+ AlertDialog) | 31 | `@onefive/ui/components/application/modals/modal` |
| `input` | ~12 | `@onefive/ui/components/base/input/input` |
| `textarea` | ~7 | `@onefive/ui/components/base/textarea/textarea` |
| `avatar` (+ AvatarImage/AvatarFallback) | 8 | `@onefive/ui/components/base/avatar/avatar` |
| `checkbox` | 4 | `@onefive/ui/components/base/checkbox/checkbox` |
| `select` | 4 | `@onefive/ui/components/base/select/select` |
| `radio-group` | 2 | `@onefive/ui/components/base/radio-buttons/radio-buttons` |
| `switch` | 1 (`my-investments/page.tsx`) | `@onefive/ui/components/base/toggle/toggle` |
| `tooltip` | 6 | `@onefive/ui/components/base/tooltip/tooltip` |
| `dropdown-menu` | 1 (`StartupHeader.tsx`) | `@onefive/ui/components/base/dropdown/dropdown` |
| `alert` | 3 | `@onefive/ui/components/application/alerts/*` |
| `skeleton` | 4 | `@onefive/ui/components/application/loading-indicators/*` |
| `popover` | 1 (dans `multi-select.tsx`) | dispo via `Dropdown` ou React Aria `Popover` |
| `command` | 1 (dans `multi-select.tsx`) | `@onefive/ui/components/application/command-menus/*` |
| `pagination` | déjà ré-exporté côté `@onefive/ui` | OK |
| `separator` | 2 | `<div className="h-px bg-border-secondary" />` |
| `multi-select` (custom) | 5 | `@onefive/ui/components/base/select` (multi mode) |
| `flag` | 4 | **Custom OneFive — à conserver** |
| `saas-selector` (custom) | 1 | **Custom OneFive — à conserver** |
| `searchbar-bar` (custom) | 1 | **Custom OneFive — à conserver** |
| `animated-number` | 1 (`StartupHeader.tsx`) | **À conserver** (utilitaire animation) |
| `input-search`, `input-otp` | quelques-uns | À évaluer cas par cas |

### 2.2 À conserver (whitelist)

Ces fichiers de `components/ui/` ne sont **pas** du shadcn standard et n'ont pas d'équivalent Untitled UI direct. **À garder** :

- `flag.tsx` — composant drapeau pays custom OneFive
- `saas-selector.tsx` — composant métier OneFive
- `animated-number.tsx` — utilitaire d'animation
- `searchbar-bar.tsx` — searchbar custom
- `social-button.tsx`, `social-logos.tsx` — social-icons OneFive (à vérifier vs `@onefive/ui/components/foundations/social-icons`)

### 2.3 Hors scope (à ne pas toucher)

- **`landing-page/`** et **`onefive-bo-landing-page/`** — fronts marketing avec leur propre stack, migration séparée
- **`onefive-backoffice/`** — n'utilise déjà presque pas shadcn (vérifié : 0 import problématique). Laisser tel quel.

---

## 3. Mapping shadcn → Untitled UI (avec différences d'API)

Cette section est **critique** : un find/replace mécanique cassera tout. Chaque composant a une transformation API spécifique.

### 3.1 `Button` (73 fichiers)

```tsx
// AVANT (shadcn)
import { Button } from '@/components/ui/button';

<Button variant="outline" size="lg" disabled={loading} onClick={...}>
  <Icon className="mr-2" />
  Cliquer
</Button>

// APRES (Untitled UI)
import { Button } from '@/components/base/buttons/button';

<Button color="secondary" size="lg" isDisabled={loading} onClick={...} iconLeading={<Icon data-icon />}>
  Cliquer
</Button>
```

**Mapping `variant` → `color`** :

| shadcn `variant` | Untitled UI `color` |
|---|---|
| `default` | `primary` |
| `secondary` | `secondary` |
| `outline` | `secondary` |
| `ghost` | `tertiary` |
| `link` | `link-color` ou `link-gray` |
| `destructive` | `primary-destructive` |

**Pièges** :
- `disabled` → **`isDisabled`** (React Aria, pas HTML natif)
- Icône passée en JSX child → **`iconLeading={<Icon data-icon />}`** ou `iconTrailing`
- L'icône doit avoir l'attribut `data-icon` pour que le styling Untitled UI s'applique
- Pas de `asChild` (Radix pattern). Utiliser `href` directement sur `<Button>` (basé sur React Aria `Link`)

### 3.2 `Badge` (41 fichiers)

```tsx
// AVANT (shadcn)
import { Badge } from '@/components/ui/badge';

<Badge variant="secondary" className="bg-blue-100">Tag</Badge>

// APRES (Untitled UI)
import { Badge } from '@/components/base/badges/badges';

<Badge type="pill-color" color="brand" size="sm">Tag</Badge>
```

**Mapping `variant` → `type` + `color`** :

| shadcn `variant` | Untitled UI |
|---|---|
| `default` | `type="pill-color" color="brand"` |
| `secondary` | `type="pill-color" color="gray"` |
| `outline` | `type="badge-modern" color="gray"` |
| `destructive` | `type="pill-color" color="error"` |

**Couleurs disponibles** : `gray`, `brand`, `error`, `warning`, `success`, `gray-blue`, `blue-light`, `blue`, `indigo`, `purple`, `pink`, `orange`.

**Variantes** disponibles : `Badge`, `BadgeWithDot`, `BadgeWithIcon`, `BadgeWithFlag`, `BadgeWithImage`, `BadgeWithButton`, `BadgeIcon`.

**Pièges** :
- Pour les badges avec **`style` inline** (couleur de rôle dynamique), `Badge` accepte `style?: CSSProperties` (déjà ajouté dans `packages/ui/src/components/base/badges/badges.tsx` lors du fix précédent)
- **JAMAIS** de classes Tailwind dynamiques dans `className` (`bg-${color}-100` ne fonctionne pas — utiliser un lookup map)

### 3.3 `Card` (46 fichiers) — **Pas d'équivalent direct**

Untitled UI ne fournit pas de composant `Card`. Le pattern est un simple `<div>` avec les tokens du design system.

```tsx
// AVANT (shadcn)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>

// APRES (Untitled UI / pattern OneFive)
<div className="bg-primary ring-1 ring-secondary rounded-xl shadow-xs">
  <div className="px-6 pt-5 pb-4 border-b border-secondary">
    <h3 className="text-lg font-semibold text-primary">Titre</h3>
  </div>
  <div className="px-6 py-5">Contenu</div>
</div>
```

**Tokens à utiliser** (définis dans `packages/ui/src/styles/theme.css`) :
- Background : `bg-primary` (blanc), `bg-secondary` (gris très clair), `bg-tertiary`
- Border : `ring-1 ring-secondary`, `border-secondary`
- Texte : `text-primary`, `text-secondary`, `text-tertiary`, `text-quaternary`
- Radius : `rounded-xl` (12px) ou `rounded-2xl` (16px) pour cards
- Shadow : `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`

**Recommandation** : créer un wrapper `<Card>` local **uniquement si la même structure se répète** (header + content), sinon inliner.

### 3.4 `Dialog` / `AlertDialog` (31 fichiers)

```tsx
// AVANT (shadcn — Radix)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild><Button>Ouvrir</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
    </DialogHeader>
    Contenu
  </DialogContent>
</Dialog>

// APRES (Untitled UI / React Aria)
import { DialogTrigger as AriaDialogTrigger, Dialog as AriaDialog, Heading as AriaHeading } from 'react-aria-components';
import { Modal, ModalOverlay } from '@/components/application/modals/modal';
import { CloseButton } from '@/components/base/buttons/close-button';

<AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
  <Button>Ouvrir</Button>
  <ModalOverlay isDismissable>
    <Modal>
      <AriaDialog>
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
          <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
          <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
            <AriaHeading slot="title" className="text-lg font-semibold text-primary">Titre</AriaHeading>
            Contenu
          </div>
        </div>
      </AriaDialog>
    </Modal>
  </ModalOverlay>
</AriaDialogTrigger>
```

**Le pattern est déjà utilisé** dans `onefive-web/src/components/profile/ProfileActions.tsx` — s'en inspirer.

**Pièges** :
- React Aria gère le focus trap, la touche `Escape`, le scroll-lock automatiquement (pas besoin de `onPointerDownOutside` etc.)
- `asChild` n'existe pas — le `<DialogTrigger>` accepte directement les enfants
- Pour les `AlertDialog` (confirmations), utiliser le **`ConfirmDialogProvider`** déjà présent dans le codebase (cherche `useConfirm` dans `onefive-web`) plutôt qu'un Dialog custom

### 3.5 `Input` / `Textarea` (~19 fichiers)

```tsx
// AVANT (shadcn)
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// APRES (Untitled UI)
import { Input } from '@/components/base/input/input';

<Input
  type="text"
  placeholder="..."
  value={value}
  onChange={setValue}  // React Aria : reçoit la valeur directement, pas l'event
/>
```

**Piège majeur** : Untitled UI `Input` est basé sur React Aria, donc **`onChange` reçoit la nouvelle valeur en string**, pas un event. Tous les `e.target.value` doivent être supprimés.

`Textarea` : même API.

### 3.6 `Avatar` (8 fichiers)

```tsx
// AVANT (shadcn)
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src={url} alt={name} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// APRES (Untitled UI)
import { Avatar } from '@/components/base/avatar/avatar';

<Avatar
  src={url}
  alt={name}
  size="md"
  firstName={firstName}
  lastName={lastName}
/>
```

L'`Avatar` Untitled UI gère **automatiquement** :
- Le fallback initiales depuis `firstName` + `lastName`
- Les tailles via `size` (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
- Le badge online/offline via `status`
- Les contours/anneaux via `contrastBorder`

### 3.7 `Checkbox` / `Switch` (Toggle) / `RadioGroup`

```tsx
// Checkbox
// AVANT
<Checkbox checked={value} onCheckedChange={setValue} />
// APRES
import { Checkbox } from '@/components/base/checkbox/checkbox';
<Checkbox isSelected={value} onChange={setValue} />

// Switch → Toggle
// AVANT
<Switch checked={enabled} onCheckedChange={setEnabled} />
// APRES
import { Toggle } from '@/components/base/toggle/toggle';
<Toggle isSelected={enabled} onChange={setEnabled} />

// RadioGroup
// AVANT
<RadioGroup value={v} onValueChange={setV}>
  <RadioGroupItem value="a" />
</RadioGroup>
// APRES
import { RadioButtons, RadioGroup as AriaRadioGroup } from '@/components/base/radio-buttons/radio-buttons';
<AriaRadioGroup value={v} onChange={setV}>
  <RadioButtons value="a" />
</AriaRadioGroup>
```

### 3.8 `Tooltip` (6 fichiers)

```tsx
// AVANT
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger>
    <TooltipContent>Texte tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>

// APRES
import { Tooltip } from '@/components/base/tooltip/tooltip';

<Tooltip title="Texte tooltip">
  <Button>Hover</Button>
</Tooltip>
```

**Pas de `TooltipProvider` requis**, l'API est simplifiée.

### 3.9 `DropdownMenu` (1 fichier — `StartupHeader.tsx`)

Voir le pattern déjà présent dans `onefive-web/src/components/navbar/UserDropdown.tsx` :

```tsx
import { Dropdown } from '@/components/base/dropdown/dropdown';

<Dropdown.Root>
  <Dropdown.Trigger>...</Dropdown.Trigger>
  <Dropdown.Popover>
    <Dropdown.Menu>
      <Dropdown.Section>
        <Dropdown.Item icon={Icon} onAction={...}>Action</Dropdown.Item>
      </Dropdown.Section>
      <Dropdown.Separator />
    </Dropdown.Menu>
  </Dropdown.Popover>
</Dropdown.Root>
```

### 3.10 `Alert` (3 fichiers)

Untitled UI a `application/alerts/*` (12 variantes). Le plus simple :

```tsx
// AVANT
<Alert>
  <AlertTitle>Titre</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>

// APRES — pour un alert inline simple, un div suffit :
<div className="rounded-lg bg-error-secondary ring-1 ring-error p-4">
  <h4 className="text-sm font-semibold text-error-primary">Titre</h4>
  <p className="text-sm text-error-secondary mt-1">Description</p>
</div>
```

Pour des alerts plus riches, utiliser le MCP Untitled UI pour récupérer une variante :
```
mcp_user-untitledui_get_component({ name: "alerts", category: "application" })
```

### 3.11 `Skeleton` (4 fichiers)

```tsx
// AVANT
<Skeleton className="h-4 w-24" />

// APRES — pattern Untitled UI : pulse + bg-tertiary
<div className="h-4 w-24 rounded-md bg-tertiary animate-pulse" />
```

### 3.12 `Separator` (2 fichiers)

```tsx
// AVANT
<Separator />
// APRES
<div className="h-px w-full bg-border-secondary" />
// ou pour vertical :
<div className="h-full w-px bg-border-secondary" />
```

### 3.13 `MultiSelect` (custom) — 5 fichiers

Le composant custom `multi-select.tsx` utilise `command` + `popover` shadcn en interne. Untitled UI a un vrai `Multi select` (1 component + 4 variants).

À récupérer via :
```
mcp_user-untitledui_get_component({ name: "multi-select", category: "base" })
```

---

## 4. Phase d'exécution recommandée

La migration doit se faire **par vagues**, avec validation visuelle entre chaque, pour limiter le risque.

### Vague 1 — Composants atomiques simples (sans logique)

**Objectif** : remplacer mécaniquement `Button`, `Badge`, `Input`, `Textarea`, `Tooltip`, `Skeleton`, `Separator` partout. C'est la transformation la plus large mais la plus sûre car APIs proches.

**Ordre par dossier** (du moins critique au plus critique) :
1. `onefive-web/src/components/cards/` (CardSkill, CardExperience)
2. `onefive-web/src/components/sections/`
3. `onefive-web/src/components/network/` (DiscoveryCarousel, NetworkMap, AdvancedFilters, WelcomeMessage)
4. `onefive-web/src/components/discussions/`
5. `onefive-web/src/components/profile/` (ProfileHeader, AchievementsCard, ConnectionsCard, ActivityFeed, etc.)
6. `onefive-web/src/components/startup/` (StartupHeader, StartupAbout, FundingCard, MembersTable, FoundersTable, etc.)
7. `onefive-web/src/components/analytics/`
8. `onefive-web/src/components/feed/`
9. `onefive-web/src/components/messaging/`
10. `onefive-web/src/components/modals/` (ReportModal, CancelConnectionModal)
11. `onefive-web/src/features/post/`
12. `onefive-web/src/features/auth/` (Onboarding, Signup, Signin, password reset)
13. `onefive-web/src/features/startup/create/` (TeamStep, IdentityStep, ReviewStep)
14. `onefive-web/src/app/(protected)/` — par feature : spotlight, network, my-investments, settings, support, dataroom, analytics, discussions
15. `onefive-web/src/app/(public)/`
16. `onefive-web/src/app/(auth)/`

**Pour chaque fichier** :
1. Identifier les imports `from '@/components/ui/*'`
2. Remplacer par les imports Untitled UI correspondants
3. Adapter les props (`variant` → `color`, `disabled` → `isDisabled`, `onChange` value, etc.)
4. Lancer `pnpm tsc --noEmit` (ou laisser le LSP) pour valider les types
5. Vérifier visuellement la page concernée

### Vague 2 — Avatar, Checkbox, Switch, RadioGroup, Select

Plus risqué car APIs significativement différentes (notamment `Avatar` qui passe d'un composé à un composant unique).

### Vague 3 — Card → div+tokens

46 fichiers à transformer. Bien définir un **pattern standard de Card** (header + body + optional footer) et l'appliquer uniformément. Possibilité de créer un wrapper `<Card>` local dans `onefive-web/src/components/ui-shared/Card.tsx` si la structure se répète vraiment.

### Vague 4 — Dialog / AlertDialog → Modal Untitled UI

31 fichiers, le plus risqué car React Aria a un cycle de vie différent de Radix. À faire en dernier, avec test manuel de chaque modale.

### Vague 5 — Cleanup

1. Supprimer tous les fichiers de `onefive-web/src/components/ui/` **sauf** la whitelist (§2.2)
2. Ajouter une règle ESLint :
   ```js
   // eslint.config.js
   {
     rules: {
       "no-restricted-imports": ["error", {
         patterns: [{
           group: ["@/components/ui/*"],
           message: "Utiliser @onefive/ui ou @/components/{base,application} (Untitled UI)."
         }]
       }]
     }
   }
   ```
3. Mettre à jour `.cursorrules` pour interdire explicitement les nouveaux imports shadcn
4. Vérifier que le bundle final est plus léger (moins de Radix dans `package.json` peut être supprimé après audit)

---

## 5. Pièges connus et règles d'or

1. **JAMAIS** utiliser de classe Tailwind dynamique (`bg-${color}-100`). Toujours un lookup map avec classes complètes.
2. **`disabled` → `isDisabled`** sur tout composant React Aria (Button, Input, Select, etc.).
3. **`onChange` reçoit la valeur, pas l'event** sur Input/Textarea Untitled UI. Supprimer les `e.target.value`.
4. **`asChild` n'existe pas** dans React Aria. Les composants acceptent les enfants directement ou via `href`.
5. **Icônes** : passer via `iconLeading={<Icon data-icon />}` avec attribut `data-icon`, **pas** comme child `<Icon />Texte`.
6. **Modal** : ne pas oublier `<ModalOverlay isDismissable>` autour de `<Modal>` pour permettre la fermeture au clic extérieur.
7. **`<Heading slot="title">`** dans les Dialogs — c'est un pattern React Aria Heading, **pas** un `<h2>` simple.
8. **Le fix `@source`** dans `onefive-web/src/styles/globals.css` doit pointer vers `../../../packages/ui/src` (3 niveaux), sinon les classes Untitled UI ne sont pas générées (déjà corrigé, mais à surveiller).
9. **Tokens semantic**, pas raw : utiliser `bg-primary`, `text-secondary`, `ring-secondary` plutôt que `bg-white`, `text-gray-700`, `ring-gray-200`. Les tokens supportent dark mode automatiquement.

---

## 6. Validation et rollback

### 6.1 Critères de validation par fichier

Pour qu'un fichier soit considéré comme migré :
- [ ] Aucun import `from '@/components/ui/*'` sauf whitelist (§2.2)
- [ ] `pnpm tsc --noEmit` passe sans nouvelle erreur
- [ ] La page/composant rend visuellement (test manuel ou screenshot)
- [ ] Les interactions clé fonctionnent (clic, ouverture modale, soumission form)

### 6.2 Validation finale (avant cleanup)

- [ ] `rg "from '@/components/ui/" onefive-web/src --type tsx | grep -v "components/ui/(flag|saas-selector|animated-number|searchbar-bar|social-button|social-logos)"` retourne **vide**
- [ ] Lancement de Playwright e2e (`onefive-web/tests/e2e/`) — doit passer
- [ ] Dev local sur les 5 pages les plus visitées : feed, network, profile, startup, dataroom
- [ ] Build prod (`pnpm build`) passe

### 6.3 Stratégie de rollback

Travailler sur une branche dédiée `chore/migrate-shadcn-to-untitled-ui` avec **un commit par vague**. En cas de régression :
- `git revert <vague>` pour annuler une vague spécifique
- Les commits doivent être thématiques (ex: `chore(ui): migrate Button shadcn -> Untitled UI [vague 1]`)

---

## 7. Outils utiles

- **MCP Untitled UI** (`user-untitledui`) :
  - `list_components` — lister toute la lib
  - `get_component` — code source d'un composant spécifique
  - `search_components` — recherche sémantique (ex: "modal with file upload")
  - `get_component_bundle` — récupérer plusieurs composants liés en une fois

- **Recherche d'usages** :
  ```bash
  rg "from '@/components/ui/button'" onefive-web/src --type tsx -l
  ```

- **Comptage** :
  ```bash
  rg "from '@/components/ui/" onefive-web/src --type tsx -c
  ```

---

## 8. Référence — fichiers-clés à lire avant de commencer

1. `docs/untitled-ui-AGENT.md` — conventions Untitled UI complètes
2. `packages/ui/src/components/base/badges/badges.tsx` — exemple d'API Untitled UI
3. `packages/ui/src/components/base/buttons/button.tsx` — variantes Button
4. `packages/ui/src/components/base/dropdown/dropdown.tsx` — pattern compound component
5. `onefive-web/src/components/profile/ProfileActions.tsx` — exemple de Modal + Dialog Untitled UI déjà migré
6. `onefive-web/src/components/navbar/UserDropdown.tsx` — exemple de Dropdown Untitled UI complet
7. `packages/ui/src/styles/theme.css` — tous les tokens disponibles

---

## 9. Estimation

- **Vague 1** (Button/Badge/Input/Textarea/Tooltip/Skeleton/Separator) : ~1.5j
- **Vague 2** (Avatar/Checkbox/Switch/RadioGroup/Select) : ~0.5j
- **Vague 3** (Card → div+tokens) : ~1j
- **Vague 4** (Dialog/AlertDialog → Modal) : ~1j
- **Vague 5** (Cleanup + ESLint + tests) : ~0.5j

**Total** : 4-5 jours-développeur. À répartir sur plusieurs sessions/PRs distinctes pour faciliter la review.

---

## 10. Prompt suggéré pour reprendre la tâche

> Lis `docs/migrations/shadcn-to-untitled-ui.md` puis exécute **uniquement la Vague 1** (Button + Badge + Input + Textarea + Tooltip + Skeleton + Separator).
>
> Procède dossier par dossier dans l'ordre du §4. Pour chaque fichier :
> 1. Identifier les imports shadcn
> 2. Remplacer par les imports Untitled UI correspondants
> 3. Adapter les props strictement selon le mapping du §3
> 4. Lancer `ReadLints` pour vérifier
>
> Crée un commit par feature/dossier. Ne touche pas aux Card / Dialog / AlertDialog (vagues ultérieures).
