import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import useDebouncedState from "../functions/useDebouncedState";
import { GemDetails, gemTypes } from "../models/Gems";

type Key = keyof GemDetails;
const booleanCols: Key[] = ["lowConfidence", "Corrupted"];
const maxCols: Key[] = ["Level", "Quality", "Price"];
const minCols: Key[] = maxCols.concat([
  "XP",
  "xpValue",
  "gcpValue",
  "vaalValue",
  "templeValue",
  "Meta",
  "Listings",
  "regrValue",
]);
const minDefault: any = { Meta: 0.4, Listings: 5 };

const Filter = <T extends {}>({ column }: { column: Column<T, T[keyof T]> }) => {
  const key = column.id as Key;
  const isRange = minCols.includes(key);
  const isMax = maxCols.includes(key);
  const isBool = booleanCols.includes(key);
  const isText = key === "Name";
  const isType = key === "Type";
  const canFilter = column.getCanFilter();

  const min = useDebouncedState<number | undefined>(minDefault[key] || undefined);
  const max = useDebouncedState<number | undefined>(undefined);
  const text = useDebouncedState("");
  const [bool, setBool] = useState<boolean | undefined>(
    key === "lowConfidence" ? false : undefined
  );
  const [types, setTypes] = useState<string[]>([...gemTypes]);

  useEffect(() => {
    isRange &&
      column.setFilterValue(() => (!canFilter ? undefined : [min.debounced, max.debounced]));
  }, [canFilter, min.debounced, max.debounced, column, isRange]);
  useEffect(() => {
    isBool && column.setFilterValue(() => (!canFilter ? undefined : bool));
  }, [canFilter, bool, column, isBool]);
  useEffect(() => {
    isText && column.setFilterValue(() => (!canFilter ? undefined : text.debounced || undefined));
  }, [canFilter, text.debounced, column, isText]);
  useEffect(() => {
    isType && column.setFilterValue(() => (!canFilter ? undefined : types));
  }, [canFilter, types, column, isType]);

  if (isRange) {
    return (
      <Box sx={{ verticalAlign: "bottom" }}>
        <TextField
          type="number"
          label="min"
          variant="outlined"
          value={min.value}
          style={{
            maxWidth: "5em",
          }}
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
            style={{
              maxWidth: "5em",
            }}
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
