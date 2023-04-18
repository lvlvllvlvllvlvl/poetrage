export const getCurrency = (currency: string, map?: { [key: string]: number }, fallback = 1) => {
  return (
    map?.[currency] ||
    map?.[
      Object.keys(map)
        .filter((k) => k.toLowerCase().includes(currency))
        .reduce((a, b) => (!a ? b : !b ? a : a.length <= b.length ? a : b), "") || ""
    ] ||
    fallback
  );
};
