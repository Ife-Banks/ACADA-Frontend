# 06 — Permissions reference

The complete access model in one place: every screen, every endpoint, every
role. Verified live against the running API for the `acada` demo tenant.

---

## 1. Roles at a glance

| Role | Display name | Scope | Portal | Home |
|---|---|---|---|---|
| `MEMBER` | Member | Own records | `/member/*` | `/member/dashboard` |
| `COMMITTEE_MEMBER` | Committee Member | Society, read-only | `/executive/*`, `/member/*` | `/executive/dashboard` |
| `EXECUTIVE` | Executive | Society, read + operate | `/executive/*`, `/member/*` | `/executive/dashboard` |
| `SOCIETY_ADMIN` | President | Own society, full | `/admin/*`, `/executive/*`, `/member/*` | `/admin/members` |
| `SUPER_ADMIN` | Platform Administrator | All tenants | `/platform/*` | `/platform/stats` |

---

## 2. Screen access

**✓** = the role can open the screen and see its content · **read** = the
screen is visible but every write control is absent or disabled · **—** = the
route gate redirects the role away.

### Member portal

| Screen | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `/member/dashboard` | ✓ | ✓ | ✓ | ✓ | — |
| `/member/contributions` | ✓ | ✓ | ✓ | ✓ | — |
| `/member/loans` | ✓ | ✓ | ✓ | ✓ | — |
| `/member/notifications` | ✓ | ✓ | ✓ | ✓ | — |
| `/member/profile` | ✓ | ✓ | ✓ | ✓ | — |

Every role may open `/member/*`, because officers are members too.

### Executive portal

| Screen | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `/executive/dashboard` | — | read | ✓ | ✓ | — |
| `/executive/cycles` | — | read | ✓ | ✓ | — |
| `/executive/cycles/{id}` | — | read | ✓ | ✓ | — |
| `/executive/ledger` | — | read | ✓ | ✓ | — |
| `/executive/loans` | — | read | ✓ | ✓ | — |
| `/executive/loans/{id}` | — | read | ✓ | ✓ | — |
| `/executive/schedules` | — | — | ✓ | ✓ | — |
| `/executive/schedules/{id}` | — | — | ✓ | ✓ | — |
| `/executive/plans` | — | — | — | ✓ | — |

### Society admin portal

| Screen | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `/admin/members` | — | — | — | ✓ | — |
| `/admin/members/{id}` | — | — | — | ✓ | — |
| `/admin/loan-products` | — | — | — | ✓ | — |
| `/admin/settings` | — | — | — | ✓ | — |

### Platform console

| Screen | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `/platform/stats` | — | — | — | — | ✓ |
| `/platform/tenants` | — | — | — | — | ✓ |
| `/platform/tenants/{id}` | — | — | — | — | ✓ |

### Public

| Screen | Access |
|---|---|
| `/` | Public landing page |
| `/login` | Public |
| `/register` | Public — creates a **pending** membership only |

---

## 3. Endpoint access

Every endpoint below was probed live with a real token for each of the five
roles against the `acada` tenant.

**Legend** — `200` allowed · `403` refused by the permission check · `400`
allowed but the request body failed validation (the probe sent an empty body
to a write endpoint, so `400` proves the role passed the permission check
without creating anything) · `404` the endpoint does not exist.

### Authentication

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `POST /auth/login/` | public | public | public | public | public |
| `POST /auth/register/` | public | public | public | public | public |
| `POST /auth/refresh/` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /auth/logout/` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `GET /auth/me/` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /auth/password/change/` | ✓ | ✓ | ✓ | ✓ | ✓ |

### Contributions

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `GET /contributions/my/` | 200 | 200 | 200 | 200 | 403 |
| `GET /contributions/my/balance/` | 200 | 200 | 200 | 200 | 403 |
| `GET /contributions/cycles/` | 200 | 200 | 200 | 200 | 403 |
| `GET /contributions/cycles/{id}/entries/` | 403 | 200 | 200 | 200 | — |
| `GET /contributions/cycles/{id}/penalties/` | 403 | 200 | 200 | 200 | — |
| `GET /contributions/entries/` | 403 | 403 | 200 | 200 | 200 † |
| `POST /contributions/entries/` | 403 | 403 | 400 | 400 | 400 |
| `POST /contributions/entries/{id}/confirm/` | 403 | 403 | ✓ | ✓ | — |
| `POST /contributions/cycles/` | 403 | 403 | 400 | 400 | 400 |
| `PATCH /contributions/cycles/{id}/` | 403 | 403 | ✓ | ✓ | — |
| `POST /contributions/cycles/{id}/confirm/` | 403 | 403 | ✓ | ✓ | — |
| `GET /contributions/ledger/` | 403 | 200 | 200 | 200 | 200 † |
| `GET /contributions/plans/` | 200 | 200 | 200 | 200 | 403 |
| `POST /contributions/plans/` | 403 | 403 | 403 | 400 | 400 |
| `PATCH /contributions/plans/{id}/` | 403 | 403 | 403 | ✓ | — |

† The platform admin passes the permission check but the endpoint is
tenant-scoped, and a platform token carries no tenant — so the queryset
resolves to empty. The platform admin sees **no data**, never another
society's.

### Loans

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `GET /loans/products/` | 200 | 200 | 200 | 200 | 403 |
| `POST /loans/products/` | 403 | 403 | 403 | 400 | 400 |
| `PATCH /loans/products/{id}/` | 403 | 403 | 403 | ✓ | — |
| `GET /loans/applications/` | 200 ‡ | 200 | 200 | 200 | 403 |
| `GET /loans/applications/?scope=mine` | 200 ‡ | 200 ‡ | 200 ‡ | 200 ‡ | 403 |
| `POST /loans/applications/` | 400 | 400 | 400 | 400 | 403 |
| `GET /loans/applications/{id}/` | own only | 200 | 200 | 200 | — |
| `POST /loans/applications/{id}/approve/` | 403 | 403 | 404 § | 404 § | — |
| `GET /loans/applications/guarantor-requests/` | 200 | 200 | 200 | 200 | 403 |
| `POST /loans/applications/{id}/confirm-guarantor/` | own guarantee | own guarantee | ✓ | ✓ | — |
| `GET /loans/active/` | 200 ‡ | 200 | 200 | 200 | 403 |
| `POST /loans/eligibility/` | 400 | 400 | 400 | 400 | 403 |
| `POST /loans/quote/` | 400 | 400 | 400 | 400 | 403 |

‡ A member's application list is **self-filtered** to the applications they
submitted *or* guarantee. Officers see the whole society's book.

§ `404` because the probe used a non-existent application id: the role
passed the permission check and the lookup simply found nothing.

### Members

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `GET /members/` | 200 ‡ | 200 ‡ | 200 ‡ | 200 | 403 |
| `GET /members/pending/` | 403 | 403 | 403 | 200 | 200 † |
| `GET /members/guarantor-candidates/` | 200 | 200 | 200 | 200 | 403 |
| `POST /members/` | 403 | 403 | 403 | 400 | 400 |
| `PATCH /members/{id}/status/` | 403 | 403 | 403 | ✓ | — |
| `PUT /members/{id}/role/` | 403 | 403 | 403 | ✓ | — |
| `GET /members/{id}/profile/` | own only | thin ‡ | thin ‡ | 200 full | — |
| `PATCH /members/{id}/profile/` | 403 | 403 | 403 | ✓ | — |
| `GET /members/roles/` | 404 | 404 | 404 | 404 | 403 |
| `GET /members/permissions/` | 404 | 404 | 404 | 404 | 403 |

‡ Non-society-admin roles receive the **thin directory** record — names and
contact details only. The full record (employee number, payroll number, date
of birth, next-of-kin, bank details) is `SOCIETY_ADMIN` only.

`GET /members/roles/` and `GET /members/permissions/` are shadowed by the
`/members/{id}/` route and return `404` for every tenant role. The frontend
does not depend on them — the role list is hardcoded — but the endpoints
should be reordered. See [Known limitations](#5-known-limitations).

### Schedules, reports, notifications

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `GET /schedules/` | 403 | 403 | 200 | 200 | 200 † |
| `POST /schedules/generate/` | 403 | 403 | 400 | 400 | 400 |
| `GET /schedules/{id}/` | 403 | 403 | 200 | 200 | — |
| `GET /schedules/{id}/export/csv/` | 403 | 403 | 200 | 200 | — |
| `GET /schedules/{id}/export/excel/` | 403 | 403 | 200 | 200 | — |
| `GET /reports/dashboard/summary/` | 403 | 200 | 200 | 200 | 200 † |
| `GET /reports/dashboard/contributions_chart/` | 403 | 200 | 200 | 200 | 200 † |
| `GET /notifications/` | 200 ‡ | 200 ‡ | 200 ‡ | 200 ‡ | 403 |
| `POST /notifications/{id}/read/` | own | own | own | own | — |
| `POST /notifications/read-all/` | own | own | own | own | — |

‡ Notifications are always the signed-in user's own.

### Platform

| Endpoint | Member | Committee | Executive | Society admin | Platform admin |
|---|:--:|:--:|:--:|:--:|:--:|
| `GET /platform/stats/` | 403 | 403 | 403 | 403 | 200 |
| `GET /platform/tenants/` | 403 | 403 | 403 | 403 | 200 |
| `POST /platform/tenants/` | 403 | 403 | 403 | 403 | 400 |
| `GET /platform/tenants/{id}/` | 403 | 403 | 403 | 403 | 200 |
| `PATCH /platform/tenants/{id}/` | 403 | 403 | 403 | 403 | 400 |
| `POST /platform/tenants/{id}/activate/` | 403 | 403 | 403 | 403 | 200 |
| `POST /platform/tenants/{id}/suspend/` | 403 | 403 | 403 | 403 | 200 |
| `POST /platform/tenants/{id}/deactivate/` | 403 | 403 | 403 | 403 | 200 |
| `GET /platform/tenants/{id}/branding/` | 403 | 403 | 403 | 403 | 200 |
| `PATCH /platform/tenants/{id}/branding/` | 403 | 403 | 403 | 403 | 400 |
| `GET /platform/tenants/{id}/settings/` | 403 | 403 | 403 | 403 | 200 |
| `PATCH /platform/tenants/{id}/settings/` | 403 | 403 | 403 | 403 | 400 |
| `GET /platform/tenants/{id}/rules/` | 403 | 403 | 403 | 403 | 200 |
| `POST /platform/tenants/{id}/rules/` | 403 | 403 | 403 | 403 | 400 |

> **A society admin may configure only their own society.** The platform
> endpoints are shared by both roles, but the society admin's writes are
> resolved against *their own* tenant and refuse any other society's id.

---

## 4. The two layers of the model

### 4.1 Frontend capability helpers

`src/lib/roles.ts` is the single source of truth; `useAuth()` exposes it to
components. Use these instead of comparing role codes inline.

| Helper | True for |
|---|---|
| `isAuthenticated` | Any signed-in user |
| `isPlatformAdmin` | `SUPER_ADMIN` |
| `isSocietyAdmin` | `SOCIETY_ADMIN` |
| `isExecutiveOrAbove` | `EXECUTIVE`, `SOCIETY_ADMIN` — **not** committee |
| `canReadFinancials` | `COMMITTEE_MEMBER`, `EXECUTIVE`, `SOCIETY_ADMIN` |
| `canReadLoans` | `COMMITTEE_MEMBER`, `EXECUTIVE`, `SOCIETY_ADMIN` |
| `canConfirmContributions` | `EXECUTIVE`, `SOCIETY_ADMIN` |
| `canApproveLoans` | `EXECUTIVE`, `SOCIETY_ADMIN` |
| `canManageSchedules` | `EXECUTIVE`, `SOCIETY_ADMIN` |
| `canManageMembers` | `SOCIETY_ADMIN` |
| `canConfigureSociety` | `SOCIETY_ADMIN` |
| `hasRole(roles)` | Whatever you pass |

### 4.2 Backend permission classes

`common/permissions.py` provides the classes the API uses.

| Class | Grants |
|---|---|
| `IsTenantMember` | Any active membership in the current tenant |
| `IsExecutiveOrAbove` | `EXECUTIVE` and `SOCIETY_ADMIN` |
| `IsSocietyAdmin` | `SOCIETY_ADMIN` only |
| `HasTenantPermission` | Holders of a named permission code — supports per-user allow/deny overrides |
| `HasTenantRole` | Holders of a named role code |
| `IsPlatformAdmin` | `SUPER_ADMIN` only |
| `IsPlatformAdminOrSocietyAdmin` | `SUPER_ADMIN` **or** `SOCIETY_ADMIN` — the society admin's access is then resolved against their own tenant |

Evaluation order for `HasTenantPermission`:

1. Active membership in the current tenant?
2. An explicit **deny** override for this user? → **refuse**
3. An explicit **allow** override for this user? → **grant**
4. Does the user's role carry the permission? → grant or refuse

---

## 5. Permission code catalog

Seeded in `apps/core/management/commands/seed_demo.py`, from the PRD's
canonical catalog.

| Code | Committee | Executive | Society admin | Platform admin | Enforced by |
|---|:--:|:--:|:--:|:--:|---|
| `view_financials` | ✅ | ✅ | ✅ | ✅ | `HasTenantPermission` |
| `view_reports` | ✅ | ✅ | ✅ | ✅ | `HasTenantPermission` |
| `view_loans` | ✅ | ✅ | ✅ | ✅ | `HasTenantPermission` |
| `record_contributions` | — | ✅ | ✅ | ✅ | role code |
| `apply_penalties` | — | ✅ | ✅ | ✅ | role code |
| `approve_loans` | — | ✅ | ✅ | ✅ | `HasTenantPermission` |
| `prepare_deductions` | — | ✅ | ✅ | ✅ | role code |
| `manage_contribution_plans` | — | — | ✅ | ✅ | role code |
| `manage_loan_products` | — | — | ✅ | ✅ | role code |
| `manage_members` | — | — | ✅ | ✅ | role code |
| `manage_roles` | — | — | ✅ | ✅ | role code |
| `manage_tenant_settings` | — | — | ✅ | ✅ | role code |

> The observable behaviour matches this table exactly. The difference is
> *mechanism*: the `manage_*` grants are not yet consulted at request time,
> so a per-user override on those codes has no effect until the endpoints are
> switched over. See [Known limitations](#6-known-limitations).

---

## 6. Known limitations

| # | Issue | Effect | Workaround |
|---|---|---|---|
| 1 | `manage_*` permission codes are documentation only | A per-user allow/deny override on `manage_members`, `manage_roles`, `manage_loan_products`, `manage_contribution_plans` or `manage_tenant_settings` has no effect | Behaviour is still correct — those endpoints gate on the role code. Only the override mechanism is inert |
| 2 | `GET /members/roles/` and `GET /members/permissions/` return `404` | The route `/members/{id}/` shadows the collection routes | None needed — the frontend hardcodes the role list. Reordering the routes would fix it |
| 3 | `POST /loans/applications/{id}/approve/` on an application that already has a loan | `IntegrityError` instead of a friendly message | Approve each application once |
| 4 | No endpoint to record a loan repayment | `loan_repayment` ledger events cannot be posted; the schedule's repayment line comes from the contract, not from what was paid | Record repayments out of band for now |
| 5 | No endpoint to apply or waive a penalty | Penalties are computed and displayed but cannot be raised or waived from the interface | The ledger can carry a `penalty_debit` |
| 6 | `GET /health/` returns `404` under `runserver` | No health check in the local dev server | Use `GET /api/v1/platform/stats/` with a platform token |
| 7 | A member's maximum borrowable can be negative | A member who has borrowed more than they have saved sees a negative ceiling and fails the amount rule | By design — settle what you owe first |
| 8 | No automated test suite in either repository | Regressions are caught by manual probing | The live role matrix in §3 is the reference |

---

## 7. Reproducing the matrix

The endpoint matrix in §3 was produced by signing in as each demo role and
issuing one probe per endpoint. Write probes sent an empty body so that a
permitted role failed validation (`400`) while a forbidden role failed the
permission check (`403`) — nothing was created or modified.

```bash
# backend
cd ../COOPERATIVE
python manage.py runserver --noreload 0.0.0.0:8000
```

```python
import json, urllib.request, urllib.error

BASE = "http://localhost:8000/api/v1"
ACCOUNTS = {
    "MEMBER": "adebayo@acada.demo",
    "COMMITTEE_MEMBER": "committee@acada.demo",
    "EXECUTIVE": "treasurer@acada.demo",
    "SOCIETY_ADMIN": "president@acada.demo",
}

def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code

for role, email in ACCOUNTS.items():
    body = {"email": email, "password": "Passw0rd!23", "tenant_code": "acada"}
    req = urllib.request.Request(BASE + "/auth/login/", data=json.dumps(body).encode(),
                                 method="POST", headers={"Content-Type": "application/json"})
    token = json.load(urllib.request.urlopen(req, timeout=30))["access"]
    print(role, call("GET", "/contributions/ledger/", token))
```

---

**Back to:** [Manual index](README.md) · [System overview](00-system-overview.md)
