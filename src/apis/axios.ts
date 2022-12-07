import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import localforage from "localforage";
import driver from "localforage-sessionstoragewrapper";

const hour = 60 * 60 * 1000;

export const cache = (async () => {
  await localforage.defineDriver(driver);

  const forageStore = localforage.createInstance({
    driver: driver._driver,
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
