import { FilterFn } from "@tanstack/react-table";
import { memoize } from "lodash";
import { GemDetails, getId } from "models/gems";
import SearchOperators from "search-operators";

export const includes: FilterFn<GemDetails> = (row, columnId, filterValue: any[]) =>
  (filterValue?.length || 0) === 0 || filterValue.includes(row.getValue(columnId));

const parse = memoize((text) => SearchOperators.parse(text, { keys: [] }));

export const search: FilterFn<GemDetails> = (row, columnId, text) => {
  const { filters, terms } = parse(text || "");
  const value = (row.getValue(columnId) as string).toLowerCase();
  const id = getId(row.original).toLowerCase();
  for (const term of terms) {
    const lower = (term as string).toLowerCase();
    if (!id.includes(lower)) {
      return false;
    }
  }
  return filters.every((filter) => {
    const lower = filter.value.toLowerCase();
    if (filter.type === "exact") {
      return value === lower || id === lower;
    } else if (filter.type === "exclude") {
      return !id.includes(lower);
    } else {
      return true;
    }
  });
};
