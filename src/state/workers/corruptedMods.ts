import { ApolloClient, InMemoryCache } from "@apollo/client";
import { forageStore } from "apis/localForage";
import { LocalForageWrapper, persistCache } from "apollo3-cache-persist";
import modData from "data/mods.json";
import { graphql } from "gql";
import { UniqueProfits } from "models/corruptions";
import { CorruptedMod, UniquePricing } from "models/poewatch/Unique";
import { ModInfo, ModInputs } from "state/selectors/modInputs";

const { uniques, mods, weights } = modData as ModInfo;

let cancel = new AbortController();
const channel = new MessageChannel();
const sleep = (ms?: number) =>
  ms
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : new Promise((resolve) => {
        channel.port1.onmessage = () => {
          channel.port1.onmessage = null;
          resolve(null);
        };
        channel.port2.postMessage(null);
      });

export const poeWatch = async (
  { league }: ModInputs,
  self?: Window & typeof globalThis,
): Promise<any> => {
  cancel.abort();
  cancel = new AbortController();
  const signal = cancel.signal;
  const pricing: UniquePricing[] = (
    await Promise.all(
      ["accessory", "armour", "jewel", "weapon"].map((category) =>
        fetch(`https://api.poe.watch/get?category=${category}&league=${league?.name}`, {
          signal,
        }).then((r) => r.json()),
      ),
    )
  ).flatMap((v) => v);
  const requests: Promise<any>[] = [];
  const results: UniqueProfits = {};
  for (const item of pricing) {
    const r = uniques[item.name.toLowerCase()]?.map(({ page_name, tags }) => {
      const uniqueName = page_name + (item.linkCount ? ` (${item.linkCount}-link)` : "");
      if (uniqueName in results) {
        console.warn("duplicate item", uniqueName);
      } else {
        results[uniqueName] = { cost: item.mean, profit: 0.25 * -item.mean, outcomes: {} };
      }
      return { tags, uniqueName };
    });
    if (!r) {
      console.warn(item.name, "not in mod data");
      continue;
    }
    const req = () =>
      fetch(`https://api.poe.watch/corruptions?id=${item.id}&league=${league?.name}`, { signal });
    requests.push(
      req()
        .catch(() => sleep(200).then(req))
        .catch(() => sleep(400).then(req))
        .catch(() => sleep(800).then(req))
        .then((r) => r.json())
        .then(
          (m: CorruptedMod[]) =>
            m?.forEach(({ name, mean }) =>
              r.forEach(({ tags, uniqueName }) => {
                const weight = weights[tags];
                if (!weight) {
                  return;
                }
                const mod = mods[name.toLowerCase()];
                if (mod) {
                  for (const [id, m] of Object.entries(mod)) {
                    if (!weight.mods[id]) continue;
                    const profit = mean - item.mean;
                    const chance = 0.25 * (weight.mods[id] / weight.sumWeight);
                    const ev = profit * chance;
                    if (isNaN(ev)) {
                      console.debug(mean, item.mean, name, weight, id);
                    } else {
                      const result = results[uniqueName];
                      result.profit = result.profit + ev;
                      result.outcomes[m.stat.formatted] = { profit, chance, ev };
                    }
                  }
                } else if (
                  !item.implicits?.includes(name) &&
                  !item.implicits?.find((i) => i.includes("Synthesis implicit"))
                ) {
                  // Probably just the item's regular implicit hasn't been updated in poe.watch
                  console.debug(name, "corrupted mod not found for", item.name);
                }
              }),
            ),
        )
        .catch(console.warn),
    );
    await sleep();
  }
  await Promise.all(requests);
  const payload = Object.fromEntries(
    Object.entries(results).sort(([, { profit: l }], [, { profit: r }]) => r - l),
  );
  self?.postMessage({ action: "data", payload });
};

let client: ApolloClient<any> | null = null;
const query = graphql(`
  query GetUniques($search: LivePricingSummarySearch!) {
    livePricingSummarySearch(search: $search) {
      entries {
        itemGroup {
          key
          properties
        }
        valuation {
          value
        }
      }
    }
  }
`);

const search = {
  league: "Ancestor",
  tag: "unique",
  limit: 100,
  offSet: 0,
};

export const poeStack = async ({}: ModInputs, self?: Window & typeof globalThis): Promise<any> => {
  if (!client) {
    const cache = new InMemoryCache();
    await persistCache({
      cache,
      storage: new LocalForageWrapper(await forageStore),
    });
    client = new ApolloClient({
      uri: "https://api.poestack.com/graphql",
      cache,
    });
  }
  let offSet = 0;
  const prices = {} as Record<string, { tags: string; data: Record<string, number> }>;
  while (true) {
    const result = await client.query({ query, variables: { search: { ...search, offSet } } });
    const count = result.data.livePricingSummarySearch.entries.length;
    if (count === 0) {
      break;
    }
    offSet += Math.max(1, Math.floor(count * 0.95));

    queueMicrotask(() => {
      result.data.livePricingSummarySearch.entries.forEach((e) => {
        if (
          !e.valuation ||
          e.itemGroup.properties?.find(
            ({ key, value }) => (key === "foilVariation" || key === "enchantMods") && value,
          )
        ) {
          return;
        }
        const variants = uniques[e.itemGroup.key];
        if (!variants) {
          console.debug("unique not recognized", e.itemGroup.key);
          return;
        }
        const corruptedMods = e.itemGroup.properties?.find(({ key }) => key === "corruptedMods")
          ?.value;
        let mod = "uncorrupted";
        if (corruptedMods?.length === 0) {
          mod = "corrupted";
        } else if (corruptedMods?.length === 1) {
          mod = corruptedMods[0];
        } else if (corruptedMods?.length > 1) {
          // Don't handle double corrupts yet
          return;
        }
        const sixLink = Boolean(
          e.itemGroup.properties?.find(({ key }) => key === "sixLink")?.value,
        );
        for (const { page_name, tags } of variants) {
          const uniqueName = page_name + (sixLink ? " (6-link)" : "");
          prices[uniqueName] = prices[uniqueName] || { tags, data: {} };
          prices[uniqueName].data[mod] = e.valuation?.value || 0;
        }
      });
      const results: UniqueProfits = {};
      for (const [uniqueName, { tags, data }] of Object.entries(prices)) {
        const cost = data["uncorrupted"];
        if (!cost) {
          continue;
        }
        const weight = weights[tags];
        if (!weight) {
          continue;
        }

        let profit = 0.25 * -cost;
        const result: UniqueProfits[string] = {
          cost,
          profit,
          outcomes: {
            "Brick to rare": { chance: 0.25, profit: -cost, ev: profit },
          },
        };
        for (const [placeholder, value] of Object.entries(data)) {
          if (placeholder === "corrupted" || placeholder === "uncorrupted") continue;
          const mod = mods[placeholder] || {};
          for (const [id, m] of Object.entries(mod)) {
            if (!weight.mods[id]) continue;
            const profit = value - cost;
            const chance = 0.25 * (weight.mods[id] / weight.sumWeight);
            const ev = profit * chance;
            if (isNaN(ev)) {
              console.debug(value, cost, uniqueName, weight, id);
            } else {
              result.profit = result.profit + ev;
              result.outcomes[m.stat.formatted] = { profit, chance, ev };
            }
          }
        }

        if (Object.keys(result.outcomes).length > 1) {
          results[uniqueName] = result;
        }
      }

      if (Object.keys(results).length === 0) return;

      const payload = Object.fromEntries(
        Object.entries(results).sort(([, { profit: l }], [, { profit: r }]) => r - l),
      );
      self?.postMessage({ action: "data", payload });
      self?.postMessage({
        action: "msg",
        payload:
          Object.values(prices).reduce((sum, p) => sum + Object.keys(p.data).length, 0) +
          " rows processed out of ???",
      });
    });
  }
  self?.postMessage({ action: "msg", payload: null });
};

self.onmessage = ({ data }: { data: ModInputs }) =>
  data.source === "watch"
    ? poeWatch(data, self).catch(console.error)
    : poeStack(data, self).catch(console.error);
