# E2E tests — onefive-web

Playwright end-to-end tests. **Non-destructive** : they read the UI, open modals, and never submit posts, messages, conversations, or other mutations. Safe to run repeatedly against a dev DB.

## Quick start

```bash
# from onefive-web/
pnpm install                          # picks up @playwright/test
pnpm exec playwright install chromium # one-time browser download

# Make sure these are running first:
#   - front:      pnpm dev:web   (port 3002)
#   - back:       pnpm dev:back  (port 50050)
#   - localstack: docker compose up localstack -d  (from onefive-back/)

pnpm test:e2e                # run everything (~15 min cold, ~10 min warm)
pnpm test:e2e:ui             # Playwright UI for live debugging
pnpm test:e2e:debug          # step-by-step debugger
pnpm test:e2e:report         # open HTML report
```

## Test accounts (must exist in the seeded DB)

- `team@onefive.fr / 12345`
- `alice@onefive.fr / 12345`
- `bob@onefive.fr / 12345`

Override via env if needed:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3002 \
E2E_EMAIL=other@example.com E2E_PASSWORD=xxx \
pnpm test:e2e
```

## How it works

- **`auth.setup.ts`** — runs first. Logs in each account once, dumps cookies to `tests/e2e/.auth/{team,alice,bob}.json`. Also pre-warms every protected route so per-test `goto()` calls don't trip on Next.js cold compile.
- **`fixtures.ts`** — exposes `loggedInPage` (uses team's saved state) and `newLoggedInContext(browser, account)` for opening parallel sessions.
- **Projects** in `playwright.config.ts`:
  - `setup`     — runs `auth.setup.ts` and produces the storage states
  - `fresh`     — `auth.spec.ts`, `forms.spec.ts` (no saved auth — these test the login flow itself)
  - `team`      — every other spec, runs as `team@onefive.fr`
  - `interactions` — `interactions.spec.ts`, opens fresh contexts from saved states for Alice + Bob

## Spec files

| File | Coverage |
|---|---|
| `auth.spec.ts` | signin/signup form rendering, bad password, redirect after login |
| `navbar.spec.ts` | avatar dropdown opens (regression — react-aria version conflict), bell, search, menu items navigate |
| `pages.spec.ts` | every protected route loads with no uncaught JS error |
| `feed.spec.ts` | post create modal, dots dropdown, repost dropdown (regression — `Dropdown.Trigger` fix) |
| `discussions.spec.ts` | create modal opens, Publish button is disabled when invalid (regression — `isDisabled` vs `disabled` fix) |
| `dataroom.spec.ts` | list, create CTA, detail page, dots dropdown |
| `messages.spec.ts` | page loads, conversation thread opens (`new conversation CTA` is `fixme` — see below) |
| `network.spec.ts` | tabs render, search, click profile card → nav |
| `profile.spec.ts` | own profile, edit modal, settings page |
| `relationships.spec.ts` | "Coming Soon" placeholder loads |
| `notifications.spec.ts` | bell dropdown + tabs (no `/notifications` route exists — only via the bell) |
| `misc-pages.spec.ts` | `/analytics`, `/spotlight`, `/my-investments`, `/settings` load |
| `startup.spec.ts` | startup page loads from network |
| `forms.spec.ts` | signin submit disabled when empty, enabled when filled, discussion title validation |
| `responsive.spec.ts` | feed/dataroom/messages/profile at 375x667 don't horizontally scroll |
| `interactions.spec.ts` | Alice + Bob open feeds in parallel, view profiles, bell independence |

## Known `fixme` tests (not bugs in your suite — bugs in the app)

1. **`messages.spec.ts › new conversation CTA opens modal`** — `CreateConversationModal` imports `DialogTrigger` directly from `react-aria-components` (v1.10.1) while `Modal`/`ModalOverlay` come from `@onefive/ui` (v1.15.1). Same root cause as the navbar dropdown bug we fixed via `Dropdown.Trigger`. **Fix**: add `"react-aria-components": "1.15.1"` to root `package.json` `pnpm.overrides`, run `pnpm install`, restart dev server.

2. **`interactions.spec.ts › notification bell opens for both accounts independently`** — flaky in dev mode. Two simultaneous Next.js page compiles cause one context to time out before the navbar renders. Reliable in production builds (`pnpm build && pnpm start`).

## Why the fresh login flow exists at all

Storage state is reused everywhere except `fresh` projects. `auth.spec.ts` and `forms.spec.ts` both *exercise the login flow itself*, so they need an empty session.

## Files

```
playwright.config.ts            # 4 projects: setup → fresh + team + interactions
tests/e2e/
  .auth/                        # saved storage states (gitignored)
  auth.setup.ts                 # pre-warm + login each account
  fixtures.ts                   # login(), newLoggedInContext(), test extension
  *.spec.ts
  README.md                     # this file
```

## Tips

- The full suite takes ~15 min on cold dev. ~5-10 min once routes are compiled.
- Failures get traces, screenshots, and videos in `test-results/`.
- `pnpm test:e2e:report` shows the HTML dashboard.
- For CI: set `CI=1` (already used in config — bumps retries to 2, fails on `.only`).
- If a single spec hangs while you debug, stop with Ctrl-C — the dev server keeps running.
