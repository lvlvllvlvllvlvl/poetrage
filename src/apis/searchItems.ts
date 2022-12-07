import { FetchResult, SearchQueryContainer, SearchResult } from "../models/poe/Search";
import { api } from "./axios";

export const searchItems = async (league: string, query: SearchQueryContainer) => {
  const search = await api.post<SearchResult>(
    `https://www.pathofexile.com/api/trade/search/${league}`,
    query
  );

  const fetch = !search.data.total
    ? { data: { result: [] } as FetchResult }
    : await api.get<FetchResult>(
        `https://www.pathofexile.com/api/trade/fetch/${search.data.result
          .slice(0, 10)
          .join(",")}?query=${search.data.id}`
      );

  return { search: search.data, fetch: fetch.data };
};
