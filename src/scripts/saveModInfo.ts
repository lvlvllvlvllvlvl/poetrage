import { writeFile } from "fs/promises";
import { getQuantifier } from "functions/formatStat";
import { isNumber } from "lodash";
import { BaseItem } from "models/repoe/BaseItem";
import { Mod } from "models/repoe/Mod";
import { Stat, Translation } from "models/repoe/Translation";
import { Unique } from "models/repoe/Uniques";
import { ModInfo } from "state/selectors/modInputs";
import { api } from "../apis/axios";

Promise.all([
  api
    .get<{ [key: string]: Mod }>("https://lvlvllvlvllvlvl.github.io/RePoE/mods.min.json")
    .then((r) => r.data),
  api
    .get<{ [name: string]: Unique[] }>(
      "https://lvlvllvlvllvlvl.github.io/RePoE/uniques_poewiki.min.json",
    )
    .then((r) => r.data),
  api
    .get<Translation[]>("https://lvlvllvlvllvlvl.github.io/RePoE/stat_translations.min.json")
    .then((r) => r.data),
  api
    .get<{ [name: string]: BaseItem }>(
      "https://lvlvllvlvllvlvl.github.io/RePoE/base_items.min.json",
    )
    .then((r) => r.data),
  api
    .get("https://www.pathofexile.com/api/trade/data/stats", {
      headers: {
        "User-Agent": "OAuth poetrage/1.0.0 (contact: https://github.com/lvlvllvlvllvlvl/poetrage)",
      },
    })
    .then((r) => r.data),
]).then(([mods, uniques, translations, base_items, trade]) => {
  try {
    const trans: { [id: string]: (Stat & { placeholder: string })[] } = {};
    for (const { ids, English } of translations) {
      for (const id of ids) {
        if (!trans[id]) {
          trans[id] = [];
        }
        trans[id].push(
          ...English.map((translation) => ({
            ...translation,
            placeholder: translation.string.replaceAll(/\{(\d+)\}/g, (_, group) => {
              const index = parseInt(group);
              return translation.format[index];
            }),
          })),
        );
      }
    }
    const suffix = / \([^()]*\)$/;
    const trade_stats: Record<string, string[]> = {};
    for (const { id, text } of trade.result.find(({ id }: any) => id === "implicit")
      .entries as Record<string, string>[]) {
      trade_stats[text] = trade_stats[text] || [];
      trade_stats[text].push(id);
      if (text.match(suffix)) {
        const stripped = text.replace(suffix, "");
        trade_stats[stripped] = trade_stats[stripped] || [];
        trade_stats[stripped].push(id);
      }
    }

    const corruptedMods: { [domain: string]: (Mod & { id: string })[] } = {};
    Object.entries(mods)
      .filter(([, mod]) => mod.generation_type === "corrupted")
      .forEach(([id, mod]) => {
        corruptedMods[mod.domain] = corruptedMods[mod.domain] || [];
        corruptedMods[mod.domain].push({ ...mod, id });
      });

    const results: ModInfo = {
      uniques: {},
      weights: {},
      mods: {},
    };
    const tagsets: { [domain: string]: Set<string> } = {};

    for (const [name, variants] of Object.entries(uniques) as [string, Unique[]][]) {
      if (variants.length === 0 || !variants[0].tags) {
        console.debug("no tags found for unique", name, variants);
      }

      results.uniques[name.toLowerCase()] = variants
        .filter((v) => !v.page_name.includes(":") && v.is_in_game === "1" && v.drop_enabled === "1")
        .map(({ tags, name, page_name, base_item_id, base_item }) => {
          tags = tags.split(",").sort().join();
          let domain = base_item_id && base_items[base_item_id]?.domain;
          if (domain) {
            tagsets[domain] = tagsets[domain] || new Set();
            tagsets[domain].add(tags);
          }
          return { page_name, tags, query: { name, type: base_item } };
        });
    }

    for (const [domain, tags] of Object.entries(tagsets).flatMap(([domain, set]) =>
      [...set].map((t) => [domain, t]),
    )) {
      for (const mod of corruptedMods[domain] || corruptedMods["misc"]) {
        const weight =
          tags
            .split(",")
            .map((tag) => mod.spawn_weights.find((mod) => mod.tag === tag))
            .find((w) => w?.weight)?.weight || 0;
        if (!weight) continue;

        results.weights[tags] = results.weights[tags] || { sumWeight: 0, mods: {} };
        results.weights[tags].sumWeight += weight;
        results.weights[tags].mods[mod.id] = weight;

        if (!mod.stats.length) {
          console.debug("no stats for corrupted mod", mod);
          continue;
        } else if (!trans[mod.stats[0].id]) {
          console.debug("no translation for stat", mod.stats[0].id);
          continue;
        }
        const trade_stat =
          trans[mod.stats[0].id].map((t) => trade_stats[t.placeholder]).find((t) => t) || [];
        if (!trade_stat) {
          console.warn(
            "no trade id found for stat",
            mod.stats[0].id,
            trans[mod.stats[0].id].map((t) => t.placeholder),
          );
        }

        for (const translation of mod.stats.flatMap(({ id }) => trans[id])) {
          if (translation.condition.find((c) => c.negated)) {
            console.debug("negated stat", translation);
          }

          let valid = true;
          const placeholder = translation.string.replaceAll(/\{(\d+)\}/g, (_, group) => {
            const index = parseInt(group);
            return translation.format[index];
          });
          const formatted = translation.string.replaceAll(/\{(\d+)\}/g, (_, group) => {
            const index = parseInt(group);
            const value = mod.stats[index];
            const format = translation.format[index];
            if (!value) {
              return format;
            } else {
              const handler = translation.index_handlers[index];
              if (handler.length > 1) {
                console.debug("multiple index handlers", handler);
              }
              const condition = translation.condition[index];
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

          const { id, groups, required_level, spawn_weights, stats, type } = mod;
          const result = {
            groups,
            required_level,
            spawn_weights,
            stats,
            type,
            weight,
            stat: { formatted, trade_stat },
          };
          const k = placeholder.toLowerCase();
          results.mods[k] = results.mods[k] || {};
          results.mods[k][id] = result;
        }
      }
    }
    writeFile(
      "src/data/mods.json",
      JSON.stringify(results, (_key, value) => (value instanceof Set ? [...value] : value), 2),
    );
  } catch (e) {
    console.debug(e);
  }
});
