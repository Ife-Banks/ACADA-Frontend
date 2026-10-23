# ACADA Cooperative Platform — User Manual

A role-by-role guide to the ACADA cooperative-management platform: how each role
uses its portal, what it may and may not do, and why.

| | |
|---|---|
| **Product** | ACADA — cooperative contribution, loan and payroll-deduction management |
| **Stack** | Django 6 + Django REST Framework (API) · Next.js 16 App Router (portals) |
| **Portals** | Member · Executive · Society Admin · Platform Console |
| **Roles** | `MEMBER` · `COMMITTEE_MEMBER` · `EXECUTIVE` · `SOCIETY_ADMIN` · `SUPER_ADMIN` |

---

## Read this first

Every screen in ACADA belongs to exactly one of five roles. This manual has one
chapter per role, plus two reference chapters. Read the chapter for your role;
skim the overview if the system is new to you.

| Chapter | Who it is for | What it covers |
|---|---|---|
| [00 — System overview](00-system-overview.md) | Everybody | The tenancies, the role model, the core concepts, the two end-to-end workflows, troubleshooting |
| [01 — Member](01-member.md) | `MEMBER` | Own contributions, loan applications, guarantee requests, notifications, profile |
| [02 — Committee member](02-committee-member.md) | `COMMITTEE_MEMBER` | Read-only oversight: ledger, cycles, reports, the loan book, the member directory |
| [03 — Executive](03-executive.md) | `EXECUTIVE` | Contribution confirmation, penalties, deduction schedules, loan decisions |
| [04 — Society admin](04-society-admin.md) | `SOCIETY_ADMIN` | The president portal: roster, roles, loan products, plans, society settings and rules |
| [05 — Platform admin](05-super-admin.md) | `SUPER_ADMIN` | Cross-tenant onboarding, lifecycle and statistics |
| [06 — Permissions reference](06-permissions-reference.md) | Everybody | Every screen and every endpoint, per role, in one table |

---

## The shortest possible summary

| Role | Portal | One-line summary |
|---|---|---|
| `MEMBER` | `/member/*` | "I want to know what I owe, what I have paid, and where my loan application stands." |
| `COMMITTEE_MEMBER` | `/executive/*` (read-only) | "I want to see the books and the loan book, but I do not want to change anything." |
| `EXECUTIVE` | `/executive/*` | "I want to run the monthly cycle and decide loan applications." |
| `SOCIETY_ADMIN` | `/admin/*` + `/executive/*` + `/member/*` | "I want to run the society: roster, roles, rates, plans, settings and rules." |
| `SUPER_ADMIN` | `/platform/*` | "I want to onboard and manage the societies that run on this platform." |

---

## Getting in

1. Open the app (the landing page is public — no sign-in needed to read it).
2. Go to **Sign in**.
3. Enter your **email** and **password**.
4. Society users (member through society admin) also enter the **society code**
   — for the demo society that is `acada`. Platform admins leave it blank.

If you have an account but no membership yet, the sign-in succeeds but every
society screen refuses to load, because the API requires an *active membership*
in the tenant. A society admin approves pending memberships from the roster
(see [04 — Society admin](04-society-admin.md#approving-a-pending-member)).

### Registering

`/register` is open to anyone, but registration only creates a **pending
membership**. The API replies:

```json
{
  "detail": "Registration successful. Your membership is pending approval.",
  "user": { "id": "…", "email": "…", "full_name": "…" }
}
```

A society admin must approve the membership before the new member can read
anything. This is deliberate: a cooperative decides who belongs to it.

### Deep links

If you are sent a link to a screen you are not signed in to, the app remembers
where you were going and returns you there after sign-in — **but only if your
role may open that path**. A member following `/executive/loans` lands on their
own dashboard instead of an error page. The `?next=` parameter can never be
used to reach a screen your role cannot open.

---

## The demo society

The seeded demo society (`acada`) is the quickest way to try every role.
Every account uses the password `Passw0rd!23`.

| Email | Role | Portal |
|---|---|---|
| `adebayo@acada.demo` | `MEMBER` | Member |
| `folake@acada.demo` | `MEMBER` (guarantor) | Member |
| `chinelo@acada.demo` · `hauwa@acada.demo` · `emeka@acada.demo` · `yusuf@acada.demo` | `MEMBER` | Member |
| `committee@acada.demo` | `COMMITTEE_MEMBER` | Executive (read-only) |
| `treasurer@acada.demo` | `EXECUTIVE` | Executive |
| `president@acada.demo` | `SOCIETY_ADMIN` | Society Admin |
| `platform@acada.demo` | `SUPER_ADMIN` | Platform Console |

`platform@acada.demo` is also a Django superuser, so it can sign in at
`/admin/` for raw database access.

---

## Related documentation

| Document | What it covers |
|---|---|
| [Backend README](../../../COOPERATIVE/README.md) | API surface, data model, permission classes, seed command, loan pricing |
| [Frontend README](../../README.md) | Route tree, motion system, `src/lib/roles.ts`, component conventions |
| [Permissions reference](06-permissions-reference.md) | The full screen × role and endpoint × role matrices |

---

_Manual last verified against the running system: ACADA commit working tree,
API `v1` with the `acada` demo tenant seeded._
