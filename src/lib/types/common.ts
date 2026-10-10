/**
 * Shared / utility types used across multiple domains.
 */

/** Standard DRF paginated list response */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Generic API error shape returned by the backend */
export interface ApiErrorBody {
  detail?: string;
  error?: string;
  [field: string]: unknown;
}

/** Query params for paginated list endpoints */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined | null;
}
