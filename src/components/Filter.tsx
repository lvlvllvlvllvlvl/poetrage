import { Box, Checkbox, FormControl, MenuItem, Select, TextField } from "@mui/material";
import { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import useDebouncedState from "../functions/useDebouncedState";
import { GemDetails, gemTypes } from "../models/Gems";

type Key = keyof GemDetails;
const booleanCols: Key[] = ["lowConfidence", "Corrupted"];
const maxCols: Key[] = ["Level", "Quality", "XP", "Price"];
const minCols: Key[] = maxCols.concat([
  "xpValue",
  "gcpValue",
  "vaalValue",
  "templeValue",
  "Meta",
  "Listings",
]);
const minDefault: any = { Meta: 1, Listings: 20 };

const Filter = <T extends {}>({ column }: { column: Column<T, T[keyof T]> }) => {
  const key = column.id as Key;
  const isRange = column.getCanFilter() && minCols.includes(key);
  const isMax = isRange && maxCols.includes(key);
  const isBool = column.getCanFilter() && booleanCols.includes(key);
  const isText = column.getCanFilter() && key === "Name";
  const isType = column.getCanFilter() && key === "Type";

  const min = useDebouncedState<number | undefined>(minDefault[key] || undefined);
  const max = useDebouncedState<number | undefined>(undefined);
  const text = useDebouncedState("");
  const [bool, setBool] = useState<boolean | undefined>(undefined);
  const [types, setTypes] = useState<string[]>([...gemTypes]);

  useEffect(() => {
    isRange && column.setFilterValue(() => [min.debounced, max.debounced]);
  }, [min.debounced, max.debounced, column, isRange]);
  useEffect(() => {
    isBool && column.setFilterValue(() => bool);
  }, [bool, column, isBool]);
  useEffect(() => {
    isText && column.setFilterValue(() => text.debounced || undefined);
  }, [text.debounced, column, isText]);
  useEffect(() => {
    isType && column.setFilterValue(() => types);
  }, [types, column, isType]);

  if (isRange) {
    return (
      <Box sx={{ verticalAlign: "bottom" }}>
        <TextField
          type="number"
          label="min"
          variant="outlined"
          value={min.value}
          style={{ width: isMax ? "50%" : "100%" }}
          inputProps={{
            min: column.getFacetedMinMaxValues()?.[0],
            max: column.getFacetedMinMaxValues()?.[1],
          }}
          placeholder={`${column.getFacetedMinMaxValues()?.[0]}`}
          onChange={({ target }) => min.set(target.value ? parseInt(target.value) : undefined)}
        />
        {isMax && (
          <TextField
            type="number"
            label="max"
            variant="outlined"
            value={max.value}
            style={{ width: "50%" }}
            inputProps={{
              min: column.getFacetedMinMaxValues()?.[0],
              max: column.getFacetedMinMaxValues()?.[1],
            }}
            placeholder={`${column.getFacetedMinMaxValues()?.[1]}`}
            onChange={({ target }) => max.set(target.value ? parseInt(target.value) : undefined)}
          />
        )}
      </Box>
    );
  }
  if (isBool) {
    return (
      <Box sx={{ height: 42 }}>
        <Checkbox
          checked={!!bool}
          indeterminate={bool === undefined}
          onChange={() => setBool(bool === true ? undefined : bool === false ? true : false)}
        />
      </Box>
    );
  }
  if (isText) {
    return (
      <Box sx={{ verticalAlign: "bottom" }}>
        <TextField
          type="text"
          label="search"
          variant="outlined"
          value={text.value}
          onChange={({ target }) => text.set(target.value)}
        />
      </Box>
    );
  }
  if (isType) {
    return (
      <Box>
        <FormControl sx={{ width: 100 }}>
          <Select
            multiple
            value={types}
            onChange={({ target }) =>
              setTypes(
                Array.isArray(target.value) ? target.value : target.value ? [target.value] : []
              )
            }>
            {gemTypes.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }
  return null;
};

export default Filter;
