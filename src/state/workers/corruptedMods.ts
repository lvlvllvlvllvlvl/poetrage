import modData from "data/mods.json";
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
    if (!uniques[item.name]) {
      console.debug(item.name, "not in mod data");
      continue;
    }
    const r = uniques[item.name].map(({ page_name, tags }) => {
      const uniqueName = page_name + (item.linkCount ? ` (${item.linkCount}-link)` : "");
      if (uniqueName in results) {
        console.warn("duplicate item", uniqueName);
      } else {
        results[uniqueName] = { cost: item.mean, profit: 0.25 * -item.mean, outcomes: {} };
      }
      return { tags, uniqueName };
    });
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
            m?.forEach(
              ({ name, mean }) =>
                r?.forEach(({ tags, uniqueName }) => {
                  const weight = weights[tags];
                  if (!weight) {
                    console.log("no weight for", uniqueName, tags, name);
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

self.onmessage = ({ data }: { data: ModInputs }) =>
  data.source === "watch"
    ? poeWatch(data, self).catch(console.error)
    : poeWatch(data, self).catch(console.error);
