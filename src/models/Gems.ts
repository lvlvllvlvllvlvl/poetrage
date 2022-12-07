export type VaalData = { gem: Gem; chance: number; outcomes: string[] };
export const gemTypes = ["Anomalous", "Divergent", "Phantasmal", "Awakened", "Superior"] as const;
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
  vaalValue?: number;
  vaalData?: VaalData[];
  templeValue?: number;
  templeData?: VaalData[];
};

export const exists = (v: any) => v !== undefined;
export const copy = (
  {
    baseName,
    variant,
    Name,
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
  Name,
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
        ? copy(gem, { Corrupted: true, Vaal: true, Name: "Vaal " + gem.Name })
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
    .filter((v) => v?.chance && v.chance > 0) as VaalData[];
