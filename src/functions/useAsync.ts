import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import { useEffect, useMemo, useState } from "react";
import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";

const poe = /https:\/\/(www.)?pathofexile.com/;
const ninja = "https://poe.ninja";
const hour = 60 * 60 * 1000;

const configureAxios = (async () => {
  // Register the custom `memoryDriver` to `localforage`
  await localforage.defineDriver(memoryDriver);

  // Create `localforage` instance
  const forageStore = localforage.createInstance({
    // List of drivers used
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver],
    // Prefix all storage keys to prevent conflicts
    name: "my-cache",
  });

  const adapter = setupCache({
    store: forageStore,
    maxAge: hour,
    exclude: {
      query: false,
      methods: ["put", "patch", "delete"],
    },
  }).adapter;

  axios.defaults.adapter = async (req) => {
    const res = await adapter(req);

    // Work around interaction between
    // https://github.com/moepmoep12/poe-api-ts/blob/3b42d2f82beaf92d8c80f725702870f8d6aa7636/src/common/functions/request.ts#L92
    // and https://github.com/RasCarlito/axios-cache-adapter/blob/2d51cee4070ff88f2272533f9593fd41a392f52c/src/serialize.js#L5
    if (req.transformResponse && !(typeof res.data === "string" || res.data instanceof String)) {
      res.data = JSON.stringify(res.data);
    }
    return res;
  };

  axios.interceptors.request.use((config) => {
    if (config.data && Object.keys(config.data).length === 0) delete config.data;
    if (config.headers) delete config.headers["Content-Type"];
    config.url = config?.url
      ?.replace(ninja, "http://localhost:8080/ninja")
      ?.replace(poe, "http://localhost:8080/poe");
    return config;
  });
})();

//https://usehooks.com/useAsync/
export const useAsync = <R, T extends any[]>(fn?: (...args: T) => Promise<R>, ...args: T) => {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "fail">("idle");
  const [value, setValue] = useState<R | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setValue(null);
    setError(undefined);
    setStatus(fn ? "pending" : "idle");
    fn &&
      configureAxios.then(() =>
        fn(...(args || ([] as any)))
          .then((response) => {
            setValue(response);
            setStatus("done");
          })
          .catch((error) => {
            console.error(error);
            setError(error ? String(error) : "Unknown error");
            setStatus("fail");
          })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...args]);

  return useMemo(
    () =>
      ({
        done: false,
        fail: false,
        pending: false,
        [status]: true,
        value,
        error,
      } as any as
        | {
            done: true;
            pending: false;
            fail: false;
            error: undefined;
            value: R;
          }
        | { done: false; pending: true; fail: false; error: undefined }
        | { done: false; pending: false; fail: true; error: string }),
    [status, value, error]
  );
};
