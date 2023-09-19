/* eslint-disable no-restricted-globals */
import { defaultObj } from "functions/defaultObj";
import { getQuantifier } from "functions/formatStat";
import { cloneDeep, isNumber } from "lodash";
import { NodeMap } from "models/graphElements";
import { Stat } from "models/repoe/Translation";
import { Unique } from "models/repoe/Uniques";
import { WeightClass, WeightInputs } from "state/selectors/weightInputs";

export const uniqueProfits = (
  {
    inputs: { mods, uniques, translations },
    cancel,
  }: {
    inputs: WeightInputs;
    cancel?: URL;
  },
  self?: Window & typeof globalThis
): NodeMap | undefined => {
  try {
    const checkToken = () => {
      if (!cancel) return;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", cancel, false);
      xhr.send(null);
    };
    const setData = (payload: any) => {
      checkToken();
      self?.postMessage({ action: "data", payload });
    };
    let counter = 0;
    const setProgress = (payload: number) => {
      if (counter++ % 10 === 0) {
        checkToken();
      }
      self?.postMessage({ action: "progress", payload });
    };
    const setProgressMsg = (payload: string) => self?.postMessage({ action: "msg", payload });
    const done = () => self?.postMessage({ action: "done" });

    if (mods.status !== "done" || uniques.status !== "done" || translations.status !== "done") {
      return;
    }

    const stats: { [id: string]: Stat[] } = {};
    for (const { ids, English } of translations.value) {
      for (const id of ids) {
        if (!stats[id]) {
          stats[id] = [];
        }
        stats[id].push(...English.filter(({ format }) => !format.includes("ignore")));
      }
    }

    const corruptedMods = Object.entries(mods.value)
      .filter(([, mod]) => mod.generation_type === "corrupted" && mod.domain === "item")
      .map(([id, mod]) => ({ ...mod, id }));

    const results: { [base: string]: WeightClass } = {};

    for (const [name, variants] of Object.entries(uniques.value) as [string, Unique[]][]) {
      if (variants.length === 0 || !variants[0].tags) {
        console.debug("no tags found for unique", name, variants);
      }

      results[name] = { variants, sumWeight: 0, stats: defaultObj() };

      for (const mod of corruptedMods) {
        const weight =
          variants[0].tags
            .split(",")
            .map((tag) => mod.spawn_weights.find((mod) => mod.tag === tag))
            .find((w) => w)?.weight || 0;
        variants.slice(1).forEach(({ tags }) => {
          if (
            weight !==
              tags
                .split(",")
                .map((tag) => mod.spawn_weights.find((mod) => mod.tag === tag))
                .find((w) => w)?.weight ||
            0
          ) {
            console.debug("variant found with different weights", name, variants);
          }
        });
        if (!weight) continue;

        results[name].sumWeight += weight;

        if (!mod.stats.length || !stats[mod.stats[0].id]) {
          console.debug("no stat for corrupted mod", mod);
          results[name].stats["Unknown"][mod.id] = {
            ...mod,
            weight,
            stat: "Unknown",
          };
          continue;
        }

        if (mod.stats.length > 1) {
          console.log(mod.id);
        }
        for (const stat of mod.stats.flatMap(({ id, min, max }) => stats[id])) {
          if (stat.condition.find((c) => c.negated)) {
            console.debug("negated stat", stat);
          }

          let valid = true;
          const text = stat.string;
          const placeholders = text.replaceAll(/\{\d+\}/g, "#");
          const formatted = text.replaceAll(/\{(\d+)\}/g, (_, group) => {
            const index = parseInt(group);
            const value = mod.stats[index];
            const format = stat.format[index];
            if (!value) {
              return format;
            } else {
              const handler = stat.index_handlers[index];
              if (handler.length > 1) {
                console.debug("multiple index handlers", handler);
              }
              const condition = stat.condition[index];
              if (
                condition &&
                ((isNumber(condition.max) && value.max > condition.max) ||
                  (isNumber(condition.min) && value.min < condition.min))
              ) {
                valid = false;
              }
              const quantifier = getQuantifier(handler[0] || "none");
              const prefix = format === "+#" && value.min > 0 ? "+" : "";
              if (value.min === value.max) {
                return prefix + quantifier(value.min);
              } else {
                return `${prefix}(${quantifier(value.min)}-${quantifier(value.max)})`;
              }
            }
          });
          if (!valid) continue;

          const result = {
            ...mod,
            weight,
            stat: formatted,
          };
          results[name].stats[placeholders][mod.id] = result;
        }
      }
    }

    setData(cloneDeep(results));
  } catch (e) {
    console.debug(e);
  }
};

self.onmessage = ({ data }) => uniqueProfits(data, self);
