import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import { GemInfo } from "apis/getGemInfo";
import { getPrice } from "apis/getPrices";
import { GemDetails, Override, getQuery, isEqual } from "models/gems";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { actions } from "state/app";
import { EditGem } from "./EditGem";

const clean = <T extends {}>(obj: T) => {
  Object.keys(obj).forEach(
    (key) => obj[key as keyof T] === undefined && delete obj[key as keyof T]
  );
  return obj;
};

export const EditOverride = ({
  original,
  override,
  gemInfo,
  currencyMap,
  league,
}: {
  original: GemDetails;
  override?: Override;
  gemInfo?: GemInfo;
  currencyMap?: { [key: string]: number };
  league?: string;
}) => {
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const [dialog, setDialog] = useState(false);
  const [custom, setCustom] = useState<GemDetails & { isOverride: true }>({
    ...original,
    isOverride: true,
  });
  const [searchType, setSearchType] = useState<"" | "cheapest" | "online" | "daily">("");
  const input = useRef();
  const overrideValue = override?.override?.Price;
  const setOverride = (o: Override) => dispatch(actions.setOverride(o));
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const fetchPrice = async (type: "cheapest" | "online" | "daily", custom?: GemDetails) => {
    if (!league || !currencyMap) return;
    setError(false);
    setLoading(true);
    try {
      const query = getQuery(
        custom || original,
        type !== "daily",
        type === "daily" ? "1day" : undefined
      );
      const { price } = await getPrice(
        league,
        currencyMap,
        query,
        type === "cheapest" ? "cheapest" : "average"
      );
      setOverride(
        custom
          ? {
              original: isEqual(custom, original) ? original : undefined,
              override: { ...custom, Price: price, isOverride: true },
            }
          : {
              original,
              override: clean({
                ...(override?.override || {}),
                Price: price,
                lowConfidence: false,
                isOverride: true,
              }),
            }
      );
    } catch (e) {
      setError(true);
      console.error(e);
    }
    setLoading(false);
  };

  const closeDialog = (fetch?: boolean) => () => {
    setDialog(false);
    setAnchorEl(undefined);
    if (fetch && searchType) {
      fetchPrice(searchType, custom);
    } else if (fetch) {
      setOverride({
        original: isEqual(custom, original) ? original : undefined,
        override: custom,
      });
    }
  };

  return (
    <div
      ref={setRef}
      style={{
        display: "flex",
        alignItems: "center",
      }}>
      <div
        style={{ width: ref ? ref.clientWidth - 40 : 120, height: 16 }}
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
                  lowConfidence: false,
                  isOverride: true,
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
        <MenuItem onClick={() => setDialog(true)}>Custom</MenuItem>
      </Menu>
      <Dialog open={dialog} onClose={closeDialog()}>
        <DialogTitle>
          {isEqual(custom, original) ? "Edit gem details" : "Add custom gem"}
        </DialogTitle>
        <DialogContent>
          <EditGem
            gem={custom}
            onChange={(g) => setCustom({ ...g, isOverride: true })}
            gemInfo={gemInfo}
          />
          <FormLabel id="search-type">Price search</FormLabel>
          <RadioGroup
            row
            aria-labelledby="search-type"
            value={searchType}
            name="radio-buttons-group"
            onChange={(e) => setSearchType(e.target.value as any)}>
            <FormControlLabel value="cheapest" control={<Radio />} label="Cheapest online" />
            <FormControlLabel value="average" control={<Radio />} label="Average online" />
            <FormControlLabel value="daily" control={<Radio />} label="Average last day" />
            <FormControlLabel value="" control={<Radio />} label="Don't search" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog()}>Cancel</Button>
          <Button onClick={closeDialog(true)}>{searchType ? "Search" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
