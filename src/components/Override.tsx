import { GemDetails, Override } from "models/Gems";
import React, { useRef, useState } from "react";
import TextField from "@mui/material/TextField";

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
  strField,
  numField,
  endAdornment,
  width = 50,
  height = 16,
}: {
  original: GemDetails;
  override?: Override;
  setOverride: (o: Override) => void;
  strField?: {
    [K in keyof GemDetails]: GemDetails[K] extends string ? K : never;
  }[keyof GemDetails];
  numField?: {
    [K in keyof GemDetails]: GemDetails[K] extends number ? K : never;
  }[keyof GemDetails];
  endAdornment?: string;
  width?: number;
  height?: number;
}) => {
  const [edit, setEdit] = useState(false);
  const input = useRef();
  const overrideValue = strField
    ? override?.override?.[strField]
    : numField
    ? override?.override?.[numField]
    : "";
  return (
    <div
      style={{ width, height }}
      onMouseEnter={() => setEdit(true)}
      onMouseLeave={() => input.current !== document.activeElement && setEdit(false)}>
      {edit || overrideValue ? (
        <TextField
          variant="standard"
          size="small"
          inputRef={input}
          InputProps={{ endAdornment }}
          onBlur={(e) => {
            if (
              strField &&
              (e.currentTarget.value || undefined) !== override?.override?.[strField]
            ) {
              setOverride({
                original,
                override: clean({
                  ...(override?.override || {}),
                  [strField]: e.currentTarget.value || undefined,
                }),
              });
            } else if (
              numField &&
              (e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined) !==
                override?.override?.[numField]
            ) {
              setOverride({
                original,
                override: clean({
                  ...(override?.override || {}),
                  [numField]: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined,
                }),
              });
            }
            setEdit(false);
          }}
          defaultValue={overrideValue}
        />
      ) : (
        <>
          {strField ? original[strField] : numField ? original[numField] : ""}
          {endAdornment}
        </>
      )}
    </div>
  );
};
