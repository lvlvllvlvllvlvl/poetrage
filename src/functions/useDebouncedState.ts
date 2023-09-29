import { useState } from "react";

export type DebouncedState<T> = Readonly<{ value: T; debounced: T; set: (value: T) => void }>;

function useDebouncedState<T>(initialValue?: T, ms?: number): DebouncedState<T | undefined>;
function useDebouncedState<T>(initialValue: T, ms?: number): DebouncedState<T>;
function useDebouncedState<T>(initialValue?: T, ms: number = 350) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [debounced, setDebounced] = useState<T | undefined>(initialValue);
  const [timeoutId, setTimeoutId] = useState<number>();

  const set = (value: T) => {
    setValue(value);
    clearTimeout(timeoutId);
    setTimeoutId(setTimeout(() => setDebounced(value), ms));
  };

  return { value, debounced, set };
}

export default useDebouncedState;
