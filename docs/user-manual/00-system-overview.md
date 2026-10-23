# 00 — System overview

Read this once. Every other chapter assumes the vocabulary and the access model
established here.

---

## 1. What ACADA does

ACADA runs a cooperative society's money. A society collects a monthly
contribution from every member, lends money to members against guarantees, and
hands the bursary a single file telling it exactly what to deduct from each
salary.

The platform covers four things:

1. **Contributions** — monthly cycles, per-member entries, confirmations,
   penalties, and an immutable ledger.
2. **Loans** — a per-society product catalogue with interest rates, member
   applications, guarantor consent, a rule engine, and decisions.
3. **Schedules** — deduction batches that merge contributions and loan
   repayments into one CSV/Excel file for the bursary.
4. **Governance** — members, roles, society settings, versioned business rules
   and an append-only audit trail.

---

## 2. Tenancies: one society, one tenant

Every society on ACADA is a **tenant**. A tenant owns its members, its
contributions, its loans, its products, its plans, its branding, its settings
and its rule set.

Two consequences run through the whole system:

- **Isolation.** A rate configured by one society can never leak into another.
  Every query is tenant-scoped by the middleware, not by a filter the caller
  remembers to add.
- **One society per sign-in.** You sign in with your email, your password and
  your **society code**. The code resolves the tenant; your membership inside
  it resolves your role. Platform admins have no tenant membership at all and
  leave the code blank.

The society code is shown in the sign-in form and, once signed in, in the
sidebar footer.

---

## 3. The role model

### The five roles

| Role | Sees | Does |
|---|---|---|
| `MEMBER` | Their own contributions, notifications, and the loan applications they submitted **or** guarantee | Applies for loans, confirms guarantees they were named on, reads their own record |
| `COMMITTEE_MEMBER` | The society's financials and loans, read-only | Reviews. Confirms nothing, decides nothing, generates nothing |
| `EXECUTIVE` | The society's financials and loans | Confirms contributions, opens cycles, generates schedules, decides loan applications |
| `SOCIETY_ADMIN` | Everything the executive sees, plus the roster, roles and society configuration | Manages members, assigns roles, configures loan products, plans, branding, settings and business rules |
| `SUPER_ADMIN` | Cross-tenant platform data | Onboards societies, activates/suspends/deactivates them, reads platform statistics |

### Two axes, not one

The single most useful thing to understand about ACADA's access model is that
**visibility and capability are different questions**:

> A committee member may **read** the ledger, so the ledger is in their
> navigation. They may **not** generate a deduction schedule, so schedules are
> not.

This is why a committee member and an executive can both open `/executive/*`
and yet see different menus and different buttons. The route is shared; the
capability is not.

| Capability | Who has it |
|---|---|
| Read financials (ledger, cycles, entries, penalties, reports) | Committee, Executive, Society admin |
| Read loans (applications, contracts, products) | Committee, Executive, Society admin |
| Confirm contributions / record payments | Executive, Society admin |
| Decide loan applications | Executive, Society admin |
| Generate and export deduction schedules | Executive, Society admin |
| Manage members, roles and statuses | Society admin |
| Configure plans, products, settings and rules | Society admin |
| Cross-tenant platform operations | Platform admin |

### Three layers of enforcement

Only the last one is a real boundary, but all three exist so the user never
meets a dead button:

1. **Route prefix** (`src/proxy.ts`) — decides which portal a role may open at
   all. A member typing `/executive/loans` is redirected to their own
   dashboard.
2. **Page-level gate** (`RoleGate`) — for screens inside a shared portal that
   are narrower than the route group, e.g. Schedules. If your role is not
   allowed, you see a plain "Executive access required" panel instead of a
   screen whose buttons would all fail.
3. **The API** — re-checks every single call. A forged request, a stale tab,
   a hand-written `curl` — all get the same answer: `403`.

### Role codes and permission codes

The backend has two ways of asking "may I?" and they are not the same thing:

- **Role codes** — `IsTenantMember`, `IsExecutiveOrAbove`, `IsSocietyAdmin`.
  A straight comparison against your membership's role.
- **Permission codes** — `HasTenantPermission` checks a named grant such as
  `view_financials`, `approve_loans` or `view_reports`. This is the hybrid
  model: a `UserPermissionOverride` can **allow** a specific person
  something their role lacks, or **deny** someone something their role has.
  Evaluation order is *deny override → allow override → role grant*.

The seeded roles carry these grants:

| Permission code | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|
| `view_financials` | ✅ | ✅ | ✅ | ✅ |
| `view_reports` | ✅ | ✅ | ✅ | ✅ |
| `view_loans` | ✅ | ✅ | ✅ | ✅ |
| `record_contributions` | — | ✅ | ✅ | ✅ |
| `apply_penalties` | — | ✅ | ✅ | ✅ |
| `approve_loans` | — | ✅ | ✅ | ✅ |
| `prepare_deductions` | — | ✅ | ✅ | ✅ |
| `manage_contribution_plans` | — | — | ✅ | ✅ |
| `manage_loan_products` | — | — | ✅ | ✅ |
| `manage_members` | — | — | ✅ | ✅ |
| `manage_roles` | — | — | ✅ | ✅ |
| `manage_tenant_settings` | — | — | ✅ | ✅ |

> **Known gap.** The `manage_*` codes are currently *documentation only* —
> those endpoints still gate on the role code directly. Behaviour matches the
> table above; the enforcement is not yet driven by the grant. See
> [06 — Permissions reference](06-permissions-reference.md#6-known-limitations).

---

## 4. Core concepts

### On the money side

| Term | Meaning |
|---|---|
| **Contribution plan** | A society-wide rule for how much is due each month. One plan per society is the *active default*; monthly cycles are generated from it. |
| **Contribution cycle** | One month of collection. `open` → `processing` → `closed`. Opening a cycle creates an **entry** for every active member. |
| **Contribution entry** | One member's obligation for one cycle. `pending` → `confirmed` / `missed` / `partial`. |
| **Penalty** | A charge levied on a missed or late payment. `pending` → `applied` / `waived`. |
| **Ledger** | The append-only financial journal. Every confirmation, penalty, disbursement and repayment writes a **ledger event**. Nothing is edited or deleted. |
| **Ledger event types** | `contribution_credit`, `extra_contribution`, `penalty_debit`, `loan_disbursement`, `loan_repayment`, `adjustment_credit`, `adjustment_debit` |
| **Deduction schedule** | A batch file for the bursary. Three kinds: `deduction` (contributions), `repayment` (loan instalments), `combined` (both). |

### On the loan side

| Term | Meaning |
|---|---|
| **Loan product** | A society's rule package: name, interest rate, interest basis, min/max term, max amount, guarantor count, auto-approval threshold, multipliers and minimum-tenure rules. |
| **Interest basis** | `flat` (simple interest on the original amount) or `reducing` (amortised; interest charged on what is still owed). |
| **Loan application** | A member's request. Statuses: `draft` → `submitted` → `guarantor_pending` → `evaluating` → `approved` / `rejected` / `escalated` → `disbursed`. |
| **Guarantor** | A member who has personally vouched for an applicant. Their consent is **never passive** — they must confirm in the app. |
| **Guarantor decision** | `pending` → `confirmed` / `declined`. |
| **Rule evaluation** | The engine's verdict: eligibility, max borrowable, whether the decision is automatic or manual, and a per-rule pass/fail breakdown. |
| **Loan contract** | The written loan: principal, rate, basis, term, total repayable, monthly instalment, and the instalment schedule. Statuses: `active` → `replaying` → `closed`, or `defaulted`. |
| **Repayment schedule** | Per-instalment rows: `scheduled`, `paid`, `partial`, `overdue`, `waived`. |
| **Rule set** | The society's versioned business rules as JSON. The `loan` section is society-wide policy and **wins over** a product's own defaults. |

### Everything else

| Term | Meaning |
|---|---|
| **Notification** | An in-app message. Types `info` / `warning` / `success` / `error`; channels `in_app` / `email` / `sms`. Every notification carries `context_data = {"kind": …, "application_id": …}` so the UI can deep-link to the right screen. |
| **Audit log** | An append-only record of every write, with actor, action category and timestamp. |
| **Membership** | The link between a user and a tenant, carrying a role and a status (`pending` → `active` → `suspended` / `removed`). |
| **Member profile** | The employment and bank record: employee number, payroll number, department, faculty, designation, employment status, date of birth, next-of-kin, bank name and account number. |

---

## 5. The two end-to-end workflows

### Workflow A — the monthly contribution cycle

```
  SOCIETY_ADMIN          EXECUTIVE                MEMBER
        │                     │                      │
        │ sets the plan      │                      │
        ├─────────────────────────────────────────►│ sees the amount due
        │                     │                      │
        │  opens the cycle ───┤  cycle created; one entry per active member
        │                     │                      │
        │  exports schedule ──┤  bursary deducts from salaries
        │                     │                      │
        │                     │ confirms what arrived│
        │                     │  entry → confirmed    │
        │                     │                      │ balance updates
        │                     │ applies penalties ───┤ missed entries charged
        │                     │                      │
        │ reviews the ledger ┤ every event written   │ sees their own ledger
```

**Who does what.** The society admin sets the plan. The executive opens the
cycle, generates the schedule, confirms receipts and applies penalties. The
member sees the obligation and the resulting balance. The committee member can
read every step of it but change none of it.

### Workflow B — the loan lifecycle

```
  MEMBER          GUARANTORS        ENGINE          EXECUTIVE
    │                 │               │                 │
    │ checks eligibility ─────────────►│                 │
    │   (rule evaluation, max borrowable, quote)       │
    │ applies ─────────┤               │                 │
    │                 │ notified in-app│                 │
    │                 ├─ confirms ─────┤                 │
    │                 │  (or declines)  │                 │
    │                 │               │ evaluates       │
    │                 │               │  ≤ threshold → auto-approve
    │                 │               │  > threshold → escalate ─────►│
    │                 │               │                 │  decides   │
    │ notified of the outcome ◄────────────────────────┘             │
    │ sees contract + instalment schedule                            │
```

**Two things worth knowing.**

- An application sitting in `guarantor_pending` is **not** rejected — it is
  waiting for a human. The rule evaluation says so in
  `blocked_on_guarantors`.
- The threshold that decides *auto-approve versus escalate* comes from the
  society's rule set (`escalation_threshold`), which overrides the product's
  own `auto_approval_threshold`.

---

## 6. Interest, rates and money

### Two layers of pricing

**The loan product** is the per-product rule package: rate, basis, term band,
ceiling, guarantor count, auto-approval threshold.

**The rule set** (`TenantRuleSet.rules["loan"]`) is society-wide policy. Where
it speaks, it wins:

| Key | Effect |
|---|---|
| `escalation_threshold` | Overrides the product's auto-approval threshold. Loans above it are always escalated. |
| `default_interest_rate` | Pre-fills the rate on newly created products — the society's house rate. |
| `default_interest_method` | Pre-fills the basis on newly created products (`flat` or `reducing`). |
| `max_term_months` | A society-wide ceiling on term. A product may offer less, never more. |

Every key is optional and every value is validated. A typo in the JSON falls
back to the product's own setting rather than breaking an application.

### The two bases

**Flat (simple) interest** — interest is charged on the original principal for
the whole term:

```
total_interest  = principal × (rate / 100) × term / 12
total_repayable = principal + total_interest
monthly         = total_repayable / term
```

Every instalment is identical.

**Reducing balance (amortised)** — interest is charged on what is still owed:

```
r      = (rate / 100) / 12
payment = principal × r / (1 − (1 + r)^(−term))
```

Instalments are level in total, but the interest inside each one falls as the
principal is repaid. At a zero rate it degrades to the flat case.

### Worked example

Take **₦500,000** over **12 months** at **10% per year**. These are the exact
figures the platform produces — the same calculator answers the quote the
member sees and the contract that gets written.

| | Flat | Reducing |
|---|---|---|
| Total interest | ₦50,000.00 | ₦27,495.32 |
| Total repayable | ₦550,000.00 | ₦527,495.32 |
| Monthly instalment | ₦45,833.33 | ₦43,957.94 |
| Interest in instalment 1 | ₦4,166.67 | ₦4,166.67 |
| Interest in instalment 12 | ₦4,166.63 | ₦363.28 |
| Principal in instalment 12 | ₦41,666.74 | ₦43,594.70 |

At the demo society's house rate of **5%**, the same loan costs:

| | Flat | Reducing |
|---|---|---|
| Total interest | ₦25,000.00 | ₦13,644.89 |
| Total repayable | ₦525,000.00 | ₦513,644.89 |
| Monthly instalment | ₦43,750.00 | ₦42,803.74 |

The two bases cost a member materially different amounts over the same term —
which is why a product always carries a basis, and why the application sheet
prices the loan live before the member commits.

### Rounding

Amounts are quantised to two decimals and the **final instalment absorbs the
residue**, so the instalments sum exactly to `total_repayable`, the interest
column to the total interest, and the principal column to the principal. The
basis and the rate are **snapshotted onto the loan row at approval**, so
changing a product later never rewrites a loan that has already been issued.

---

## 7. Screen conventions you will see everywhere

| Pattern | What it means |
|---|---|
| A tile with a label and a number | A metric, scoped to whatever the screen is about |
| A table with a right-aligned numeric column | Money. Right-aligned, monospaced, two decimals |
| A coloured pill | A status. The same colour means the same thing everywhere |
| A sheet sliding in from the right | A create flow with several fields |
| A dialog in the centre | A short, focused action — confirm, decide, change status |
| A stepped sheet (numbered header) | A multi-stage flow, e.g. the loan application |
| A shield panel reading "… access required" | `RoleGate`. Your role cannot open this screen |
| An empty state with a single call to action | There is nothing here *yet* — the button creates the first one |
| A toast in the corner | The result of the last write, including the API's error text |

### Search and filters

Search is **server-side** on members, tenants, plans, loan products and
applications. On members it also matches employee and payroll numbers. Filters
(membership status, loan application status, product active/inactive, unread
notifications) are applied by the API, not in the browser, so a filtered list
is the real list.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` on a screen | Your role may not perform that act | Check [06 — Permissions reference](06-permissions-reference.md). The UI hides the action, so a 403 usually means a stale tab |
| `403 Forbidden` on everything | No **active membership** in the tenant | A society admin must approve your pending membership |
| `404` on a record | It belongs to another society, or was removed | Tenant scoping is absolute — another society's data is invisible, not merely forbidden |
| Redirected to my dashboard after clicking a link | The path is outside your role's portals | This is the route gate doing its job |
| Sign-in succeeded but the portal is empty | Your membership is `pending` | Ask the society admin to approve it |
| My navigation changed without me re-logging in | Your role was changed | The session's role is reconciled from `GET /auth/me/` on every load |
| A guarantee request is not in my list | It was addressed to somebody else | Guarantee requests are addressed by name at the time of application |
| The rate in the UI does not match the old loan | The rate was snapshotted at approval | Existing contracts keep the rate they were issued at. This is intentional |

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **Tenant** | One cooperative society. The isolation boundary. |
| **Membership** | A user's link to a tenant, with a role and a status. |
| **Role** | `MEMBER`, `COMMITTEE_MEMBER`, `EXECUTIVE`, `SOCIETY_ADMIN`, `SUPER_ADMIN`. |
| **Permission override** | A per-user allow or deny that beats the role's grants. |
| **Cycle** | One month of contribution collection. |
| **Entry** | One member's obligation within a cycle. |
| **Ledger** | The append-only financial journal. |
| **Product** | A society's loan rule package. |
| **Application** | A member's loan request. |
| **Guarantee** | A member's personal vouch for an applicant. |
| **Contract** | The written loan, created on approval. |
| **Schedule** | A batch file of deductions for the bursary. |
| **Rule set** | The society's versioned business rules. |
| **Escalation** | A loan above the threshold that must be decided by an executive. |
| **Auto-approval** | A loan below the threshold that the rule engine approves itself. |
| **Deep link** | A URL that remembers where you were going and returns you there after sign-in. |

---

**Next:** [01 — Member](01-member.md)
