export type ConversionData = { gem: Gem; chance: number; outcomes: string[] };
export const gemTypes = ["Superior", "Anomalous", "Divergent", "Phantasmal", "Awakened"] as const;
export type GemType = typeof gemTypes[number];

export type Gem = {
  baseName: string;
  variant: string;
  Name: string;
  Level: number;
  Quality: number;
  Type: GemType;
  Corrupted: boolean;
  Vaal: boolean;
  canVaal?: boolean;
  Price: number;
  Meta: number;
  XP?: number;
  Listings: number;
  lowConfidence: boolean;
};

export type GemDetails = Gem & {
  xpValue: number;
  xpData?: (Gem & {
    xpValue: number;
    xpDiff: number;
    gcpCount: number;
    gcpCost: number;
    reset?: boolean;
  })[];
  gcpValue: number;
  gcpData?: (Gem & {
    gcpValue: number;
    gcpCount: number;
    gcpCost: number;
  })[];
  regrValue?: number;
  regrData?: ConversionData[];
  vaalValue?: number;
  vaalData?: ConversionData[];
  templeValue?: number;
  templeData?: ConversionData[];
};

const getRatio = (name: string, profit: number, cost: number) => ({
  name,
  cost,
  profit,
  ratio: profit / cost,
});

export const getRatios = (
  gem: GemDetails,
  currencyMap: {
    [key: string]: number;
  },
  templeValue: number
) =>
  (
    [
      gem.gcpData?.length
        ? getRatio("GCP", gem.gcpData[0].gcpValue, gem.Price + gem.gcpData[0].gcpCost)
        : undefined,
      gem.regrValue !== undefined
        ? getRatio(
            "Regrading lens",
            (gem.regrValue || 0) -
              (currencyMap[
                gem.Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
              ] || 0),
            gem.Price +
              (currencyMap[
                gem.Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
              ] || 0)
          )
        : undefined,
      gem.vaalValue !== undefined
        ? getRatio("Vaal orb", gem.vaalValue, gem.Price + currencyMap["Vaal Orb"])
        : undefined,
      gem.templeValue !== undefined
        ? getRatio("Temple", gem.templeValue, gem.Price + templeValue)
        : undefined,
    ] as { name: string; profit: number; cost: number; ratio: number }[]
  )
    .filter(exists)
    .sort(({ ratio: a }, { ratio: b }) => b - a);

export const exists = (v: any) => v !== undefined;
export const copy = (
  {
    baseName,
    variant,
    Level,
    Quality,
    Type,
    Corrupted,
    Vaal,
    canVaal,
    Price,
    Meta,
    XP,
    Listings,
    lowConfidence,
  }: Gem,
  overrides: Partial<Gem> = {}
): Gem => ({
  baseName,
  variant,
  Name: (altQualities.includes(Type as any) ? "" : Type + " ") + (Vaal ? "Vaal " : "") + baseName,
  Level,
  Quality,
  Type,
  Corrupted,
  Vaal,
  canVaal,
  Price,
  Meta,
  XP,
  Listings,
  lowConfidence,
  ...overrides,
});
export const altQualities = ["Anomalous", "Divergent", "Phantasmal"] as const;
export const modifiers = ["Anomalous ", "Divergent ", "Phantasmal ", "Vaal "];
export const exceptional = ["Enlighten", "Empower", "Enhance"];

export const getType = (name: string) => {
  for (const q of altQualities) {
    if (name.includes(q)) return q;
  }
  if (name.includes("Awakened")) {
    return "Awakened";
  } else {
    return "Superior";
  }
};

export const betterOrEqual = (gem: Gem, other: Gem) => {
  if (other.baseName !== gem.baseName || other.Type !== gem.Type) {
    console.debug("mismatched gem comparison", gem, other);
  }
  return (
    (gem.Vaal || !other.Vaal) &&
    (other.Corrupted || !gem.Corrupted) &&
    other.Level <= gem.Level &&
    (other.Quality <= gem.Quality || exceptional.find((e) => gem.Name.includes(e)))
  );
};
export const bestMatch = (gem: Gem, data: Gem[], lowConfidence: boolean = false) =>
  data.find((other) => (lowConfidence || !other.lowConfidence) && betterOrEqual(gem, other)) || gem;
export const compareGem = (a: Gem, b: Gem) => {
  if (a.baseName !== b.baseName || a.Type !== b.Type) {
    console.debug("mismatched gem comparison", a, b);
  }
  if (a.Level !== b.Level) {
    return b.Level - a.Level;
  } else if (a.Vaal !== b.Vaal) {
    return b.Vaal ? 1 : -1;
  } else if (a.Quality !== b.Quality) {
    return b.Quality - a.Quality;
  } else if (a.Corrupted !== b.Corrupted) {
    return b.Corrupted ? -1 : 1;
  } else {
    return b.Price - a.Price;
  }
};

export const vaal = (gem: Gem, chance: number = 1, outcomes: string[] = []) =>
  [
    {
      gem: copy(gem, { Corrupted: true }),
      chance: chance * 0.25,
      outcomes: [...outcomes, "No effect"],
    },
    {
      gem: gem.canVaal
        ? copy(gem, {
            Corrupted: true,
            Vaal: true,
          })
        : copy(gem, { Corrupted: true }),
      chance: chance * 0.25,
      outcomes: [...outcomes, gem.canVaal ? "Vaal" : "Vaal (no outcome)"],
    },
    {
      gem: copy(gem, { Corrupted: true, Level: gem.Level + 1 }),
      chance: chance * 0.125,
      outcomes: [...outcomes, "Add level"],
    },
    {
      gem: copy(gem, { Corrupted: true, Level: gem.Level - 1 }),
      chance: chance * 0.125,
      outcomes: [...outcomes, "Remove level"],
    },
    ...Array.from(Array(20).keys()).map((i) => ({
      gem: copy(gem, {
        Corrupted: true,
        Quality: Math.min(gem.Quality + 20 - i, 23),
      }),
      chance: (chance * 0.125) / 20,
      outcomes: [...outcomes, "Add quality"],
    })),
    ...Array.from(Array(20).keys()).map((i) => ({
      gem: copy(gem, {
        Corrupted: true,
        Quality: Math.max(gem.Quality - i - 1, 0),
      }),
      chance: (chance * 0.125) / 20,
      outcomes: [...outcomes, "Remove quality"],
    })),
  ]
    .filter(exists)
    .filter((v) => v?.chance && v.chance > 0) as ConversionData[];
