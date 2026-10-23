# 05 — Platform admin manual

> **Role:** `SUPER_ADMIN` · **Portal:** `/platform/*` · **Home:** `/platform/stats`
> **Demo account:** `platform@acada.demo` (also a Django superuser)

The platform admin runs the **SaaS**, not a society. You onboard
cooperatives, manage their lifecycle, and watch the health of the platform as
a whole. You do not run any society's books — that society's own officers do
that, inside their own tenant.

This is the only role with a **cross-tenant** view, and the only role that
signs in **without a society code**.

---

## 1. The platform console

Navigation:

| Item | Route | What it is |
|---|---|---|
| **Overview** | `/platform/stats` | Platform-wide statistics |
| **Cooperative societies** | `/platform/tenants` | Every society on the platform |

There are exactly two screens and one dialog. Everything the platform does
for societies happens inside them.

## 2. Signing in

Leave the **society code** field **blank**. A platform admin is not a member of
any society, so there is no code to give.

> If you type a code, sign-in fails. That is deliberate — a platform admin
> with a tenant code would be a member of that society, which is a different
> thing.

`platform@acada.demo` is also a Django superuser, so it can open
`/admin/` for raw database access — useful when you need to see a row the
console does not surface.

---

## 3. Overview — `/platform/stats`

Five figures, straight from `GET /api/v1/platform/stats/`:

| Figure | Meaning |
|---|---|
| **Total societies** | Every tenant on the platform |
| **Active societies** | Tenants whose status is `active` |
| **Suspended** | Tenants blocked from signing in |
| **Users** | Every user account across all societies |
| **Active memberships** | Every active membership across all societies |

The demo platform reports **1 society, 1 active, 10 users, 9 active
memberships**.

These are platform-wide counts — they aggregate across tenants. Nothing on
this screen is scoped to one society, because you are not inside one.

---

## 4. Cooperative societies — `/platform/tenants`

The tenant register. Three tiles (total societies, active, suspended) plus a
search box and a status filter, over a table of every society on the
platform.

| Column | Notes |
|---|---|
| Society | The name, with the institution underneath |
| Code | The society's short code — this is what its members type at sign-in |
| Status | `active` / `suspended` / `deactivated` |
| Onboarding | `Pending Setup` / `Configuring Rules` / `Importing Members` / `Operational` |
| Members | The society's member count |
| Created | When it was onboarded |

Search and status filtering run across **all pages**, not just the loaded
one.

**Onboard a society** opens the dialog that creates a tenant with default
branding and settings:

| Field | Required | Notes |
|---|:--:|---|
| **Society code** | ✅ | e.g. `acada`. Short, unique, and the code its members will type at sign-in |
| **Society name** | ✅ | e.g. *ACADA Cooperative Society* |
| **Institution** | | e.g. *University of Ibadan* |
| **Description** | | A short description of the society |
| **Contact email** | ✅ | The society's administrative contact |
| **Contact phone** | | |
| **Address** | | The society office address |

### 4.1 A society's detail — `/platform/tenants/{id}`

The header carries the society's name, its status badge, its onboarding
badge, and three lifecycle buttons:

| Button | Available when | What it does |
|---|---|---|
| **Activate** | the society is not active | Restores access |
| **Suspend** | the society is active | Blocks the society from signing in until reactivated |
| **Deactivate** | the society is not deactivated | Marks the society inactive — intended for offboarded societies |

Each opens a confirmation dialog that states plainly what will happen:

- *Activate* — "{Society} will regain access to the platform."
- *Suspend* — "{Society} will be blocked from signing in until reactivated."
- *Deactivate* — "{Society} will be marked inactive. This is intended for
  offboarded societies."

**Nothing is deleted.** A suspended or deactivated society keeps every
member, every cycle, every ledger event and every loan. That is why
*Suspend* is the right tool for a society that is having a bad week, and
*Deactivate* is for one that has left the platform.

Four tabs:

#### **Overview**

| Field | |
|---|---|
| Society code | The sign-in code |
| Institution | |
| Contact email · Contact phone | |
| Currency | From the society's settings |
| Financial year starts | The month name, from the settings |
| **Active rule version** | *Version 2*, or *"No active rules"* |
| Created · Last updated | |

Plus the society's address, and a warning banner if the society has no
settings record yet.

#### **Branding** · **Settings** · **Rules**

The same three forms the society admin sees, at `/admin/settings` — but you
are editing them from the platform side, for a society that may not have a
society admin yet.

- **Branding** — logo URL, primary colour, secondary colour, app name
  override.
- **Settings** — currency, timezone, locale, financial year start month,
  notification policy.
- **Rules** — the versioned business rules. The editor is a JSON textarea
  seeded with the active version, and the platform lists the keys it reads:

  | Section | Key | Effect |
  |---|---|---|
  | `loan` | `escalation_threshold` | Amounts above this are always escalated to the executives |
  | `loan` | `default_interest_rate` | Pre-fills the rate on newly created loan products |
  | `loan` | `default_interest_method` | `"flat"` or `"reducing"` — pre-fills newly created loan products |
  | `loan` | `max_term_months` | Society-wide ceiling on the repayment term |
  | `penalty` | `missed_payment_flat` | Flat penalty for a missed contribution |
  | `penalty` | `missed_payment_rate` | Penalty as a share of the amount due; used when it is above 0 |

  **Publish rule version** creates a new version and archives the previous
  one, so the policy history of every society is intact.

---

## 5. What a platform admin cannot do

| | Why |
|---|---|
| Confirm a contribution, generate a schedule, decide a loan | Society operations, inside a tenant |
| Read one society's ledger, cycles or loan book | Tenant data belongs to the society's officers; you get aggregate statistics, not their books |
| Manage a society's members and roles | Society-admin-only, within that society |
| Create a contribution cycle | Executive, within that society |

### 5.1 Why the society screens come back empty

If you sign in as `platform@acada.demo` and then open `/member/...` or
`/executive/...`, the route gate sends you straight back to `/platform/stats`
— the platform console has its own portal, and it is not a shortcut into a
society.

Even if you call a society endpoint directly with a platform token, you get
**no data**. A platform admin's token carries no tenant, and every
tenant-scoped queryset resolves to an empty set when there is no tenant. You
see the platform's aggregate view; you do not get a back door into an
individual society's books. That is the isolation boundary doing its job.

---

## 6. User stories

| # | Story |
|---|---|
| P1 | *As a platform admin, I want to onboard a society in one dialog, so that a new cooperative can start.* |
| P2 | *As a platform admin, I want the society's code to be set at onboarding, so that its members know what to type at sign-in.* |
| P3 | *As a platform admin, I want to see every society at once with its status and onboarding state, so that I can spot one that is stuck.* |
| P4 | *As a platform admin, I want to suspend a society without deleting it, so that its history is preserved and it can be reinstated.* |
| P5 | *As a platform admin, I want a distinct "deactivate" for offboarded societies, so that my register stays meaningful.* |
| P6 | *As a platform admin, I want to open a society's configuration, so that I can fix something the society admin cannot.* |
| P7 | *As a platform admin, I want to publish a rule version on a society's behalf, so that a new society has policy before its first loan.* |
| P8 | *As a platform admin, I want cross-tenant statistics, so that I know the platform is healthy.* |
| P9 | *As a platform admin, I want to see how many users and active memberships there are, so that I can understand adoption.* |
| P10 | *As a platform admin, I want to sign in without a society code, so that I am not accidentally treated as a member of one society.* |

---

## 7. Worked example — onboarding a new society

**1. Onboard it.** *Cooperative societies → Onboard a society*. Code
`uiog`, name *UI Co-operative Society*, institution *University of Ibadan*,
contact email `admin@uiog.org`, contact phone `+234 800 000 0000`. Submit.

The tenant is created with default branding and settings. It appears in the
register with status `active` and onboarding state *Pending Setup*.

**2. Configure its policy.** Open it → **Rules**. The active rules are
seeded with defaults. She sets the house rate and the escalation threshold
for the society's circumstances and publishes **version 1**.

**3. Brand it.** **Branding** → logo URL, the society's primary and secondary
colours, and an app name override of *"UI Co-operative Society"* so the
members see their own society's name in the portal.

**4. Set its calendar.** **Settings** → currency `NGN`, timezone
`Africa/Lagos`, locale `en-NG`, financial year starting in January.

**5. Hand over.** The society's first administrator is registered by that
society, with the code `uiog`. The admin approves the pending membership,
and the society's first president can sign in and configure its own roster,
products and plans.

**6. Watch it.** Back on *Cooperative societies*, the new society shows
*Operational*, one member, and the platform's totals have gone up by one
society and one user.

---

## 8. FAQ

**Q. Why does the sign-in form want a society code from me?**
It does not for you — leave it blank. The field is for society users.

**Q. Can I look at one society's members from here?**
No. The platform console deliberately does not expose tenant membership data.
You manage the society's *lifecycle* and *configuration*; its people and its
books are its own officers' business, and they operate inside the tenant.

**Q. What is the difference between Suspend and Deactivate?**
**Suspend** blocks the society from signing in until you reactivate it —
reversible, and the right tool for a society that is having a bad week.
**Deactivate** marks the society inactive for good — for offboarded
societies. Neither deletes anything.

**Q. What is the Onboarding badge?**
It tracks setup progress, not activity: *Pending Setup*, *Configuring Rules*,
*Importing Members*, *Operational*. It is how you spot a society that was
onboarded but never finished being set up.

**Q. Can I edit a society's rules even after it is operational?**
Yes — and you should. Publishing a new version archives the old one, so the
policy in force at any past moment remains knowable.

**Q. I deactivated a society by mistake. Can I undo it?**
Yes. **Activate** restores it. Nothing is ever hard-deleted from the console.

**Q. Do I need the Django admin?**
Only for raw data. The platform console covers the whole tenant lifecycle;
`/admin/` is there for the rows the console does not surface.

---

**Next:** [06 — Permissions reference](06-permissions-reference.md)
