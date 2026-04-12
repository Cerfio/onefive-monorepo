# OneFive Backoffice

Administration panel for the OneFive platform.

## Tech Stack

- **Next.js 15+** (App Router), **React 19**, **TypeScript 5.8**
- **Tailwind CSS v4**, **React Aria Components**
- **ky** HTTP client, **Sonner** toast notifications
- **react-hotkeys-hook** keyboard shortcuts

## Features & Improvements Tracker

### Batch 1 — Waitlist + Pagination + Sidebar

- [x] `IGNORED` enum value added to `WaitlistStatus`
- [x] `PATCH /admin/waitlist/:id/ignore` — ignore a waitlist entry
- [x] `POST /admin/waitlist/bulk-accept` — accept N oldest waitlist entries
- [x] Frontend: "Ignorer" button (replaces "Rejeter") + bulk accept input
- [x] Upgraded pagination from `SimplePagination` to numbered `PaginationPageMinimalCenter` on all pages
- [x] Backend returns `total` count on all list endpoints for proper pagination
- [x] Sidebar badge showing waitlist count (from `/admin/dashboard`)

### Batch 2 — Detail Views

- [x] `GET /admin/users/:id` — full user profile with posts, discussions, startups, relationships
- [x] `/users/[id]` page — profile card + tabbed sections (Posts, Discussions, Startups, Relations)
- [x] `GET /admin/startups/:id` + `/startups/[id]` page — full startup detail with members, dataroom, funding
- [x] `GET /admin/posts/:id` + `/posts/[id]` page — full post detail with engagement stats
- [x] `GET /admin/discussions/:id` + `/discussions/[id]` page — full discussion detail

### Batch 3 — Search & Filters

- [x] Search added to Posts, Discussions, Startups (backend `search` param + frontend search bars)
- [x] Date range filters supported on Users endpoint (backend `dateFrom`/`dateTo` params)
- [x] Audit logs filtering migrated from client-side to server-side (`search`, `resourceType` params)

### Batch 4 — Moderation + Bulk Actions + Export

- [x] `isHidden` field added to `Post` and `Discussion` models (Prisma)
- [x] `PATCH /admin/posts/:id/hide` and `PATCH /admin/discussions/:id/hide` endpoints
- [x] Frontend "Masquer"/"Afficher" buttons on posts and discussions lists
- [x] Bulk user actions: checkboxes + "Bannir"/"Supprimer" buttons with `POST /admin/users/bulk-ban` and `POST /admin/users/bulk-delete`
- [x] CSV export: `GET /admin/users/export`, `GET /admin/waitlist/export`, `GET /admin/audit-logs/export`
- [x] Frontend "Exporter CSV" buttons on Users, Waitlist, Audit logs pages

### Batch 5 — UX Polish

- [x] Reusable `Breadcrumbs` component (`src/components/application/breadcrumbs/breadcrumbs.tsx`)
- [x] Keyboard shortcuts: `/` or `Cmd+K` to focus search, `Escape` to blur (`src/hooks/use-admin-shortcuts.ts`)
- [x] Admin profile edit: `PATCH /admin/auth/me` (name + password change), inline edit UI in sidebar
- [x] Clickable table rows linking to detail pages throughout

## API Endpoints (Admin Module)

### Authentication (`/admin/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/admin/auth/signin` | Admin sign in |
| POST | `/admin/auth/logout` | Admin logout |
| GET | `/admin/auth/me` | Get current admin |
| PATCH | `/admin/auth/me` | Update admin profile |
| POST | `/admin/auth/invitations` | Create invitation |
| POST | `/admin/auth/accept-invitation` | Accept invitation |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/users` | List users (search, pagination, dateFrom/dateTo) |
| GET | `/admin/users/export` | Export users CSV |
| POST | `/admin/users/bulk-ban` | Bulk ban/unban users |
| POST | `/admin/users/bulk-delete` | Bulk delete users |
| GET | `/admin/users/:id` | User detail |
| PATCH | `/admin/users/:id/ban` | Ban/unban user |
| DELETE | `/admin/users/:id` | Delete user |

### Waitlist
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/waitlist` | List waitlist (search, pagination) |
| GET | `/admin/waitlist/export` | Export waitlist CSV |
| POST | `/admin/waitlist/bulk-accept` | Accept N oldest entries |
| PATCH | `/admin/waitlist/:id/accept` | Accept single entry |
| PATCH | `/admin/waitlist/:id/ignore` | Ignore entry |

### Posts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/posts` | List posts (search, pagination) |
| GET | `/admin/posts/:id` | Post detail |
| PATCH | `/admin/posts/:id/hide` | Hide/unhide post |
| DELETE | `/admin/posts/:id` | Delete post |

### Discussions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/discussions` | List discussions (search, pagination) |
| GET | `/admin/discussions/:id` | Discussion detail |
| PATCH | `/admin/discussions/:id/hide` | Hide/unhide discussion |
| DELETE | `/admin/discussions/:id` | Delete discussion |

### Startups
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/startups` | List startups (search, pagination) |
| GET | `/admin/startups/:id` | Startup detail |
| DELETE | `/admin/startups/:id` | Delete startup |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/spotlight` | List spotlight |
| GET | `/admin/datarooms` | List datarooms |
| GET | `/admin/admin-users` | List admin users |
| GET | `/admin/roles` | List roles |
| GET | `/admin/invitations` | List invitations |
| GET | `/admin/audit-logs` | List audit logs (search, resourceType, pagination) |
| GET | `/admin/audit-logs/export` | Export audit logs CSV |

## Prisma Schema Changes

Run migrations after pulling these changes:

```bash
cd onefive-back
npx prisma migrate dev --name "backoffice-improvements"
```

Changes:
- `WaitlistStatus` enum: added `IGNORED`
- `Post` model: added `isHidden Boolean @default(false)`
- `Discussion` model: added `isHidden Boolean @default(false)`
