# 03 — Executive manual

> **Role:** `EXECUTIVE` (treasurer / officer) · **Portal:** `/executive/*` · **Home:** `/executive/dashboard`
> **Demo account:** `treasurer@acada.demo` (Segun Balogun)

The executive is the society's **operator**. You run the monthly contribution
cycle, you confirm what the bursary actually collected, you produce the
deduction file, and you decide loan applications that the rule engine escalated
to you.

You are trusted with the money, but you are **not** the society's owner. Rates,
plans, members, roles and settings belong to the society admin. You read them;
you do not set them.

---

## 1. What an executive can see and do

| Area | Read | Write |
|---|:--:|:--:|
| Own contributions and notifications | ✅ | — |
| Dashboard figures and reports | ✅ | — |
| Contribution cycles | ✅ | ✅ open, close, confirm |
| Cycle entries | ✅ | ✅ confirm individually and in bulk |
| Penalties | ✅ | read (see [known limitations](#6-known-limitations)) |
| Contribution plans | ✅ | — (society-admin-only to change) |
| Financial ledger | ✅ | — (append-only by design) |
| Loan applications | ✅ | ✅ approve / reject |
| Loan products | ✅ | — (society-admin-only to change) |
| Deduction schedules | ✅ | ✅ generate, export |
| Member directory | ✅ | — (society-admin-only to change) |

## 2. What an executive cannot do

| | Why |
|---|---|
| Change an interest rate or create a loan product | Society configuration, not operations |
| Create or edit a contribution plan | Society configuration |
| Add, edit, suspend or re-role a member | Society-admin-only |
| Edit the society's branding, settings or rules | Society-admin-only |
| Publish a new rule-set version | Society-admin-only |
| Reach any platform endpoint | Platform-admin-only |

---

## 3. The portal, screen by screen

Navigation:

| Item | Route |
|---|---|
| **Dashboard** | `/executive/dashboard` |
| **Cycles** | `/executive/cycles` |
| **Financial Ledger** | `/executive/ledger` |
| **Loan Applications** | `/executive/loans` |
| **Schedules** | `/executive/schedules` |

### 3.1 Dashboard — `/executive/dashboard`

The same seven figures a committee member sees — active members, pending
approvals, total savings, loans disbursed, active loans, applications awaiting
decision — plus two call-to-action cards:

- **Loan applications to review** — links to `/executive/loans` when the
  count is above zero.
- **Member approvals pending** — links to the roster.

### 3.2 Cycles — `/executive/cycles`

Four clickable tiles (**All / Open / Processing / Closed**), a search box, a
status filter, and the cycles table.

#### Opening a cycle — "New cycle"

A dialog with three fields:

| Field | Notes |
|---|---|
| **Month** | Required |
| **Year** | Required |
| **Notes** | Optional, free text |

Submitting it creates the cycle **and generates an entry for every active
member**, each for the amount on the society's active default plan.

> **Guard rail.** The **New cycle** button is disabled unless the society has
> an active, default plan with no end date. A cycle generated with no plan
> would produce zero entries — so the screen says so, in a warning banner,
> with a link to set up a plan.

#### Confirming receipts

Two ways, and you will use both.

**One at a time** — on the cycle detail page, a `pending` entry shows a
**Confirm** button. The dialog asks for:

| Field | Notes |
|---|---|
| **Amount received (₦)** | Pre-filled with the amount due. Edit it if the member paid less — see below |
| **Source reference** | e.g. `PAYROLL-2026-08`, `BURSARY-2026-06` |

What you enter decides the entry's status:

| You enter | The entry becomes |
|---|---|
| The full amount due, or more | `confirmed` |
| Less than the amount due, but more than zero | `partial` |
| Zero | `missed` |

Confirmed entries record **who** confirmed them and **when**. A ledger credit
is written for every naira received — but a zero confirmation writes no
ledger event, because nothing was received.

**In bulk** — on the cycle detail page, **Confirm pending** (with a count
badge) opens a sheet listing every pending entry with an editable
*received* column, pre-filled with the amount due. Adjust any that differ and
confirm the whole batch in one call.

**The whole cycle at once** — `POST /contributions/cycles/{id}/confirm/`
confirms every pending entry in the cycle. The API answers with a count: *"Successfully
confirmed N contributions."* If the cycle is already closed it refuses with
*"This cycle is already closed."*

### 3.3 A cycle — `/executive/cycles/{id}`

The cycle's own statistics at the top, then two tabs: **Entries** and
**Penalties**.

**Entries** — a filter (all / pending / confirmed / partial / missed), the
entries table, and the **Confirm pending** action. The Actions column shows
**Confirm** on a pending entry, and afterwards shows who confirmed it — your
own name renders as "You".

**Penalties** — every penalty in the cycle: member, type (`late_payment`,
`missed_payment`, `other`), amount, reason, status (`pending`, `applied`,
`waived`) and who waived it.

### 3.4 Financial Ledger — `/executive/ledger`

Read-only, and read-only by design: the ledger is append-only. Every event
with its type, description, debit, credit and the running balance after it.
Filter by event type; search by description.

### 3.5 Loan Applications — `/executive/loans`

Every application in the society, searchable by member name, email, product or
purpose (server-side, across every page), with status chips for
**Awaiting decision**, **Awaiting guarantors** and **Approved / paid**, plus a
full status dropdown.

Open one and you get three tabs:

| Tab | Contents |
|---|---|
| **Overview (n/m)** | The member, the product, the amount, the term, the purpose, the interest **rate and basis**, the max term, the mode (auto or manual), the guarantors, and the rule evaluation with a pass/fail line per rule |
| **Guarantors (n)** | Each guarantor, their email, and their status — `pending`, `confirmed` or `declined`, with the reason if they declined |
| **Approval trail (n)** | Every decision step: who, what role, what decision, when, and the comments |

#### Deciding an application

The **Approve or reject** button appears only when the application is in a
decisionable state — `submitted`, `evaluating` or `escalated`. If it is
still `guarantor_pending`, the screen says *"Waiting on guarantor
confirmations before a decision can be made."*

The **Loan Decision** dialog shows you everything before you decide:

1. The loan summary — applicant, product, amount, term, status, mode.
2. The rule evaluation — every rule, pass or fail, and the count.
3. The guarantors — each one with their status, and *"all confirmed"* when
   they are.
4. **Approve** or **Reject**.
5. A comments field — *"Comments (optional)"* when approving, **"Rejection
   reason"** when rejecting. The rejection reason is saved on the application
   and shown to the member.

Confirm and the application is decided. On approval the platform writes the
loan contract — with the rate and basis **snapshotted from the product at that
moment** — and generates the instalment schedule. The applicant is notified.

> If an application has *already* produced a loan contract, approving again
> will fail with a server error. That is a known issue — see
> [Known limitations](#6-known-limitations).

### 3.6 Schedules — `/executive/schedules`

This screen is `EXECUTIVE`-only. A committee member who types the URL gets
*"Executive access required."*

**Generating a schedule** — the **Generate deduction schedule** dialog asks
for two things:

| Field | Options |
|---|---|
| **Contribution cycle** | The cycle to draw from |
| **Batch type** | `deduction` (contributions only) · `repayment` (loan instalments only) · `combined` (both) |

After generation you get a summary: cycle, type, member count and total
amount.

**The schedule list** — every batch, with its cycle, who generated it, when,
its type badge, its status badge (`draft`, `finalized`, `exported`,
`submitted`), the member count and the total amount. Two export buttons on
every row: **CSV** and **Excel**.

**A schedule's detail page** — `/executive/schedules/{id}` — shows the
schedule's statistics, its line items, and the same CSV / Excel export
buttons.

---

## 4. The monthly cycle, end to end

This is the executive's core routine. It is worth doing in this order.

| # | Action | Where |
|---|---|---|
| 1 | Check that the society has an active default plan | The warning banner on Cycles tells you if not |
| 2 | **New cycle** — month, year, notes | Cycles → New cycle |
| 3 | Confirm entries as the bursary reports them, individually or in bulk | Cycles → the cycle → Entries |
| 4 | Generate the **deduction** schedule for the cycle | Schedules → Generate |
| 5 | Export the schedule and send it to the bursary | Schedules → CSV / Excel |
| 6 | After payday, confirm what actually arrived, using the bursary's references | The **Source reference** field |
| 7 | Review the penalties on missed deductions | The cycle's Penalties tab |
| 8 | Review the ledger | Financial Ledger |

> Penalties are computed and displayed, but there is no "apply penalty" or
> "waive penalty" button in the interface, because the API has no
> apply/waive endpoint yet. See [Known limitations](#6-known-limitations).

---

## 5. User stories

| # | Story |
|---|---|
| E1 | *As a treasurer, I want to open the month in one action, so that every active member is billed automatically.* |
| E2 | *As a treasurer, I want the New cycle button to tell me when there is no default plan, so that I never generate an empty cycle.* |
| E3 | *As a treasurer, I want to confirm what the bursary actually remitted, with a reference, so that member balances are accurate and auditable.* |
| E4 | *As a treasurer, I want to confirm many entries at once, so that month-end is not a slow grind.* |
| E5 | *As a treasurer, I want a member who paid less to become "partial" rather than "confirmed", so that the books tell the truth.* |
| E6 | *As a treasurer, I want to produce one file for the bursary, so that deductions happen on payday.* |
| E7 | *As a treasurer, I want to export CSV or Excel, so that the bursary's systems can consume it.* |
| E8 | *As a treasurer, I want to see which applications are waiting on me, so that members are not left waiting.* |
| E9 | *As a treasurer, I want to see the rule evaluation and every guarantor before I decide, so that I decide on evidence.* |
| E10 | *As a treasurer, I want a recorded reason when I reject, so that the member understands and the trail is complete.* |
| E11 | *As a treasurer, I want to read the rate and basis on every product, so that I apply the society's policy consistently.* |
| E12 | *As a treasurer, I want to read the immutable ledger, so that I can defend any figure I have given.* |
| E13 | *As a treasurer, I want my own contributions and guarantees handled exactly like any other member's, so that I am not above my own society's rules.* |

---

## 6. Worked example — month-end, in full

Segun Balogun (`treasurer@acada.demo`) runs December.

**1. He opens Cycles.** July 2026 is `open` with 0 entries. The society's
default plan is *Standard Monthly* — ₦25,000 fixed, allows extra
contributions, effective from 2024-01-01 with no end date, so the **New
cycle** button is enabled.

**2. He opens the cycle.** *Open contribution cycle* → Month `12`, Year
`2026`, Notes *"December 2026 regular deductions"*. Submitting it creates the
cycle and one ₦25,000 entry for each of the 9 active members — ₦225,000 due
in total.

**3. He generates the schedule.** Schedules → **Generate deduction schedule**
→ cycle *December 2026*, batch type `deduction`. The summary reads: 9
members, ₦225,000. He exports **CSV** and sends it to the bursary.

**4. The bursary remits.** On the 26th, Segun opens the cycle's **Entries**
tab. Seven members paid in full; two did not. For the seven, he opens each
entry, confirms **₦25,000** and types the reference `BURSARY-2026-12`.

For one member who paid ₦20,000, he confirms **₦20,000** — the entry becomes
`partial`, not `confirmed`, and the shortfall stays visible.

**5. He confirms the rest in bulk.** **Confirm pending** opens the sheet with
the two outstanding entries pre-filled at ₦25,000 each. He corrects one to
₦25,000 (the bursary paid it late but paid it) and leaves the other at
₦0, then confirms the batch. The cycle now shows 8 of 9 confirmed.

**6. He checks the penalties.** The Penalties tab lists a `missed_payment`
penalty for the member who paid nothing: ₦500.00, which is the society's
`missed_payment_flat` from the published rule set. He notes it for the
committee.

**7. He checks the ledger.** Filtering by `contribution_credit` for December
shows nine credit events of ₦25,000 each, each with the running balance
after it. The numbers agree with the entries tab.

**8. A loan application needs him.** The dashboard shows **Loan applications
to review: 1**. He opens it: ₦200,000 for 12 months on *Standard Loan*,
5% flat. Mode: **Manual** — because ₦200,000 is above the society's ₦100,000
escalation threshold. Rule evaluation: 5/5 passed. Guarantors: 2, both
confirmed. He presses **Approve or reject** → **Approve** → *"Any notes for
the record…"* → **Approve application**.

The contract is written with 5% flat snapshotted in. Total interest
₦10,000.00, total repayable ₦210,000.00, monthly instalment ₦17,500.00. The
member is notified, and the repayment rides along on next month's **combined**
schedule.

---

## 7. Known limitations

These are gaps in the API, not missing buttons:

- **No repayment recording.** There is no endpoint to record a loan
  repayment, so `loan_repayment` events cannot be posted and the deduction
  schedule's repayment line is generated from the contract rather than from
  what has actually been paid.
- **No penalty apply / waive.** Penalties are computed and displayed, and the
  ledger can carry a `penalty_debit`, but there is no button to raise or
  waive one.
- **Re-approving an application that already has a loan** raises a server
  error (`IntegrityError`) instead of a friendly message. Approve each
  application once.

---

## 8. FAQ

**Q. The New cycle button is greyed out. Why?**
Either you are not an executive (it says *"Committee members cannot open
cycles."*), or the society has no active default plan with no end date — in
which case a banner explains that and links you to the plans screen, which
only the society admin can edit.

**Q. Can I confirm a contribution on a closed cycle?**
No. The API refuses with *"This cycle is already closed."* A closed cycle is
locked for the period.

**Q. Should I use "Confirm pending" or confirm entries one at a time?**
One at a time when the amounts differ per member and you want a reference on
each. In bulk when the bursary remitted the same figure for everybody and you
need speed.

**Q. A member says they paid but their entry is still pending.**
The entry moves to `confirmed` when *you* confirm it — the platform cannot
see a bank transfer. Check the bursary's remittance advice and confirm with
their reference.

**Q. Can I change the interest rate so that an application is cheaper?**
No. Rates are society configuration. What you *can* do is decide the
application, and the decision is recorded with your comments.

**Q. What is the difference between the flat and the reducing basis?**
Flat charges interest on the original amount for the whole term; reducing
charges interest only on what is still owed, so the interest inside each
instalment falls. The basis is shown next to the rate on every product,
application and contract.

---

**Next:** [04 — Society admin](04-society-admin.md)
