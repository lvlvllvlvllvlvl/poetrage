import { filterOutliers } from "functions/filterOutliers";
import { SearchQueryContainer } from "models/poe/Search";
import { searchItems } from "apis/searchItems";

const getAveragePrice = async (
  league: string,
  currencyMap: (key: string) => number,
  query: SearchQueryContainer
) => {
  const { search, fetch } = await searchItems(league, query);

  const prices = fetch.result.map(({ listing: { price } }) => price) || [];
  const chaosValues = prices
    .filter(({ currency, amount }) => currency && amount && currencyMap(currency))
    .map(({ currency, amount }: any) => currencyMap(currency) * amount);
  let filteredValues = filterOutliers(chaosValues);
  if (filteredValues.length === 0) filteredValues = chaosValues;
  const sum = filteredValues.reduce((a, b) => a + b, 0);
  return {
    price: Math.round(sum / filteredValues.length),
    total: search.total,
    pageSize: chaosValues.length,
    filtered: filteredValues.length,
    searchId: search.id,
  };
};

export const getTempleAverage = async (league: string, currencyMap: (key: string) => number) => {
  return await getAveragePrice(league, currencyMap, {
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
  currencyMap: (key: string) => number
) => {
  return await getAveragePrice(league, currencyMap, {
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
  currencyMap: (key: string) => number
) => {
  return await getAveragePrice(league, currencyMap, {
    query: {
      status: {
        option: "onlineleague",
      },
      type: "Vivid Watcher",
    },
    sort: { price: "asc" },
  });
};
