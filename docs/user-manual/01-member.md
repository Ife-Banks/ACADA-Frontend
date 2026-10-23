# 01 — Member manual

> **Role:** `MEMBER` · **Portal:** `/member/*` · **Home:** `/member/dashboard`

A member is anyone with an active membership in the society. Officers are
members too — the treasurer's own contributions appear in exactly the same
screens as anyone else's, and every role can open `/member/*`.

---

## 1. What a member can see

| | |
|---|---|
| **Own contributions** | Every cycle, every entry, the running balance — and nothing belonging to anybody else |
| **Own notifications** | In-app alerts from the society |
| **Own loan applications** | The ones they submitted **and** the ones they are named as guarantor on |
| **Member directory** | Names and emails only — enough to pick a guarantor, not enough to read anybody's file |
| **Loan products** | The society's catalogue, with the rate and basis that apply |
| **Own profile** | Their own contact and account details |

## 2. What a member cannot do

| | Why |
|---|---|
| See the society's ledger, cycles or reports | Financials are officer-only |
| See anybody else's contributions | The list endpoints self-filter to the signed-in member |
| Confirm a contribution | Confirming receipts is an officer's job |
| Generate a deduction schedule | Executive-only |
| Approve or reject a loan | Executive-only |
| Create, edit or suspend a member | Society-admin-only |
| Create a plan or a loan product | Society-admin-only |
| Change a rate | Society-admin-only |
| See another member's employee number, payroll number, date of birth, next-of-kin or bank details | Only the society admin sees the full member record |

If you try anyway, the API answers `403 Forbidden` — and the interface never
offers the button in the first place.

---

## 3. The portal, screen by screen

Navigation (sidebar, or the mobile drawer under 1024px):

| Item | Route | What it is |
|---|---|---|
| **Dashboard** | `/member/dashboard` | Your position in the society at a glance |
| **Contributions** | `/member/contributions` | What you owe, what you have paid, month by month |
| **Loans** | `/member/loans` | Active loans, applications and guarantee requests |
| **Notifications** | `/member/notifications` | Everything the society has sent you |
| **My Profile** | `/member/profile` | Your account and membership details |

### 3.1 Dashboard — `/member/dashboard`

Four tiles, all about you:

| Tile | Meaning |
|---|---|
| **Current balance** | Your net position with the society — savings credited less what you have borrowed. Negative means you have borrowed more than you have saved |
| **Total received** | Everything confirmed into your contributions |
| **Confirmed entries** | How many months you have paid in full |
| **Total due** | Everything still outstanding on your contributions |

Below them, four quick actions: **My contributions**, **Loans & eligibility**,
**Notifications**, **My profile**. Each is a link — there is nothing to
configure here.

### 3.2 Contributions — `/member/contributions`

Your own contribution history and balance.

- **Summary tiles** — Total due, Total received, and the contribution plan the
  society is currently running.
- **The table** — one row per cycle: cycle name, type (`regular`,
  `extra/voluntary`, or `adjustment`), amount due, amount received, status and
  date.

Statuses you will see: `pending`, `confirmed`, `missed`, `partial`.

> A member cannot confirm their own payment — that is deliberate. The
> treasurer confirms what the bursary actually remitted. Your entry moves to
> `confirmed` when that happens.

### 3.3 Loans — `/member/loans`

Three tabs.

#### Tab 1 — Active loans

Every loan you hold, with its terms at a glance:

| Field | Notes |
|---|---|
| Principal | The amount borrowed |
| Instalment | The monthly amount, e.g. `₦43,750.00/mo` |
| Interest | The rate **and the basis** — `10% flat` or `10% reducing balance` |
| Term | In months |
| Total repayable | Principal plus interest |
| Paid to date | How much of it is already settled |

Expanding a loan shows its instalment schedule, so you can see exactly which
month is which.

#### Tab 2 — Applications

Every application you have submitted, with the approval trail — who decided
what, and when. Each card shows the product, the term, the purpose, the date
submitted, and the list of approval steps.

#### Tab 3 — Guarantee requests

Applications where **you were named as a guarantor**. See
[section 5](#5-guarantee-requests) below.

### 3.4 Notifications — `/member/notifications`

- Tabs: **All** and **Unread** (with a count).
- **Mark all read** in the header, or **Mark read** on an individual card.
- Unread cards carry a coloured left edge.
- Each card shows a type icon — information, success, warning, error — a
  relative timestamp ("just now", "12m ago", "3d ago"), and the message.
- Pages of 20, with **Prev** / **Next**.
- The list refreshes on its own every minute.

Guarantee notifications carry a **Review guarantee request** button that opens
the confirm dialog without you having to hunt for the request.

### 3.5 My Profile — `/member/profile`

Your account summary: email, phone, account type, member-since date, last
sign-in, and your membership status. You can **change your password** here.

---

## 4. Applying for a loan

### Step 0 — Check eligibility first

On the Loans screen, open **Check eligibility**. Choose a product and
(optionally) an amount, and press **Check eligibility**.

You get a verdict and a **rule breakdown** — one line per rule with a green
tick or a red cross, and a sentence explaining it:

| Rule | What it checks |
|---|---|
| Membership duration | How long you have belonged to the society |
| Contribution history | How many months you have paid |
| Outstanding loans | Whether you already carry a loan |
| Guarantors | Whether enough guarantors have confirmed |
| Amount | Whether the amount is within your limit |

The summary line tells you the truth of the situation:

| Banner | Meaning |
|---|---|
| **You are eligible** | Every rule passed. Shows *Max borrowable* and whether the loan auto-approves or needs executive approval. |
| **Awaiting guarantors** | Everything passed except the guarantees. Not a rejection — the application is waiting for people to say yes. |
| **Not eligible** | At least one rule failed. The failing rules are marked in the breakdown. |

When you are eligible, press **Apply now** — it carries the product and the
maximum across into the application form.

### Step 1 — Product & Amount

| Field | Notes |
|---|---|
| **Loan product** | Choose from the active products |
| **Amount requested** | The maximum is shown under the field |
| **Repayment term** | In months, within the product's band |
| **Purpose** | Required. Free text — "Describe why you need this loan." |

The side panel shows the product's limits as you pick it: max amount, interest
rate, interest basis, max term, guarantors required.

**The repayment estimate appears live** as you type. It shows:

- Total interest
- Total repayable
- Monthly instalment
- The rate and the basis

and **Show instalment breakdown** expands the full schedule — every
instalment's principal, interest and total, with the interest falling in a
reducing-balance loan.

> These numbers come from the same calculator the platform uses to write your
> contract. What you see before applying is what you will be charged.

### Step 2 — Guarantors

Search for a guarantor by **name, email or employee number**. The list comes
from the society's active members, and shows only what you need to pick
someone.

Pick as many as the product requires. The counter at the bottom shows how many
you have chosen against how many the product needs.

### Step 3 — Review

Everything again, on one page: product, amount, term, interest, total
interest, monthly instalment, purpose, and your chosen guarantors. Then
**Submit**.

---

## 5. Guarantee requests

When a member names you as a guarantor, you get an in-app notification and the
request appears on your **Loans → Guarantee requests** tab.

The row shows the applicant's name and term, the product, the amount, the
application's status, and **your response** (`pending`, `confirmed` or
`declined`).

Press **Review** to open the dialog. It shows the application details and two
choices:

| Choice | What happens |
|---|---|
| **Confirm** | You vouch for the applicant. A comment is optional. |
| **Decline** | You decline. A reason is required. |

> Consent is never passive. The application stays in `guarantor_pending` until
> every guarantor acts — it is not rejected for being slow. An executive can
> also record their own `abstain` decision on a guarantor response.

---

## 6. User stories

### Member

| # | Story | Where it is |
|---|---|---|
| M1 | *As a member, I want to see how much I owe today without asking anyone, so that I can budget.* | Dashboard → Current balance / Total due |
| M2 | *As a member, I want to see every month I have paid in, so that I can prove my contribution history.* | Contributions table |
| M3 | *As a member, I want to know my loan's monthly instalment and total cost, so that I can plan.* | Loans → Active loans |
| M4 | *As a member, I want to see exactly which month of my loan is which, so that I can match deductions to instalments.* | Loans → Active loans → instalment schedule |
| M5 | *As a member, I want to know the interest rate **and basis** before applying, so that I understand what I am being charged.* | Application sheet → Repayment estimate |
| M6 | *As a member, I want to see the full instalment breakdown before I submit, so that there are no surprises.* | Application sheet → Show instalment breakdown |
| M7 | *As a member, I want to know why I am not eligible, so that I can fix it rather than guess.* | Check eligibility → Rule breakdown |
| M8 | *As a member, I want to know whether my application will be auto-approved or needs a human, so that I know how long to wait.* | Check eligibility → "Auto-approved" / "Requires executive approval" |
| M9 | *As a member, I want to be told when somebody names me as a guarantor, so that I can respond promptly.* | Notifications |
| M10 | *As a member, I want to confirm or decline a guarantee in one click from the notification, so that I do not have to navigate.* | Notification → Review guarantee request |
| M11 | *As a member, I want to track where my application has got to, so that I know whether to chase anybody.* | Loans → Applications → approval steps |
| M12 | *As a member, I want to see only my own records, so that my financial data stays private.* | Every member screen self-filters |
| M13 | *As a member, I want to find a colleague by name or email to choose as a guarantor, so that I am not blocked by a long list.* | Application sheet → guarantor search |
| M14 | *As a member, I want to change my password, so that my account stays secure.* | My Profile |

### Committee member (read-only)

| # | Story | Where it is |
|---|---|---|
| C1 | *As a committee member, I want to read the ledger, so that I can verify the society's books without taking custody of them.* | Executive → Financial Ledger |
| C2 | *As a committee member, I want to read every cycle and its entries, so that I can see what was due and what was collected.* | Executive → Cycles → a cycle |
| C3 | *As a committee member, I want to see the dashboard reports, so that I can brief the general meeting.* | Executive → Dashboard |
| C4 | *As a committee member, I want to see every loan application, so that I can watch the loan book.* | Executive → Loan Applications |
| C5 | *As a committee member, I want to see the member directory, so that I know who is in the society.* | Read-only within the executive portal |
| C6 | *As a committee member, I want the interface to show me nothing I can act on, so that I never fire a request that will be refused.* | No write buttons anywhere in the committee's view |

### Executive

| # | Story | Where it is |
|---|---|---|
| E1 | *As a treasurer, I want to open the month in one action, so that every active member is billed automatically.* | Cycles → Open contribution cycle |
| E2 | *As a treasurer, I want to confirm what the bursary actually remitted, so that member balances are accurate.* | A cycle → Confirm entry |
| E3 | *As a treasurer, I want to confirm many entries at once, so that month-end is not a slow grind.* | A cycle → Bulk confirm entries |
| E4 | *As a treasurer, I want to produce one file for the bursary, so that deductions happen on payday.* | Schedules → Generate deduction schedule → CSV / Excel |
| E5 | *As a treasurer, I want to see which applications are waiting on me, so that members are not left waiting.* | Executive → Dashboard → "Loan applications to review" |
| E6 | *As a treasurer, I want to approve or reject with a recorded reason, so that there is an audit trail.* | Loan application → Loan Decision |
| E7 | *As a treasurer, I want to read the immutable ledger, so that I can defend any figure I have given.* | Financial Ledger |
| E8 | *As a treasurer, I want to see the society's rules, so that I apply the same policy every time.* | Executive → Contribution Plans / society settings |

### Society admin

| # | Story | Where it is |
|---|---|---|
| S1 | *As a president, I want one roster screen, so that I can manage every member of the society.* | Society Admin → Members |
| S2 | *As a president, I want to approve a pending registration, so that new members can actually sign in.* | Members → Pending approvals |
| S3 | *As a president, I want to change a member's role, so that duties can be delegated.* | Member detail → Change role |
| S4 | *As a president, I want to suspend a member with a recorded reason, so that the decision is explained.* | Member detail → Change member status |
| S5 | *As a president, I want to hold the full member record, so that I can run payroll deductions.* | Member detail → profile (employee no, payroll no, bank) |
| S6 | *As a president, I want to set the society's interest rate once, so that every new product starts from the house rate.* | Settings → Business rules |
| S7 | *As a president, I want to create a loan product with an explicit basis, so that members see what they will pay.* | Loan Products → Create Loan Product |
| S8 | *As a president, I want to set the society's monthly contribution plan, so that cycles bill the right amount.* | Contribution Plans |
| S9 | *As a president, I want to publish a version of the business rules, so that a policy change is dated and reversible.* | Settings → Business rules → Publish rule version |
| S10 | *As a president, I want to brand the portal for my society, so that members see my society's name and colours.* | Settings → Branding |

### Platform admin

| # | Story | Where it is |
|---|---|---|
| P1 | *As a platform admin, I want to onboard a society in one dialog, so that a new cooperative can start.* | Platform → Cooperative societies → Onboard a society |
| P2 | *As a platform admin, I want to see every society at once, so that I can spot an inactive one.* | Platform → Cooperative societies |
| P3 | *As a platform admin, I want to suspend a society without deleting it, so that its history is preserved.* | Society detail → Suspend |
| P4 | *As a platform admin, I want to open a society's configuration, so that I can fix something the society admin cannot.* | Society detail → Overview / Branding / Settings / Rules |
| P5 | *As a platform admin, I want cross-tenant statistics, so that I know the platform is healthy.* | Platform → Overview |

---

## 7. Worked example — Adebayo takes a loan

The demo society (`acada`) has two products and one published rule set:

| Product | Rate & basis | Max | Term | Guarantors | Auto-approve up to |
|---|---|---|---|---|---|
| **Standard Loan** | 5% **flat** | ₦500,000 | 1–24 months | 2 | ₦100,000 |
| **Salary Advance** | 4% **reducing** | ₦300,000 | 1–12 months | 1 | ₦50,000 |

Rule set v1: escalation threshold **₦100,000**, house rate **5% flat**, term
ceiling **36 months**, missed-payment penalty **₦500 flat**.

### 7.1 He checks eligibility

He picks **Standard Loan** and types `500000`. The result is a verdict and a
five-line rule breakdown:

```
✓ Membership: 33 months (required: 6)
✓ Contributions: 7 confirmed (required: 6)
✓ No defaulted loans. Active loans: 2
✗ Requested: ₦500,000.00 (max: ₦… )
  This product requires 2 guarantor(s) who must confirm in the app.
```

The rule breakdown is the point of this screen. Adebayo can see exactly
which rule he fails and by how much, instead of a bare "ineligible".

> **Why the max can be surprising.** The maximum is
> `min(savings × the product's multiplier, the product's ceiling)`. A member
> who has borrowed heavily can have a *negative* savings balance, which makes
> the maximum negative — effectively meaning "settle what you owe first".
> The demo member Adebayo is in exactly that position, because the seeded data
> has him holding ₦710,000 of disbursed loans with no repayments recorded.

### 7.2 He applies

Product & Amount: **Standard Loan**, `500000`, `12` months, purpose
*"Conference travel and materials"*.

**The repayment estimate appears live.** For a flat 5% loan:

| | |
|---|---|
| Total interest | **₦25,000.00** |
| Total repayable | **₦525,000.00** |
| Monthly instalment | **₦43,750.00/mo** |

He expands **Show instalment breakdown** and sees twelve rows: instalments 1
to 11 are ₦41,666.67 of principal plus ₦2,083.33 of interest, and the twelfth
carries the rounding residue. The schedule sums to exactly ₦525,000.00.

> For comparison, the same ₦300,000 over 12 months on **Salary Advance**
> (4% reducing) costs **₦6,539.66** in interest, **₦306,539.66** in total, at
> **₦25,544.97/month** — with the interest inside each instalment falling:
> ₦1,000.00 → ₦918.18 → ₦836.09 → ₦753.73. Same rate, same term, a
> completely different cash flow. That is why the basis is always displayed.

### 7.3 He adds guarantors

He searches "Folake", picks **Folake Adeyemi** and **Chioma Eze**, and moves
to Review. The review page repeats every figure from the estimate, then he
submits.

### 7.4 He waits

Folake and Chioma each get an in-app notification. Until they act, the
application sits in `guarantor_pending` — **not** rejected. When both
confirm, the rule engine evaluates: ₦500,000 is above the ₦100,000 escalation
threshold, so the application is **escalated** to the executives.

### 7.5 The treasurer decides

Segun Balogun (`treasurer@acada.demo`) opens Executive → Loan Applications,
filters to *Escalated*, opens the application and presses **Loan Decision**.
Approving writes the contract with the rate and basis snapshotted from the
product at that moment — 5% flat — and generates the instalment schedule.

### 7.6 Adebayo is notified

He sees the contract on his dashboard, with the instalment schedule. It then
rides along on the monthly deduction schedule with the next cycle.

---

## 8. FAQ

**Q. I can see other members' names but not their details. Why?**
Because naming a guarantor needs a name, and nothing else. Employee numbers,
payroll numbers, dates of birth, next-of-kin and bank coordinates are
restricted to the society admin, who needs them for payroll deductions.

**Q. My application says "Awaiting guarantors". Has it been rejected?**
No. It is waiting. A guarantor who has not responded is not a refusal.

**Q. Can I confirm my own contribution?**
No. The treasurer confirms what the bursary actually remitted; that is what
keeps the ledger honest.

**Q. The product's rate changed after I applied. Which rate applies to me?**
The one snapshotted at approval. Changing a product never rewrites a contract
that has already been issued.

**Q. Why does my notification have a "Review guarantee request" button?**
Because it is about an application where you were named as a guarantor. The
button opens the confirm dialog directly.

**Q. I signed in but every screen is empty.**
Your membership is probably still `pending`. A society admin must approve it
before any tenant-scoped endpoint will return data.

---

**Next:** [02 — Committee member](02-committee-member.md)
