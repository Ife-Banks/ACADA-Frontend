"use client";

/**
 * useDebouncedValue — delay a rapidly changing value.
 *
 * Used by search inputs that query the API: the input stays instant, but the
 * network request only fires once the user pauses.
 */

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
