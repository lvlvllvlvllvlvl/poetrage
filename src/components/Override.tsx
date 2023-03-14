import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { getPrice } from "apis/getPrices";
import { GemDetails, getQuery, Override } from "models/Gems";
import { useRef, useState } from "react";
import ErrorIcon from "@mui/icons-material/Error";

const clean = (obj: Partial<GemDetails>) => {
  Object.keys(obj).forEach(
    (key) => obj[key as keyof GemDetails] === undefined && delete obj[key as keyof GemDetails]
  );
  return obj;
};

export const EditOverride = ({
  original,
  override,
  setOverride,
  currencyMap,
  league,
  width = 50,
  height = 16,
}: {
  original: GemDetails;
  override?: Override;
  setOverride: (o: Override) => void;
  currencyMap?: (key: string) => number;
  league?: string;
  width?: number;
  height?: number;
}) => {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const input = useRef();
  const overrideValue = override?.override?.Price;
  const fetchPrice = async (type: "cheapest" | "online" | "daily") => {
    if (!league || !currencyMap) return;
    setError(false);
    setLoading(true);
    try {
      const query = getQuery(original, type !== "daily", type === "daily" ? "1day" : undefined);
      const { price } = await getPrice(
        league,
        currencyMap,
        query,
        type === "cheapest" ? "cheapest" : "average"
      );
      setOverride({
        original,
        override: clean({
          ...(override?.override || {}),
          Price: price,
        }),
      });
    } catch (e) {
      setError(true);
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}>
      <div
        style={{ width, height }}
        onMouseEnter={() => setEdit(true)}
        onMouseLeave={() => input.current !== document.activeElement && setEdit(false)}>
        {edit || overrideValue ? (
          <TextField
            variant="standard"
            size="small"
            inputRef={input}
            InputProps={{ endAdornment: "c" }}
            onBlur={(e) => {
              setOverride({
                original,
                override: clean({
                  ...(override?.override || {}),
                  Price: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined,
                }),
              });

              setEdit(false);
            }}
            defaultValue={overrideValue}
          />
        ) : (
          <>{original.Price}c</>
        )}
      </div>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        {error ? <ErrorIcon /> : loading ? <CircularProgress size={24} /> : <RefreshIcon />}
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
        <MenuItem onClick={() => fetchPrice("cheapest")}>Cheapest online</MenuItem>
        <MenuItem onClick={() => fetchPrice("online")}>Average online</MenuItem>
        <MenuItem onClick={() => fetchPrice("daily")}>Average last day</MenuItem>
      </Menu>
    </div>
  );
};
