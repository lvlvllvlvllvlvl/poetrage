import axios from "axios";
import adapter from "axios-cache-adapter";
import { AxiosRateLimiter } from "rate-limit-rules";
import { forageStore } from "./localForage";

const hour = 60 * 60 * 1000;

const corsAdapter = (req: any) => {
  if (req.url && !req.url.includes("github.io")) {
    req.url = "https://corsproxy.io/?" + encodeURIComponent(req.url);
  }
  return axios.defaults.adapter!(req) as any;
};

const rateLimitAdapter = new AxiosRateLimiter({ adapter: corsAdapter }).request as any;

export const cache = (async () => {
  return adapter.setupCache({
    store: await forageStore,
    maxAge: hour,
    adapter: (req: any) =>
      req.url?.includes("pathofexile.com") ? rateLimitAdapter(req) : corsAdapter(req),
    exclude: {
      query: false,
      methods: ["put", "patch", "delete"],
    },
  } as any);
})();

export const api = axios.create({
  maxRedirects: 0,
  adapter: async (req) => await (await cache).adapter(req),
});

export const uncachedApi = axios.create({
  maxRedirects: 0,
  adapter: rateLimitAdapter,
});
