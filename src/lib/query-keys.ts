/**
 * Query-key factory — the single source of truth for every cache key.
 *
 * Rules:
 *  - Every key nests under a domain root (e.g. `qk.members.root`).
 *  - Mutations invalidate the domain root (or a narrower sub-key) so every
 *    related sub-query refreshes together. Example: after saving a member
 *    profile, `invalidates([qk.members.root])` refreshes the list, pending
 *    queue, detail page, and profile cache in one call.
 *  - Never inline a literal key in a hook or mutation; import from here so a
 *    typo can never silently break cache invalidation.
 */

// Root segment shared by every domain. Bump this (rare, e.g. after a schema
// change) to wipe all cached data without touching the backend.
const ROOT = "acada";

export const qk = {
  session: {
    root: [ROOT, "session"] as const,
    currentUser: [ROOT, "session", "currentUser"] as const,
  },

  notifications: {
    root: [ROOT, "notifications"] as const,
    list: (page = 1, pageSize = 20) =>
      [ROOT, "notifications", "list", { page, pageSize }] as const,
  },

  members: {
    root: [ROOT, "members"] as const,
    list: (page = 1, pageSize = 25) =>
      [ROOT, "members", "list", { page, pageSize }] as const,
    all: [ROOT, "members", "all"] as const,
    guarantorCandidates: [ROOT, "members", "guarantor-candidates"] as const,
    pending: [ROOT, "members", "pending"] as const,
    detail: (id: string) => [ROOT, "members", "detail", id] as const,
    profile: (id: string) => [ROOT, "members", "profile", id] as const,
  },

  contributions: {
    root: [ROOT, "contributions"] as const,
    list: (page = 1, pageSize = 25) =>
      [ROOT, "contributions", "list", { page, pageSize }] as const,
    balance: [ROOT, "contributions", "balance"] as const,
    plans: [ROOT, "contributions", "plans"] as const,
    allPlans: [ROOT, "contributions", "plans", "all"] as const,
    cycles: (page = 1, pageSize = 25) =>
      [ROOT, "contributions", "cycles", { page, pageSize }] as const,
    cycle: (id: string) => [ROOT, "contributions", "cycles", id] as const,
    cycleEntries: (cycleId: string, page = 1, pageSize = 25, status?: string) =>
      [
        ROOT,
        "contributions",
        "cycles",
        cycleId,
        "entries",
        { page, pageSize, status },
      ] as const,
    cyclePenalties: (cycleId: string) =>
      [ROOT, "contributions", "cycles", cycleId, "penalties"] as const,
    ledger: (page = 1, pageSize = 25) =>
      [ROOT, "contributions", "ledger", { page, pageSize }] as const,
  },

  loans: {
    root: [ROOT, "loans"] as const,
    allProducts: [ROOT, "loans", "products", "all"] as const,
    applications: (page = 1, pageSize = 25, search = "") =>
      [ROOT, "loans", "applications", { page, pageSize, search }] as const,
    myApplications: (page = 1, pageSize = 25) =>
      [ROOT, "loans", "applications", "mine", { page, pageSize }] as const,
    guarantorRequests: [ROOT, "loans", "applications", "guarantor"] as const,
    guaranteeRequest: (id: string) =>
      [ROOT, "loans", "applications", id, "guarantee"] as const,
    application: (id: string) => [ROOT, "loans", "applications", id] as const,
    active: (page = 1, pageSize = 25) =>
      [ROOT, "loans", "active", { page, pageSize }] as const,
    activeDetail: (id: string) => [ROOT, "loans", "active", id] as const,
    quote: (productId: string, amount: string, term: string) =>
      [ROOT, "loans", "quote", { productId, amount, term }] as const,
  },

  schedules: {
    root: [ROOT, "schedules"] as const,
    all: [ROOT, "schedules"] as const,
    detail: (id: string) => [ROOT, "schedules", id] as const,
  },

  reports: {
    root: [ROOT, "reports"] as const,
    dashboardSummary: [ROOT, "reports", "dashboard-summary"] as const,
    contributionsChart: (year: number) =>
      [ROOT, "reports", "contributions-chart", year] as const,
    platformStats: [ROOT, "reports", "platform-stats"] as const,
  },

  tenants: {
    root: [ROOT, "tenants"] as const,
    all: (page = 1, pageSize = 25) =>
      [ROOT, "tenants", "list", { page, pageSize }] as const,
    every: [ROOT, "tenants", "all"] as const,
    detail: (id: string) => [ROOT, "tenants", "detail", id] as const,
    settings: (id: string) => [ROOT, "tenants", "detail", id, "settings"] as const,
    rules: (id: string) => [ROOT, "tenants", "detail", id, "rules"] as const,
  },
} as const;