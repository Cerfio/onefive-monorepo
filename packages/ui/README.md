# @onefive/ui

Package interne centralisé pour les composants et fondations **Untitled UI** partagés entre les apps front OneFive.

## Installation (dans une app du workspace)

```json
// package.json de l'app
{
  "dependencies": {
    "@onefive/ui": "workspace:*"
  }
}
```

## Configuration Next.js — transpilePackages

```js
// next.config.mjs
const nextConfig = {
  transpilePackages: ["@onefive/ui"],
  // ...
};
```

## Configuration Tailwind v4

Dans le `globals.css` de l'app, importez le thème et ajoutez un `@source` pour que Tailwind scanne les composants du package :

```css
@import "tailwindcss";
@plugin "tailwindcss-react-aria-components";
@plugin "tailwindcss-animate";

/* Tokens Untitled UI (couleurs, typographie, ombres, etc.) */
@import "@onefive/ui/styles/globals.css";

/* Tailwind doit scanner les composants du package pour générer les classes */
@source "../../packages/ui/src";
```

> **Note :** Ajustez le chemin `@source` selon l'emplacement de l'app dans le monorepo.  
> Depuis `onefive-backoffice/` ou `onefive-web/` : `../../packages/ui/src`.

## Imports

```tsx
// Composants de base
import { Button } from "@onefive/ui/components/base/buttons/button";
import { Input } from "@onefive/ui/components/base/input/input";
import { Select } from "@onefive/ui/components/base/select/select";

// Fondations
import { FeaturedIcon } from "@onefive/ui/components/foundations/featured-icon/featured-icon";
import { Badge } from "@onefive/ui/components/base/badges/badges";

// Utilitaires
import { cx, sortCx } from "@onefive/ui/utils/cx";
import type { IconComponent } from "@onefive/ui/types/icon-component";
```

## Structure

```
packages/ui/src/
├── styles/
│   ├── globals.css     # @custom-variant dark + transition-inherit-all
│   └── theme.css       # tokens CSS Untitled UI (couleurs, typographie, ombres…)
├── utils/
│   ├── cx.ts           # twMerge étendu + sortCx
│   └── is-react-component.ts
├── types/
│   └── icon-component.ts
└── components/
    ├── base/           # Button, Input, Select, Avatar, Badge, etc.
    ├── foundations/    # FeaturedIcon, social-icons, payment-icons, etc.
    ├── application/    # Table, Modal, DatePicker, Navigation, etc.
    └── shared-assets/  # Illustrations, ImageCropper, QrCode, etc.
```

## Ce qui reste dans chaque app (non migré)

| App | Dossier | Raison |
|-----|---------|--------|
| `onefive-web` | `src/components/ui/` | Composants Shadcn/Radix — stack différente |
| `onefive-web` | `src/components/marketing/` | Composants marketing (à migrer ultérieurement) |
| `onefive-web` | `src/components/{profile,startup,feed,…}/` | Logique métier, non réutilisable |
| `onefive-backoffice` | `src/components/` dirs métier | Logique BO spécifique |

## Peer dependencies

- `react >= 19.0.0`
- `react-dom >= 19.0.0`
