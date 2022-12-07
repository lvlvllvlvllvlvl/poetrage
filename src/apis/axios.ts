import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";

const hour = 60 * 60 * 1000;

export const cache = (async () => {
  await localforage.defineDriver(memoryDriver);

  const forageStore = localforage.createInstance({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver],
    name: "poetrage",
  });

  return setupCache({
    store: forageStore,
    maxAge: hour,
    exclude: {
      query: false,
      methods: ["put", "patch", "delete"],
    },
  });
})();

export const api = axios.create({
  maxRedirects: 0,
  adapter: async (req) => {
    return await (await cache).adapter(req);
  },
});

api.interceptors.request.use((req) => {
  if (req.url) {
    req.url = "https://corsproxy.io/?" + encodeURIComponent(req.url);
  }
  return req;
});
