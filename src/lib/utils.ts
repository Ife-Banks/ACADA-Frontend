import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Today's date in the browser's local timezone as `YYYY-MM-DD`.
 *
 * `new Date().toISOString()` converts to UTC first, which shifts the date for
 * users east or west of UTC and can make "today" compare as yesterday/tomorrow.
 */
export function localTodayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
