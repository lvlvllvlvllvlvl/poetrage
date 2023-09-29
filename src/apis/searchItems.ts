import { api, uncachedApi } from "apis/axios";
import { FetchResult, SearchQueryContainer, SearchResult } from "models/poe/Search";

export const searchItems = async (league: string, query: SearchQueryContainer) => {
  const search = await uncachedApi.post<SearchResult>(
    `https://www.pathofexile.com/api/trade/search/${league}`,
    query,
  );

  const fetch = !search.data.total
    ? { data: { result: [] } as FetchResult }
    : await api.get<FetchResult>(
        `https://www.pathofexile.com/api/trade/fetch/${search.data.result
          .slice(0, 10)
          .join(",")}?query=${search.data.id}`,
      );

  return { search: search.data, fetch: fetch.data };
};
