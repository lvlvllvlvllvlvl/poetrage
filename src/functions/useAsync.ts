import { useEffect, useMemo, useState } from "react";

//https://usehooks.com/useAsync/
export const useAsync = <R, T extends any[]>(
  fn?: (...args: T) => Promise<R>,
  deps?: any[],
  ...args: T
) => {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "fail">("idle");
  const [value, setValue] = useState<R | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setValue(null);
    setError(undefined);
    setStatus(fn ? "pending" : "idle");
    fn &&
      (async () => {
        try {
          const result = await fn(...(args || ([] as any)));
          setValue(() => result);
          setStatus("done");
        } catch (error) {
          console.error(error);
          setError(error ? String(error) : "Unknown error");
          setStatus("fail");
        }
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...(deps || []), ...args]);

  return useMemo(
    () =>
      ({
        done: false,
        fail: false,
        pending: false,
        [status]: true,
        value,
        error,
      } as any as Readonly<
        | {
            done: true;
            pending: false;
            fail: false;
            error: undefined;
            value: R;
          }
        | { done: false; pending: true; fail: false; error: undefined; value: undefined }
        | { done: false; pending: false; fail: true; error: string; value: undefined }
      >),
    [status, value, error]
  );
};
