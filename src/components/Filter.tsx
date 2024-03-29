import ClearIcon from "@mui/icons-material/Clear";
import FilterIcon from "@mui/icons-material/FilterAlt";
import FilterOffIcon from "@mui/icons-material/FilterAltOff";
import FilterListIcon from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { Column } from "@tanstack/react-table";
import useDebouncedState from "functions/useDebouncedState";
import { isUndefined } from "lodash";
import { GemDetails } from "models/gems";
import { useEffect, useState } from "react";
import { setters } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";

type Key = keyof GemDetails | "ratio";

const Filter = <T extends {}>({ column }: { column: Column<T, T[keyof T]> }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const hideNonText = useAppSelector((state) => state.app.hideNonTextFilters);
  const { setHideNonTextFilters } = setters(useAppDispatch());

  const { isText } = column.columnDef.meta?.filter || {};
  const canFilter = column.columnDef.meta?.filter && column.getCanFilter();

  return canFilter ? (
    <Box
      sx={{
        height: 40,
        minWidth: 88,
      }}>
      <ToggleButton
        value="check"
        sx={{ maxWidth: 40, maxHeight: 40 }}
        selected={Boolean(anchorEl) || !isUndefined(column.getFilterValue())}
        onClick={(e) => setAnchorEl(e.currentTarget)}>
        <FilterListIcon />
      </ToggleButton>
      {isText && (
        <Tooltip title="Disable all filters except gem name search">
          <ToggleButton
            value="check"
            sx={{ maxWidth: 40, maxHeight: 40, ml: 1 }}
            selected={hideNonText}
            onClick={(e) => setHideNonTextFilters(!hideNonText)}>
            {hideNonText ? <FilterOffIcon /> : <FilterIcon />}
          </ToggleButton>
        </Tooltip>
      )}
      {!isUndefined(column.getFilterValue()) && (
        <IconButton
          sx={{ maxWidth: 40, maxHeight: 40, marginLeft: 1 }}
          onClick={() => column.setFilterValue(undefined)}>
          <ClearIcon />
        </IconButton>
      )}
      <Popover
        anchorEl={anchorEl}
        open={!!anchorEl}
        transitionDuration={0}
        onClose={() => setAnchorEl(undefined)}>
        <Box sx={{ m: 1 }}>
          <FilterMenu column={column} onClose={() => setAnchorEl(undefined)} />
        </Box>
      </Popover>
    </Box>
  ) : null;
};

const FilterMenu = <T extends {}>({
  column,
  onClose,
}: {
  column: Column<T, T[keyof T]>;
  onClose: () => void;
}) => {
  const key = column.id as Key;
  const { isMin, isMax, isBool, isFloat, isText, options } = column.columnDef.meta?.filter || {};
  const canFilter = column.columnDef.meta?.filter && column.getCanFilter();

  const currentValue = column.getFilterValue();
  const min = useDebouncedState((currentValue as number[])?.[0]);
  const max = useDebouncedState((currentValue as number[])?.[1]);
  const text = useDebouncedState(currentValue as string, 500);
  const [bool, setBool] = useState(
    isUndefined(currentValue) ? (key === "lowConfidence" ? false : undefined) : currentValue,
  );
  const [types, setTypes] = useState(currentValue as string[] | undefined);

  useEffect(() => {
    isMin && column.setFilterValue(() => (!canFilter ? undefined : [min.debounced, max.debounced]));
  }, [canFilter, min.debounced, max.debounced, column, isMin]);
  useEffect(() => {
    isBool && column.setFilterValue(() => (!canFilter ? undefined : bool));
  }, [canFilter, bool, column, isBool, key]);
  useEffect(() => {
    isText &&
      column.setFilterValue(() => (!canFilter || !text.debounced ? undefined : text.debounced));
  }, [canFilter, text.debounced, column, isText]);
  useEffect(() => {
    options && column.setFilterValue(() => (!canFilter ? undefined : types));
  }, [canFilter, types, column, options]);

  const [ref, setRef] = useState<HTMLInputElement>();
  useEffect(() => {
    ref !== document.activeElement && ref?.focus();
  }, [ref]);

  if (isMin) {
    return (
      <>
        <TextField
          inputRef={setRef}
          type="number"
          label="min"
          variant="outlined"
          value={min.value || ""}
          inputProps={{
            min: column.getFacetedMinMaxValues()?.[0],
            max: column.getFacetedMinMaxValues()?.[1],
          }}
          placeholder={`${column.getFacetedMinMaxValues()?.[0]}`}
          onChange={({ target }) =>
            min.set(
              target.value
                ? isFloat
                  ? parseFloat(target.value)
                  : parseInt(target.value)
                : undefined,
            )
          }
        />
        {isMax && (
          <TextField
            type="number"
            label="max"
            variant="outlined"
            value={max.value || ""}
            inputProps={{
              min: column.getFacetedMinMaxValues()?.[0],
              max: column.getFacetedMinMaxValues()?.[1],
            }}
            placeholder={`${column.getFacetedMinMaxValues()?.[1]}`}
            onChange={({ target }) =>
              max.set(
                target.value
                  ? isFloat
                    ? parseFloat(target.value)
                    : parseInt(target.value)
                  : undefined,
              )
            }
          />
        )}
      </>
    );
  }
  if (isBool) {
    return (
      <Checkbox
        checked={!!bool}
        indeterminate={bool === undefined}
        onChange={() => setBool(bool === true ? undefined : bool === false ? true : false)}
      />
    );
  }
  if (isText) {
    return (
      <TextField
        inputRef={setRef}
        type="text"
        label="search"
        variant="outlined"
        placeholder='"exact match" -exclude'
        value={text.value || ""}
        onChange={({ target }) => text.set(target.value)}
      />
    );
  }
  if (options) {
    return (
      <FormControl sx={{ width: 100 }}>
        <Select
          multiple
          defaultOpen
          displayEmpty
          renderValue={(value) =>
            value?.length ? (Array.isArray(value) ? value.join(", ") : value) : "All"
          }
          value={types || []}
          onClose={onClose}
          onChange={({ target: { value } }) =>
            setTypes(
              Array.isArray(value)
                ? value.length === 0
                  ? undefined
                  : value
                : value
                ? [value]
                : [],
            )
          }>
          {options.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  return null;
};

export default Filter;
