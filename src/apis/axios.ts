import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import { forageStore } from "./localForage";

const hour = 60 * 60 * 1000;

export const cache = (async () => {
  return setupCache({
    store: await forageStore,
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

export const uncachedApi = axios.create({
  maxRedirects: 0,
});

api.interceptors.request.use((req) => {
  if (req.url && !req.url.includes("github.io")) {
    req.url = "https://corsproxy.io/?" + encodeURIComponent(req.url);
  }
  return req;
});

uncachedApi.interceptors.request.use((req) => {
  if (req.url) {
    req.url = "https://corsproxy.io/?" + encodeURIComponent(req.url);
  }
  return req;
});
