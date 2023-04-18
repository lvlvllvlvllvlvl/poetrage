import { searchItems } from "apis/searchItems";
import { filterOutliers } from "functions/filterOutliers";
import { getCurrency } from "functions/getCurrency";
import { SearchQueryContainer } from "models/poe/Search";

export const getPrice = async (
  league: string,
  currencyMap: { [key: string]: number },
  query: SearchQueryContainer,
  type: "average" | "cheapest" = "average"
) => {
  const { search, fetch } = await searchItems(league, query);

  const prices = fetch.result.map(({ listing: { price } }) => price) || [];
  const chaosValues = prices
    .filter(({ currency, amount }) => currency && amount && getCurrency(currency, currencyMap))
    .map(({ currency, amount }: any) => getCurrency(currency, currencyMap) * amount);
  if (type === "average") {
    let filteredValues = filterOutliers(chaosValues);
    if (filteredValues.length === 0) filteredValues = chaosValues;
    const sum = filteredValues.reduce((a, b) => a + b, 0);
    return {
      price: Math.round((sum * 10) / filteredValues.length) / 10,
      total: search.total,
      pageSize: chaosValues.length,
      filtered: filteredValues.length,
      searchId: search.id,
    };
  } else {
    return {
      price: Math.round((chaosValues[0] || 0) * 10) / 10,
      total: search.total,
      pageSize: chaosValues.length,
      searchId: search.id,
    };
  }
};

export const getTempleAverage = async (league: string, currencyMap: { [key: string]: number }) => {
  return await getPrice(league, currencyMap, {
    query: {
      status: {
        option: "onlineleague",
      },
      stats: [
        {
          type: "and",
          filters: [
            {
              id: "pseudo.pseudo_temple_gem_room_3",
              value: { option: 1 },
              disabled: false,
            },
          ],
        },
      ],
    },
    sort: { price: "asc" },
  });
};

export const getAwakenedLevelAverage = async (
  league: string,
  currencyMap: { [key: string]: number }
) => {
  return await getPrice(league, currencyMap, {
    query: {
      status: {
        option: "onlineleague",
      },
      type: "Wild Brambleback",
    },
    sort: { price: "asc" },
  });
};

export const getAwakenedRerollAverage = async (
  league: string,
  currencyMap: { [key: string]: number }
) => {
  return await getPrice(league, currencyMap, {
    query: {
      status: {
        option: "onlineleague",
      },
      type: "Vivid Watcher",
    },
    sort: { price: "asc" },
  });
};
