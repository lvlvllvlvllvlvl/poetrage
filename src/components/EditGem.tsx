import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GemInfo } from "apis/getGemQuality";
import { GemDetails, GemType, normalize } from "models/Gems";

export const EditGem = ({
  gem,
  onChange,
  gemInfo,
}: {
  gem: GemDetails;
  onChange: (gem: GemDetails) => void;
  gemInfo: GemInfo;
}) => {
  const awakened = gem.Name.includes("Awakened");
  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        {gem.Name}
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          type="number"
          label="Level"
          variant="outlined"
          value={gem.Level}
          sx={{ m: 1, width: "25ch" }}
          onChange={(e) =>
            e.currentTarget.value && onChange({ ...gem, Level: parseInt(e.currentTarget.value) })
          }
        />
        <TextField
          type="number"
          label="Quality"
          variant="outlined"
          value={gem.Quality}
          sx={{ m: 1, width: "25ch" }}
          onChange={({ target }) =>
            target.value && onChange({ ...gem, Quality: parseInt(target.value) })
          }
        />
        <TextField
          select
          label="Type"
          variant="outlined"
          value={awakened ? "Awakened" : gem.Type}
          disabled={awakened}
          sx={{ m: 1, width: "25ch" }}
          onChange={({ target }) => onChange(normalize({ ...gem, Type: target.value as GemType }))}>
          {awakened ? (
            <MenuItem value="Awakened">Awakened</MenuItem>
          ) : (
            gemInfo.weights[gem.baseName].map(({ Type }) => (
              <MenuItem key={Type} value={Type}>
                {Type}
              </MenuItem>
            ))
          )}
        </TextField>
        <TextField
          type="number"
          label="Price"
          variant="outlined"
          value={gem.Price}
          sx={{ m: 1, width: "25ch" }}
          onChange={({ target }) =>
            target.value && onChange({ ...gem, Price: parseInt(target.value) })
          }
        />
        <FormControlLabel
          label="Corrupted"
          control={
            <Checkbox
              checked={gem.Corrupted}
              onChange={({ target }) => onChange(normalize({ ...gem, Corrupted: target.checked }))}
            />
          }
        />
        {gem.Corrupted && gem.canVaal && (
          <FormControlLabel
            label="Vaal"
            control={
              <Checkbox
                checked={gem.Vaal}
                onChange={({ target }) => onChange(normalize({ ...gem, Vaal: target.checked }))}
              />
            }
          />
        )}
        <FormControlLabel
          label="Low confidence"
          control={
            <Checkbox
              checked={gem.lowConfidence}
              onChange={({ target }) => onChange({ ...gem, lowConfidence: target.checked })}
            />
          }
        />
      </Box>
    </>
  );
};
