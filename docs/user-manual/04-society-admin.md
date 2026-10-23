# 04 — Society admin manual

> **Role:** `SOCIETY_ADMIN` (president) · **Portal:** `/admin/*` + `/executive/*` + `/member/*` · **Home:** `/admin/members`
> **Demo account:** `president@acada.demo` (Bolanle Ajayi)

The society admin is the **owner** of one society's configuration. You hold
every power the executive holds — you can confirm contributions, generate
schedules, decide loans — and on top of that you own the things an executive
must not touch: the roster, the roles, the rates, the plans and the rules.

Your portal is the **president portal**: a wider sidebar with two groups.

| Group | Items |
|---|---|
| **Society Admin** | Members · Loan Products · Contribution Plans · Settings |
| **Executive** | Dashboard · Cycles · Schedules · Loan Applications · Financial Ledger |

You also keep `/member/*` — you are a member of your own society, with your
own contributions, your own loans and your own guarantee requests.

---

## 1. What a society admin can see and do

| Area | Read | Write |
|---|:--:|:--:|
| Own contributions and notifications | ✅ | — |
| Dashboard figures and reports | ✅ | — |
| Contribution cycles | ✅ | ✅ open, close, confirm |
| Cycle entries and penalties | ✅ | ✅ confirm entries |
| Contribution plans | ✅ | ✅ create, edit, set default, end |
| Financial ledger | ✅ | — (append-only by design) |
| Loan applications | ✅ | ✅ approve / reject |
| Loan products | ✅ | ✅ create, edit, activate, deactivate |
| **Interest rates and basis** | ✅ | ✅ **only this role** |
| Deduction schedules | ✅ | ✅ generate, export |
| **Member roster** | ✅ full record | ✅ add, approve, suspend, remove, re-role, edit profile |
| **Society branding, settings, rules** | ✅ | ✅ publish rule versions |
| Platform endpoints | — | — (`SUPER_ADMIN` only) |

## 2. What a society admin cannot do

| | Why |
|---|---|
| Onboard, suspend or deactivate a **society** | That is the platform's job, not the society's |
| Read another society's data | Tenant isolation is absolute |
| Reach `/platform/*` | The route gate sends you to your own portal |

---

## 3. Members — `/admin/members`

The roster. Only a society admin sees this screen at all; an executive or
committee member who types the URL gets *"Society admin access required —
managing members, roles and society settings is reserved for the society
admin."*

### 3.1 The roster screen

Three tiles:

| Tile | Meaning |
|---|---|
| **Total members** | Everyone in the society |
| **Pending approvals** | Registrations waiting for you |
| **Society** | The society's own name |

Two tabs:

- **All** — every membership, with a search box and a status filter
  (all / active / pending / suspended).
- **Pending** — the registrations awaiting approval, each with a one-click
  **Approve** button. Approving tells the member *"Membership approved — the
  member can now sign in."*

The table shows each member's name, email, role badge, status badge and join
date. Clicking a row opens that member's detail page.

Search is **server-side** and matches name, email, **employee number** and
**payroll number** — the two numbers the bursary knows you by.

### 3.2 Adding a member

**Add member** opens a sheet with:

| Field | Notes |
|---|---|
| First name | Required |
| Last name | Required |
| Email address | Required |
| Phone number | Optional |
| Employee number | Optional, e.g. `EMP-00123` |
| Department | Optional, e.g. *Faculty of Engineering* |

This creates an **active** membership and the member's profile record, and marks
you as the approver.

> **Known limitation.** The new account is created with a randomly generated
> temporary password, but the welcome email that is meant to carry it is still
> a `TODO` in the backend — nothing is sent. Until that is wired up, a member
> created this way cannot sign in until their password is set another way.
> Self-registration (`/register`) + **Approve** does not have this problem,
> because the member chooses their own password at registration.

### 3.3 A member's detail — `/admin/members/{id}`

The **full** record. This is the screen only a society admin can open, and it
is the reason the full record exists: the society needs employee numbers,
payroll numbers, dates of birth, next-of-kin details and bank coordinates to
run payroll deductions.

Three actions, in the header:

#### **Edit profile**

A sheet over the member's employment, payroll and bank details:

| Field | Notes |
|---|---|
| Employee number | |
| Payroll number | |
| Department · Faculty | |
| Designation | e.g. *Senior Lecturer* |
| Employment status | **Required** — active / on leave / retired / terminated |
| Date of birth | |
| Member since | |
| Next of kin · Next of kin phone | |
| Bank name · Account number | |

#### **Change role**

A dialog that updates the member's role. The roles available are the four
**tenant-scoped** roles — a society admin can hand out a role inside their own
society, never a platform one:

| Role | What it means |
|---|---|
| `MEMBER` | Ordinary member |
| `COMMITTEE_MEMBER` | Read-only oversight |
| `EXECUTIVE` | Treasurer / officer — can confirm, schedule and decide loans |
| `SOCIETY_ADMIN` | President — full control of the society |

`SUPER_ADMIN` is **not** on offer: the API only accepts tenant-scoped roles,
so a society admin cannot mint a platform administrator. Platform
administrators are created out of band.

> A role change takes effect **immediately**, without the person re-logging
> in: the session's role is reconciled from `GET /auth/me/` on every load, so
> their navigation and permissions change on the next page refresh.

#### **Change member status**

A dialog that offers only the transitions that make sense from the member's
current status. The membership statuses are `pending` → `active` →
`suspended` / `removed`.

| Action | From | Effect |
|---|---|---|
| **Approve membership** | `pending` | The member gains full access |
| **Reactivate member** | `suspended` | Access is restored |
| **Suspend member** | `active` | Access is withdrawn; the record is kept |
| **Remove member** | anything except `removed` | The membership is marked `removed` — the member loses access permanently, and the record and the contribution history stay in the database |

Suspending and removing both require a **Reason**, which is stored with the
change. The reason field is where you explain the decision to the member and
to the auditor.

> Every status change is written to the **audit trail** with the previous
> status, the new status and your reason, so the record says *why* a
> membership changed and not only that it did.

---

## 4. Loan Products — `/admin/loan-products`

The society's loan catalogue. **This is the only role that may write a rate.**

### 4.1 The catalogue

Three tiles (total products, active, inactive — clickable filters) plus a
search box. Each product card shows:

| Field | Notes |
|---|---|
| Name | |
| Description | |
| Interest rate | e.g. `5.00` |
| **Interest basis** | *"Flat (simple) interest"* or *"Reducing balance (amortised)"* |
| Max amount | |
| Min / max term | In months |
| Guarantors required | |
| Max multiplier | e.g. `2.00x contributions` |
| Auto-approve threshold | The amount at or below which the engine approves by itself |
| Min membership / min contributions | In months |
| Created | |

Per product: **Edit product**, and **Activate** / **Deactivate**. A
deactivated product stays in the catalogue but disappears from the member's
application form.

### 4.2 Creating or editing a product

**Create Loan Product** / **Edit Loan Product** dialog:

| Field | Required | Notes |
|---|:--:|---|
| Product name | ✅ | e.g. *Staff Salary Advance* |
| Description | | What it is for |
| Max amount (₦) | ✅ | The ceiling |
| **Interest rate (%)** | ✅ | The annual percentage |
| **Interest basis** | ✅ | **Flat** or **Reducing balance** |
| Min term (months) | ✅ | |
| Max term (months) | ✅ | Capped by the society's `max_term_months` |
| Guarantors required | ✅ | |
| Max multiplier | | How many times savings a member may borrow |
| Min membership (months) | | How long they must have belonged |
| Min contributions (months) | | How many months they must have paid |
| Auto-approval threshold (₦) | | Above this, the application escalates |

> **The rate and the basis are pre-filled from the society's rule set** —
> `default_interest_rate` and `default_interest_method`. That is how you set
> the house rate once and have every new product start from it.
>
> **The basis is not optional and it is not cosmetic.** Flat charges interest
> on the original amount for the whole term; reducing charges interest only
> on what is still owed. On a ₦500,000 twelve-month loan at 5%, flat costs
> **₦25,000** in interest and reducing costs **₦13,644.89**. The member sees
> this number before they apply, so it must be right.

---

## 5. Contribution Plans — `/executive/plans`

Society configuration, so it lives in the president portal even though the
route is under `/executive`.

A plan is how much each member is due each month. Three tiles, then the plan
table. Per plan the actions are:

| Action | Effect |
|---|---|
| **Edit plan** | Change the name, amount, dates or description |
| **Make default** | New cycles are generated from the default plan |
| **End plan** | Give it an end date, so it stops being used |

**New plan** / **Edit contribution plan** dialog:

| Field | Notes |
|---|---|
| Plan name | e.g. *Standard Monthly* |
| Fixed monthly amount (₦) | e.g. `25000` |
| Effective from | |
| Effective to | |
| Description | What the plan covers |

> **The default plan must be active and open-ended** (`effective_to` empty)
> for cycles to generate entries. A plan with an end date — even a future
> one — is ignored. The Cycles screen warns you when this is not the case,
> and the **New cycle** button stays disabled.

---

## 6. Settings — `/admin/settings`

Three tabs. Everything here is scoped to **your own society**; you can never
reach another society's configuration, even though the API lives under
`/platform/`.

### 6.1 Branding

| Field | Notes |
|---|---|
| Logo URL | |
| Primary colour | Hex, e.g. `#1a56db` |
| Secondary colour | Hex, e.g. `#7e3af2` |
| App name override | The name the members see instead of "ACADA" |

The two colour fields have live previews — the swatch updates as you type,
and the value is validated as a hex colour before you can save.

### 6.2 Settings

| Field | Notes |
|---|---|
| Currency | A 3-letter ISO code, e.g. `NGN` |
| Timezone | e.g. `Africa/Lagos` |
| Locale | e.g. `en-NG` |
| Financial year start month | 1–12 |
| Notification policy | JSON |

### 6.3 Business rules

The society's **versioned** policy. The editor is a JSON textarea seeded with
the currently active rules, and next to it the platform lists the keys it
actually reads — the contract between the society and the backend, written
down rather than folklore:

| Section | Key | Effect |
|---|---|---|
| `loan` | `escalation_threshold` | Amounts above this are always escalated to the executives |
| `loan` | `default_interest_rate` | Pre-fills the rate on newly created loan products |
| `loan` | `default_interest_method` | `"flat"` or `"reducing"` — pre-fills newly created loan products |
| `loan` | `max_term_months` | Society-wide ceiling on the repayment term |
| `penalty` | `missed_payment_flat` | Flat penalty for a missed contribution |
| `penalty` | `missed_payment_rate` | Penalty as a share of the amount due; used when it is above 0 |

Every key is optional and every value is validated. **A typo in the JSON
falls back to the product's own setting** rather than breaking a loan
application.

**Publish rule version** creates a **new version**. The previous version is
archived, not deleted — so the policy history is intact and you can see which
version was in force when a decision was made. Each version shows its
number, its active window (`active_from` → `active_to`), its notes, whether
it is active, and its JSON.

> The rule set's `loan` section **wins over** a product's own setting. If
> `escalation_threshold` is ₦100,000, a product whose own auto-approval
> threshold is ₦50,000 still escalates everything above ₦100,000.

---

## 7. The executive screens, from the president's chair

You have every executive screen, and you can act on all of it. The three that
matter most:

| Screen | What you do there |
|---|---|
| **Cycles** | Open cycles, confirm entries individually or in bulk, read penalties |
| **Schedules** | Generate deduction / repayment / combined batches and export them |
| **Loan Applications** | Approve or reject, with the full rule evaluation and guarantor list in front of you |

See [03 — Executive](03-executive.md) for the walkthroughs; the mechanics are
identical, because you hold the same capabilities.

---

## 8. User stories

| # | Story |
|---|---|
| S1 | *As a president, I want one roster screen, so that I can manage every member of the society.* |
| S2 | *As a president, I want to approve a pending registration, so that new members can actually sign in.* |
| S3 | *As a president, I want to change a member's role, so that duties can be delegated without a re-login.* |
| S4 | *As a president, I want to suspend a member with a recorded reason, so that the decision is explained and auditable.* |
| S5 | *As a president, I want the full member record — payroll and bank details — so that I can run the deductions correctly.* |
| S6 | *As a president, I want to set the society's interest rate once, as a house rate in the business rules, so that every new product starts from it.* |
| S7 | *As a president, I want to create a loan product with an explicit basis, so that members see what they will actually pay.* |
| S8 | *As a president, I want to deactivate a product rather than delete it, so that its history is preserved.* |
| S9 | *As a president, I want to set the society's monthly contribution plan, so that cycles bill the right amount.* |
| S10 | *As a president, I want exactly one default plan, so that cycles are never ambiguous.* |
| S11 | *As a president, I want to publish a version of the business rules, so that a policy change is dated, reversible and explainable.* |
| S12 | *As a president, I want the rules editor to tell me which keys it reads, so that I do not have to guess the JSON.* |
| S13 | *As a president, I want to brand the portal for my society, so that members see my society's name and colours.* |
| S14 | *As a president, I want to set the currency, timezone and financial year, so that the society's calendar matches its own.* |
| S15 | *As a president, I want to be able to run the whole monthly cycle myself, so that the society is never blocked on a single person.* |

---

## 9. Worked example — setting up the year

Bolanle Ajayi (`president@acada.demo`) sets up the society for the year.

**1. She sets the house rate.** Settings → Business rules. The active version
is v1:

```json
{
  "loan": {
    "max_term_months": 36,
    "escalation_threshold": "100000.00",
    "default_interest_rate": "5.00",
    "default_interest_method": "flat"
  },
  "penalty": {
    "missed_payment_flat": "500.00",
    "missed_payment_rate": "0.00"
  }
}
```

The board has decided to move to **reducing balance** as the house basis for
new products. She edits `default_interest_method` to `"reducing"`, adds the
note *"Board decision, effective 2026 — new products use reducing balance"*,
and publishes **version 2**. Version 1 is archived with its own active
window, so the January decision can still be traced to the policy in force at
the time.

**2. She creates a product.** Loan Products → New. The rate is pre-filled
with **5.00** and the basis with **reducing** — both from the rule set. She
names it *Staff Salary Advance*, sets max amount ₦1,000,000, min term 3
months, max term 12 months, 2 guarantors, auto-approval threshold ₦200,000,
and saves.

**3. She adds a member.** Members → Add member → *Amaka Nwosu*,
`amaka@acada.demo`, employee number `EMP-99120`, department *Faculty of
Engineering*. The membership is created active with her profile record.

**4. A member asks to be suspended.** She opens his record → **Change member
status** → **Suspend member** → reason *"Moved out of the institution
effective 2026-02-28"*. The access is withdrawn, the record and his
contribution history are kept, and the reason is on file.

**5. She promotes somebody.** A colleague is taking over the treasury. She
opens their record → **Change role** → `EXECUTIVE`. The moment they refresh
the page, their navigation changes: they now see **Schedules**, the
**Confirm** buttons on entries, and the **Approve or reject** button on
loan applications. Before that change, they could see none of it.

**6. She checks the rules are being honoured.** She opens Loan Products and
sees the catalogue: *Standard Loan* — 5% flat, ₦500,000, 24 months, 2
guarantors, auto-approve ₦100,000; *Salary Advance* — 4% reducing, ₦300,000,
12 months, 1 guarantor, auto-approve ₦50,000; and her new *Staff Salary
Advance*.

---

## 10. FAQ

**Q. Why can I not change the interest rate anywhere else?**
Because a rate is a promise to members. It belongs to the society's
configuration, not to the officer running the month. The treasurer can see
the rate that applies to every loan and decide applications against it, but
cannot change it.

**Q. What happens if I publish a rule version with a typo in it?**
The value fails validation and falls back to the product's own setting. A
typo cannot break a loan application — but it can silently mean your policy
is not the policy you think it is. Read the JSON before you publish.

**Q. I promoted somebody to EXECUTIVE. When do they get the new powers?**
Immediately — on their next page load. There is nothing to sign out and back
in to.

**Q. Can I remove a member entirely?**
**Remove member** marks the membership `removed`. The member loses access and
cannot be approved back in from the pending list, but the membership row and
the member's contribution history remain in the database — and the change is
in the audit trail with your reason. **Suspend member** is usually the right
choice: it is reversible with **Reactivate member**.

**Q. Can I reach another society's settings?**
No. The API resolves the object and checks that you are the society admin of
*that* society. A society admin can never reach another society's
configuration.

**Q. Where do I change the society's monthly contribution amount?**
**Contribution Plans** — the plan's *Fixed monthly amount*. Remember that the
default plan must be active and open-ended, or cycles will generate no
entries.

**Q. Does changing a product change loans that already exist?**
No. The rate and the basis are snapshotted onto the loan row at approval, so
existing contracts keep the terms they were issued at. Changing a product
only affects applications decided afterwards.

---

**Next:** [05 — Platform admin](05-super-admin.md)
