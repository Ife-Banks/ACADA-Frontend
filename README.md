# ACADA Frontend

Next.js 16 (App Router) client for the ACADA cooperative-management platform. It
talks to the Django/DRF API in `../COOPERATIVE` and exposes four portals:

| Portal | Route group | Roles |
| --- | --- | --- |
| Platform admin | `/platform/*` | `SUPER_ADMIN` |
| Society admin | `/admin/*` | `SOCIETY_ADMIN` |
| Executive | `/executive/*` | `EXECUTIVE`, `COMMITTEE_MEMBER` (read-only), `SOCIETY_ADMIN` |
| Member | `/member/*` | `MEMBER` |

## 📖 User manual

A complete, role-by-role guide to the portals — what each role can and cannot
do, a screen-by-screen walkthrough, numbered user stories and worked
examples:

| Chapter | Role |
| --- | --- |
| [00 — System overview](docs/user-manual/00-system-overview.md) | Everybody |
| [01 — Member](docs/user-manual/01-member.md) | `MEMBER` |
| [02 — Committee member](docs/user-manual/02-committee-member.md) | `COMMITTEE_MEMBER` |
| [03 — Executive](docs/user-manual/03-executive.md) | `EXECUTIVE` |
| [04 — Society admin](docs/user-manual/04-society-admin.md) | `SOCIETY_ADMIN` |
| [05 — Platform admin](docs/user-manual/05-super-admin.md) | `SUPER_ADMIN` |
| [06 — Permissions reference](docs/user-manual/06-permissions-reference.md) | Everybody |

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The API base URL defaults to `http://localhost:8000/api/v1`. Override it with an
`.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the backend from `../COOPERATIVE` first (`python manage.py runserver`), then
sign in. Platform admins leave the tenant-code field blank; society users must
enter their society code.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Motion system

All entrance animation is driven by one component, one hook and one config
file. Nothing else in the app hand-rolls an `IntersectionObserver` or a
fade-in.

- `src/components/motion/reveal.config.ts` — the 15 variants, their from/to
  values, the easing curves and the hover tokens. Tune the feel of the whole
  app here.
- `src/components/motion/Reveal.tsx` — `<Reveal variant delay duration
  distance once>` and the `useReveal()` hook, plus `<RevealText>` for
  headlines that rise word by word from behind a mask.
- `src/components/motion/` also holds the pointer-driven pieces:
  `MagneticButton`, `TiltCard`, `RollingLink`, `RollLabel`, `FloatingField`,
  `PillGroup` and `CustomCursor`.

Variants: `slide-left`, `slide-right`, `appear`, `fade-up`, `fade-down`,
`zoom-in`, `zoom-settle`, `clip-wipe`, `blur-sharp`, `flip-in`, `tilt-rise`,
`cascade`, `mask-text`, `draw`, `spotlight`.

Reveals trigger at "top 85%" of the viewport. `once={false}` replays on every
pass (used for the hero and feature sections); `once` is used for long lists
and grids. A grid marked `data-reveal-grid` staggers its children and
alternates the direction by column.

Only `transform`, `opacity`, `filter` and `clip-path` are animated, so
everything stays on the compositor. Under 768px the travel drops to 40px and
the heavy variants (3D flip, big blur) are flattened; on low-end hardware the
flip and spotlight variants step down automatically. `prefers-reduced-motion`
collapses every variant to a plain opacity fade.

Hover effects never hide information: the touch equivalents are `:active`
presses, and anything that is revealed on hover (a media overlay, a chip) is
always visible on touch devices.

## Architecture

- `src/app` — route groups and layouts. `(platform)`, `(admin)`, `(executive)`
  and `(member)` each have their own sidebar.
- `src/components/app` — feature-level client components (members, loans,
  contributions, platform, notifications).
- `src/components/ui` — shadcn/base-ui primitives. `src/components/app/shared`
  holds the neumorphic `Nm*` form/sheet/dialog kit used across the app.
- `src/lib/api` — typed API clients over `apiRequest`, which attaches the JWT,
  silently refreshes once on a 401 and throws a typed `ApiError`.
- `src/hooks` — React Query hooks. Cache keys live in `src/lib/query-keys.ts`.
- `src/lib/auth-context.tsx` — session state, cookie persistence and role-based
  redirect after login.

### Auth and roles

Tokens and a minimal session snapshot are stored in cookies. `src/proxy.ts`
(middleware) gates route groups and redirects each role to its home. Platform
users have no tenant membership, so the login client infers `SUPER_ADMIN` from
`user.is_platform_user` when the API omits `role`.

`src/lib/roles.ts` is the single source of truth for the access model, shared
with the backend:

| Role | Access |
|---|---|
| `MEMBER` | Own contributions, notifications and loan applications (submitted or guaranteed) |
| `COMMITTEE_MEMBER` | Read-only financials and loans — the ledger, cycles, reports, loans |
| `EXECUTIVE` | Financials, contribution confirmation, schedules, loan approvals |
| `SOCIETY_ADMIN` | Everything above, plus members, roles and society settings |
| `SUPER_ADMIN` | Cross-tenant platform endpoints |

`useAuth()` exposes that model as named helpers — `canReadFinancials`,
`canReadLoans`, `canConfirmContributions`, `canApproveLoans`,
`canManageSchedules`, `canManageMembers`, `canConfigureSociety` — so a
component asks a question rather than testing a role code.

Three layers enforce it, and only the last one matters:

1. `src/proxy.ts` decides which route group a role may open.
2. `RoleGate` and the per-action checks decide what a page shows.
3. The API re-checks every call, and refuses anything the role may not do.

`COMMITTEE_MEMBER` therefore opens `/executive/*`, reads the ledger and the
cycles, and sees no way to confirm a contribution, decide a loan, generate a
schedule or manage a member. `RoleGate` says so rather than showing a button
that would 403.

A role change takes effect without a re-login: the session's role is
reconciled from `GET /auth/me/` on load, so promoting somebody moves their
navigation and their permissions immediately.

Signing in from a deep link returns you to where you were going: the proxy
sends an unauthenticated visitor to `/login?next=…`, and the login flow
honours it — but only when the role may open that path, so `?next=` can
never send somebody to a page their role cannot reach.

## Implemented screens

- **Platform admin** — society list with activate/suspend/deactivate; onboarding
  dialog; tenant detail with overview, branding, settings and versioned JSON
  business rules; cross-tenant statistics.
- **Society admin** — member roster (search/status filters over the full
  roster), pending approvals, roles/status changes, loan products (create, edit,
  activate/deactivate), contribution plans (create, edit, default, end) and the
  society's own branding, settings and versioned business rules.
- **Executive** — dashboard, monthly contribution cycles, bulk/single entry
  confirmation, penalties, deduction schedules with CSV/Excel export, loan
  application review, and the immutable financial ledger.
- **Member** — dashboard, contribution history/balance, loan eligibility,
  multi-step loan application with guarantor selection, active loans with
  repayment schedules, application tracking, guarantee requests awaiting a
  confirm/decline response, notifications and profile.

### Interest rates in the UI

A society sets its rates under **Loan Products** (`/admin/loan-products`).
Every product carries a rate *and* a basis — **flat** (simple interest on the
original amount) or **reducing balance** (amortised, interest on what is still
owed) — because the two cost a member very different amounts over the same
term. Editing a product is a society-admin act; everyone else sees the rate
that applies to their own loans.

The application sheet prices the loan live: as the member types an amount and
picks a term, `POST /loans/quote/` returns the total interest, the total
repayable, the monthly instalment and the full instalment schedule. The
backend runs the same calculator it uses to write the contract, so the figure
shown before applying is the figure the member will be charged. The same
numbers are repeated on the review step.

Society-wide policy — the house rate, the default basis, the escalation
threshold and the term ceiling — lives in the **Business rules** tab of the
society settings, as versioned JSON. The editor lists the keys it understands
next to the textarea, so the contract between the society and the backend is
written down rather than folklore.

## Backend endpoints the UI relies on

| Endpoint | Used for |
| --- | --- |
| `GET /loans/applications/guarantor-requests/` | Guarantee requests addressed to the signed-in member |
| `GET /loans/applications/{id}/guarantee-request/` | Restricted application view for a guarantor |
| `POST /loans/applications/{id}/confirm-guarantor/` | Confirm or decline a guarantee |
| `GET /loans/applications/?scope=mine` | The member's own applications (default scope also includes guarantees) |
| `POST /loans/quote/` | Live repayment estimate in the loan application sheet — interest, total repayable, monthly instalment, schedule |
| `POST /loans/eligibility/` | Rule evaluation; also returns the same quote when an amount and term are supplied |
| `GET /platform/tenants/{id}/` · `branding/` · `settings/` · `rules/` | Society settings — readable and writable by the society's own `SOCIETY_ADMIN` |
| `?search=` on members, tenants, plans, loan products and applications | Server-side search — member search also matches employee and payroll numbers |

## Known limitations

These are backend constraints, not missing frontend wiring:

- There are no repayment-recording or penalty apply/waive endpoints, so those
  actions are not exposed.
- Neither project currently has an automated test suite.

## Conventions

- Keep API calls in `src/lib/api`, wrap them in `src/hooks`, and consume hooks
  from components.
- Add new cache keys to `src/lib/query-keys.ts`; invalidate the domain root
  after mutations.
- Use the `Nm*` shared components for forms and dialogs so the neumorphic style
  stays consistent.
