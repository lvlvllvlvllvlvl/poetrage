import { useState } from "react";

function useDebouncedState<T>(
  initialValue: T,
  ms: number = 500
): Readonly<{ value: T; debounced: T; set: (value: T) => void }> {
  const [value, setValue] = useState<T>(initialValue);
  const [debounced, setDebounced] = useState<T>(initialValue);

  let timeout: NodeJS.Timeout;
  const set = (value: T) => {
    setValue(value);
    clearTimeout(timeout);
    timeout = setTimeout(() => setDebounced(value), ms);
  };

  return { value, debounced, set };
}

export default useDebouncedState;
