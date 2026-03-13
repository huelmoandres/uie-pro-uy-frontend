import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a fast-changing value.
 * Useful for delaying search queries until the user stops typing.
 *
 * @param value The value to debounce.
 * @param delay The delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time useEffect is re-called.
    // useEffect will only be re-called if value or delay changes (see the deps array).
    // This is how we prevent debouncedValue from changing if value is changed within the delay period.
    // Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
