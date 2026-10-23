# 02 — Committee member manual

> **Role:** `COMMITTEE_MEMBER` · **Portal:** `/executive/*` (read-only) · **Home:** `/executive/dashboard`
> **Demo account:** `committee@acada.demo` (Chioma Eze)

A committee member is an **oversight** role. You are expected to know the state
of the society's money and the state of the loan book — and you are expected
*not* to be the person who changes them. The treasury or the president does
that.

This is the only role in ACADA whose portal is shared with a role that can
write. The route is the same. The capabilities are not.

---

## 1. What a committee member can see

| Area | What you get |
|---|---|
| **Dashboard** | Every society metric: active members, pending approvals, total savings, loans disbursed, active loans, applications awaiting decision |
| **Cycles** | Every monthly cycle, its status, how many entries were generated and how many were confirmed. Inside a cycle: every member's entry and every penalty |
| **Financial Ledger** | The complete, append-only journal — every credit, debit, disbursement, repayment and penalty, with the running balance after each one |
| **Loan Applications** | Every application in the society: who applied, for what, for how much, on what product, at what rate and basis, and where it stands |
| **Member directory** | Who is in the society — names, emails, roles and membership statuses |
| **Contributions & plans** | Your own contributions, and the society's plans (read-only) |
| **Notifications** | Your own |

## 2. What a committee member cannot do

| | The API's answer |
|---|---|
| Open a contribution cycle | `403 Forbidden` |
| Confirm a contribution entry | `403 Forbidden` |
| Bulk-confirm a cycle's entries | `403 Forbidden` |
| Apply a penalty | `403 Forbidden` |
| Generate or export a deduction schedule | `403 Forbidden` |
| Approve or reject a loan application | `403 Forbidden` |
| Create or edit a contribution plan | `403 Forbidden` |
| Create or edit a loan product, or change a rate | `403 Forbidden` |
| Add, edit, suspend or re-role a member | `403 Forbidden` |
| Edit society branding, settings or rules | `403 Forbidden` |
| Reach any platform endpoint | `403 Forbidden` |

**You will not see a button for any of these.** The write dialogs are not
merely disabled — they are never mounted. Where a control cannot be removed
without breaking the layout (the "New cycle" button on the cycles toolbar),
it is disabled and explains itself on hover: *"Committee members cannot open
cycles."*

> One deliberate exception: **you may read a cycle's entries and penalties**
> (`GET /contributions/cycles/{id}/entries/`), but the flat
> `GET /contributions/entries/` list — every entry across every cycle in one
> query — is executive-only. It is the officer list, and it is where the
> write actions live.

---

## 3. The portal, screen by screen

Navigation for a committee member shows **four** items, not six:

| Item | Route | Read | Write |
|---|---|:--:|:--:|
| **Dashboard** | `/executive/dashboard` | ✅ | — |
| **Cycles** | `/executive/cycles` | ✅ | — |
| **Financial Ledger** | `/executive/ledger` | ✅ | — |
| **Loan Applications** | `/executive/loans` | ✅ | — |

Two items are absent from your navigation, and they are absent on purpose:

- **Schedules** — `/executive/schedules` is `EXECUTIVE`-only. If you type the
  URL you get a panel reading *"Executive access required — your role can
  review cycles and loan applications, but this screen is limited to
  executives and the society admin."*
- **Contribution Plans** — `/executive/plans` is `SOCIETY_ADMIN`-only, with
  the same treatment.

### 3.1 Dashboard — `/executive/dashboard`

Seven figures, all society-wide:

| Figure | Meaning |
|---|---|
| Active members | How many memberships are active |
| Pending approvals | Registrations awaiting the society admin's approval |
| Total savings | The society's total holdings |
| Loans disbursed | Money lent to date |
| Active loans | Contracts still running |
| Loan applications | Applications awaiting a decision |
| Member approvals pending | The same pending-approval count, as a call to action |

Two call-to-action cards at the bottom — **Loan applications to review** and
**Member approvals pending** — link straight to the relevant screen. They are
navigation, not actions: clicking one takes you to a list you can read.

### 3.2 Cycles — `/executive/cycles`

Four tiles you can click to filter:

| Tile | Filters to |
|---|---|
| All cycles | everything |
| Open cycles | `open` — still accepting contributions |
| Processing | `processing` — awaiting confirmation |
| Closed cycles | `closed` — locked for the period |

Underneath: a search box ("Search by cycle period…"), a status dropdown, and
the cycles table.

| Column | Notes |
|---|---|
| Cycle | A month badge, the period, and any note |
| Status | `open` / `processing` / `closed` |
| Entries | How many entries the cycle generated |
| Confirmed | How many are confirmed, out of that total |
| Created | When the cycle was opened |

The **Actions** menu (⋮) has two items for you: **View cycle** and **View
penalties**. The **Confirm entries** item is present only for the executive —
and it is not rendered greyed out; it is absent.

> **New cycle** is disabled for you, with the tooltip *"Committee members
> cannot open cycles."* If the society has no active default plan, the same
> button explains that instead — because a cycle with no plan generates no
> entries.

### 3.3 A cycle — `/executive/cycles/{id}`

The cycle's detail view. It shows the cycle's own statistics, a table of
every member's entry, and a penalties panel.

Each entry row shows the member, the type, the amount due, the amount
received, the status and the date. **Confirm** appears on a `pending` entry
only for the executive — for you, the entry is simply a fact.

Penalties are listed with their type (`late_payment`, `missed_payment`,
`other`), their status (`pending`, `applied`, `waived`) and their amount.

### 3.4 Financial Ledger — `/executive/ledger`

The society's financial journal, and the most powerful read-only screen in the
platform. Every event ever posted, newest first:

| Column | Notes |
|---|---|
| Date | When it was posted |
| Event | The type badge — `contribution_credit`, `extra_contribution`, `penalty_debit`, `loan_disbursement`, `loan_repayment`, `adjustment_credit`, `adjustment_debit` |
| Description | Human-readable, e.g. *"Contribution for November 2026"* |
| Debit | What left the member's balance |
| Credit | What came into it |
| Balance after | The running balance after the event |

Filter by **event type** and search by **description**. Nothing here can be
edited or deleted — that is what makes it an audit record rather than a table.

### 3.5 Loan Applications — `/executive/loans`

Every application in the society, with:

- A search box that matches member name, email, product and purpose, across
  every page (the filter is applied by the API, not in the browser).
- Status chips: **Awaiting decision** (`submitted`, `evaluating`,
  `escalated`), **Awaiting guarantors** (`guarantor_pending`), **Approved /
  paid** (`approved`, `disbursed`).
- A full status dropdown covering every status in the lifecycle.

Open an application and you see the member, the product, the amount, the
term, the purpose, the interest **rate and basis**, the max term, the
guarantors and the rule evaluation.

**The Loan Decision button is not there.** For an executive it appears as
soon as the application is in a decisionable state. For you the screen shows
the decision trail — who decided what, when, and why — and nothing else.

### 3.6 Member directory

You can see who is in the society — names, emails, roles and statuses — from
the read-only view inside the executive portal. You do **not** get the full
member record: employee number, payroll number, date of birth, next-of-kin
and bank details are reserved for the society admin.

---

## 4. User stories

| # | Story |
|---|---|
| C1 | *As a committee member, I want to read the ledger, so that I can verify the society's books without taking custody of them.* |
| C2 | *As a committee member, I want to read every cycle and its entries, so that I can see what was due and what was collected.* |
| C3 | *As a committee member, I want to see the dashboard reports, so that I can brief the general meeting.* |
| C4 | *As a committee member, I want to see every loan application, so that I can watch the loan book grow responsibly.* |
| C5 | *As a committee member, I want to see the interest rate **and basis** on each product, so that I understand what members are being charged.* |
| C6 | *As a committee member, I want to see the member directory, so that I know who is in the society.* |
| C7 | *As a committee member, I want the interface to show me nothing I can act on, so that I never fire a request that will be refused.* |
| C8 | *As a committee member, I want to see who decided each loan application and why, so that I can audit the loan book.* |
| C9 | *As a committee member, I want to read the penalties raised in each cycle, so that I can question them if they look wrong.* |
| C10 | *As a committee member, I want my own contributions and guarantees to work exactly like any other member's, so that I am not a second-class member of my own society.* |

---

## 5. Worked example — the monthly oversight review

Chioma Eze (`committee@acada.demo`) signs in on the 2nd of the month.

**1. She opens the dashboard.** Active members: 9. Total savings:
₦1,375,000. Loans disbursed: ₦280,000. Active loans: 2. Applications awaiting
decision: 0. Nothing is waiting on her — which is the point of the screen.

**2. She opens Cycles and filters to "Closed".** Four cycles: April, May, June
and November 2026. Each shows 8 entries. She opens **November 2026** and
reads the entries: eight members, ₦25,000 each, ₦200,000 due, 8 of 8
confirmed, each with a source reference such as `BURSARY-2026-06` and
"confirmed by Segun Balogun" with the timestamp.

She then opens **June 2026**: 8 entries but only **7 confirmed**. The
penalties panel shows exactly why — one `missed_payment` penalty of ₦500.00
for Hauwa Ibrahim, reason *"Missed deduction for June 2026"*, status
`applied`. The gap between 8 entries and 7 confirmations is fully
accounted for.

**3. She checks the ledger.** She filters by `contribution_credit` and reads
the running balance after each event. Every event lines up with the cycle
she just read. She also filters by `loan_disbursement` and sees the three
₦200,000 Standard Loan disbursements and the ₦80,000 one — and she notices
that Adebayo's balance after his disbursements is negative, because the
seeded demo data has no repayments recorded against them. She makes a note
to ask the treasurer about repayment capture.

> There is no repayment-recording endpoint in the API yet, so the ledger's
> `loan_repayment` events cannot be posted from the interface. The treasurer
> cannot fix that from the UI either — see
> [Known limitations](../../README.md#known-limitations).

**4. She opens Loan Applications.** Ten applications. She filters to
**Awaiting decision** and sees the escalated one for ₦200,000, and filters to
**Awaiting guarantors** and sees the ₦50,000 application waiting on its
guarantor. She opens one to read the rule evaluation: every rule's pass/fail,
the max borrowable, and whether the decision mode was auto or manual.

**5. She cannot decide anything.** There is no button to press. The
application's decision trail shows that the treasurer approved it on a
particular date, with a comment.

**6. She signs out.** Nothing she did changed a single record — and the
audit log would show that.

---

## 6. FAQ

**Q. Why can I open `/executive/loans` but not approve anything?**
Because `/executive/*` is the *officers'* portal and loan applications are
part of the officer's oversight duty. Approval is a separate capability that
only the executive and the president hold. The screen you are allowed to read
is not the screen you are allowed to act on.

**Q. What happens if I try to reach a write endpoint directly?**
`403 Forbidden`. The API is the real boundary. There is no way around it from
the browser, from a script, or from a stale tab.

**Q. Can I export the ledger?**
No export endpoint exists for the ledger today. You can read it on screen and
copy what you need.

**Q. Why can I see member names but not their employee numbers?**
The full member record contains payroll and banking data that the society
needs for deductions. It is the society admin's job. You get the directory.

**Q. May I apply for a loan like any other member?**
Yes. `/member/*` is open to every role, so you have your own contributions,
your own applications and your own guarantee requests, exactly like everybody
else.

**Q. Can the treasurer see my read activity?**
Yes — the audit log records writes by every actor, and the ledger itself
records every financial event with the member and the reference.

---

**Next:** [03 — Executive](03-executive.md)
