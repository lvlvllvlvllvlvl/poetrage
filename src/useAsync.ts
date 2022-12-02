import { useEffect, useState } from "react";

//https://usehooks.com/useAsync/
export const useAsync = <R, T extends any[]>(fn?: (...args: T) => Promise<R>, ...args: T) => {
    const [status, setStatus] = useState<"pending" | "done" | "fail">("pending");
    const [value, setValue] = useState<R | null>(null);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        setStatus("pending");
        setValue(null);
        setError(undefined);
        fn && console.debug("getting");
        fn && fn(...(args || [] as any))
            .then((response) => {
                setValue(response);
                setStatus("done");
            })
            .catch((error) => {
                console.error(error);
                setError(error ? String(error) : "Unknown error");
                setStatus("fail");
            });
    }, [fn, ...args]);

    return { done: false, fail: false, pending: false, [status]: true, value, error } as any as
        { done: true, pending: false, fail: false, error: undefined, value: R } |
        { done: false, pending: true, fail: false, error: undefined } |
        { done: false, pending: false, fail: true, error: string };
};
