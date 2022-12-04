import { useState } from 'react';

function useDebouncedState<T>(initialValue: T, ms: number = 500): [T, T, (value: T) => void] {
    const [immediateValue, setImmediateValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

    let timeout: NodeJS.Timeout;
    const setValue = (value: T) => {
        setImmediateValue(value);
        clearTimeout(timeout);
        timeout = setTimeout(() => setDebouncedValue(value), ms);
    }

    return [immediateValue, debouncedValue, setValue];
}

export default useDebouncedState
