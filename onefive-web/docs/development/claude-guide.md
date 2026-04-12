# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev          # Start Next.js development server
npm run dev:turbo    # Start with Turbopack (faster builds)
```

**Build & Production:**
```bash
npm run build        # Build for production
npm run start        # Start production server
```

**Code Quality:**
- ESLint is configured with TypeScript rules
- Prettier formatting with 120 character line width, single quotes
- No specific test framework detected - check with team for testing setup

## Project Architecture

### Framework & Core Technologies
- **Next.js 15.3** with App Router (src/app directory structure)
- **React 19** with TypeScript 5.8
- **Tailwind CSS v4.1** for styling
- **Untitled UI Components** - extensive UI component library
- **TanStack Query** for server state management
- **React Aria Components** for accessibility
- **Internationalization** with next-intl (English/French support)

### Directory Structure

**App Structure (App Router):**
- `src/app/(auth)/` - Authentication routes (signin, signup, onboarding)
- `src/app/(protected)/` - Protected routes requiring authentication
- `src/app/api/` - API routes

**Key Protected Routes:**
- `/analytics` - Analytics dashboard
- `/dataroom/[id]` - Data room with file management and versioning
- `/discussions/[id]` - Discussion threads with voting system
- `/feed` - Social feed with posts and interactions
- `/network` - Professional networking features
- `/profile/[id]` - User profiles
- `/spotlight` - Event/opportunity discovery with map integration
- `/startup/[id]` - Startup profiles and investment features

**Component Architecture:**
- `src/components/base/` - Basic UI components (buttons, inputs, forms)
- `src/components/application/` - Complex application components
- `src/components/ui/` - Shadcn-style reusable UI components
- `src/components/marketing/` - Marketing page components
- Feature-specific components organized by domain (analytics, dataroom, discussions, etc.)

### State Management & Data Flow
- **TanStack Query** for server state with custom hooks in `src/queries/`
- **Context providers** in `src/providers/` for theme, auth, translations
- **Custom hooks** in `src/hooks/` for common functionality
- **Feature-based organization** with dedicated hooks, queries, and components

### Key Features
- **Multi-language support** (English/French) with next-intl
- **File management system** with versioning and access control
- **Discussion system** with threaded comments and voting
- **Professional networking** with connection management
- **Analytics dashboard** with file tracking
- **Startup ecosystem** features (profiles, funding, cap tables)
- **Real-time features** for notifications and messaging

### Styling & Design System
- **Tailwind CSS v4.1** with custom theme configuration
- **CSS custom properties** for theming (light/dark mode)
- **Typography system** with Inter font
- Path aliases configured for clean imports (@/, @/components/, etc.)

### File Upload & Document Handling
- PDF, DOCX, image, and video viewer components
- File tracking and analytics system
- Document versioning capabilities

### Authentication & Authorization
- HOCs for auth protection: `withAuth`, `withoutAuth`, `withAuthAndProfileNotCompleted`
- Onboarding flow with multi-step process
- OAuth2 integration capabilities

## Development Guidelines

### Import Paths
Use configured path aliases:
- `@/*` for src files
- `@/components/base/*` for base components  
- `@/hooks/*` for custom hooks
- `@/utils/*` for utilities
- `@/types/*`, `@/enums/*`, `@/constants/*` for shared definitions

### Component Organization
- Follow the established pattern of organizing components by domain
- Use base components for simple UI elements
- Application components for complex business logic
- Feature-specific components should be co-located with their routes

### Code Style
- Follow existing ESLint/Prettier configuration
- Use TypeScript for all new code
- No console.log in production (only console.error/warn allowed)
- Single quotes, 120 character line width
- Functional components with hooks

### Internationalization
- All user-facing text should use translation keys
- Locale files in `src/lib/i18n/locales/`
- Supports English (en) and French (fr)