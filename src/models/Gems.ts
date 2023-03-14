import { SearchQueryContainer } from "models/poe/Search";

export type ConversionData = { gem: Gem; chance: number; outcomes: string[] };
export const gemTypes = ["Superior", "Anomalous", "Divergent", "Phantasmal", "Awakened"] as const;
export const altQualities = ["Anomalous", "Divergent", "Phantasmal"] as const;
export const modifiers = ["Anomalous ", "Divergent ", "Phantasmal ", "Vaal "];
export const exceptional = ["Enlighten", "Empower", "Enhance"];
export type GemType = typeof gemTypes[number];

export const mavenExclusive = [
  "Awakened Ancestral Call Support",
  "Awakened Cast On Critical Strike Support",
  "Awakened Spell Echo Support",
  "Awakened Unleash Support",
  "Awakened Hextouch Support",
  "Awakened Spell Cascade Support",
  "Awakened Blasphemy Support",
  "Awakened Chain Support",
  "Awakened Increased Area of Effect Support",
  "Awakened Arrow Nova Support",
  "Awakened Fork Support",
  "Awakened Generosity Support",
  "Awakened Greater Multiple Projectiles Support",
  "Awakened Multistrike Support",
  "Awakened Cast While Channelling Support",
];

export const mavenCrucible = [
  "Awakened Elemental Damage with Attacks Support",
  "Awakened Cold Penetration Support",
  "Awakened Deadly Ailments Support",
  "Awakened Melee Physical Damage Support",
  "Awakened Minion Damage Support",
  "Awakened Vicious Projectiles Support",
  "Awakened Void Manipulation Support",
  "Awakened Added Chaos Damage Support",
  "Awakened Controlled Destruction Support",
  "Awakened Added Cold Damage Support",
  "Awakened Lightning Penetration Support",
  "Awakened Swift Affliction Support",
  "Awakened Brutality Support",
  "Awakened Burning Damage Support",
  "Awakened Melee Splash Support",
  "Awakened Fire Penetration Support",
  "Awakened Added Lightning Damage Support",
  "Awakened Elemental Focus Support",
  "Awakened Unbound Ailments Support",
  "Awakened Added Fire Damage Support",
];

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
  levelValue: number;
  levelData?: (Gem & {
    levelValue: number;
    levelDiff: number;
    gcpCount: number;
    gcpCost: number;
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
  convertValue?: number;
};

export type Override = { original: Gem; override: Partial<GemDetails> };

const getRatio = (name: string, profit: number, cost: number) => ({
  name,
  cost,
  profit,
  ratio: profit / cost,
});

export const getRatios = (
  gem: GemDetails,
  currencyMap: (key: string) => number,
  templeValue: number,
  levelValue: number,
  convertValue: number
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
              (currencyMap(
                gem.Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
              ) || 0),
            gem.Price +
              (currencyMap(
                gem.Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
              ) || 0)
          )
        : undefined,
      gem.vaalValue !== undefined
        ? getRatio("Vaal orb", gem.vaalValue, gem.Price + currencyMap("Vaal Orb"))
        : undefined,
      gem.templeValue !== undefined
        ? getRatio("Temple", gem.templeValue - templeValue, gem.Price + templeValue)
        : undefined,
      gem.levelData?.length
        ? getRatio(
            "Wild Brambleback",
            (gem.levelData[0].levelValue - levelValue) * gem.levelData[0].levelDiff,
            gem.Price + gem.levelData[0].gcpCost + gem.levelData[0].levelDiff * levelValue
          )
        : undefined,
      gem.convertValue !== undefined
        ? getRatio("Vivid Watcher", gem.convertValue - convertValue, gem.Price + convertValue)
        : undefined,
    ] as { name: string; profit: number; cost: number; ratio: number }[]
  )
    .filter(exists)
    .sort(({ ratio: a }, { ratio: b }) => b - a);

export const exists = (v: any) => v !== undefined;
export const copy = <T extends Gem | GemDetails>(base: T, overrides: Partial<T> = {}): T => ({
  ...base,
  Name:
    (altQualities.includes(overrides.Type || (base.Type as any))
      ? (overrides.Type || base.Type) + " "
      : "") +
    (overrides.Vaal || base.Vaal ? "Vaal " : "") +
    base.baseName,
  ...overrides,
});

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
    (other.Quality <= gem.Quality || !!exceptional.find((e) => gem.Name.includes(e)))
  );
};

export const strictlyBetter = (gem: Gem, other: Gem) => {
  return betterOrEqual(gem, other) && !betterOrEqual(other, gem);
};
export const bestMatch = (gem: Gem, data?: Gem[], lowConfidence: boolean = false) =>
  data?.find((other) => (lowConfidence || !other.lowConfidence) && betterOrEqual(gem, other)) ||
  gem;
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
export const isEqual = (a: Gem, b: Gem) => {
  return (
    a.baseName === b.baseName &&
    a.Type === b.Type &&
    a.Level === b.Level &&
    a.Quality === b.Quality &&
    a.Corrupted === b.Corrupted &&
    a.Vaal === b.Vaal
  );
};

export const vaal = (gem: Gem, chance: number = 1, outcomes: string[] = []) =>
  [
    {
      gem: copy(gem, { Corrupted: true }),
      chance: outcomes.length === 1 ? (outcomes[0] === "No effect" ? 0 : chance / 3) : chance / 4,
      outcomes: [...outcomes, "No effect"],
    },
    {
      gem: gem.canVaal
        ? copy(gem, {
            Corrupted: true,
            Vaal: true,
          })
        : copy(gem, { Corrupted: true }),
      chance: outcomes.length === 1 ? (outcomes[0].includes("Vaal") ? 0 : chance / 3) : chance / 4,
      outcomes: [...outcomes, gem.canVaal ? "Vaal" : "Vaal (no outcome)"],
    },
    {
      gem: copy(gem, { Corrupted: true, Level: gem.Level + 1 }),
      chance: outcomes.length === 1 ? (outcomes[0].includes("level") ? 0 : chance / 6) : chance / 8,
      outcomes: [...outcomes, "Add level"],
    },
    {
      gem: copy(gem, { Corrupted: true, Level: gem.Level - 1 }),
      chance: outcomes.length === 1 ? (outcomes[0].includes("level") ? 0 : chance / 6) : chance / 8,
      outcomes: [...outcomes, "Remove level"],
    },
    ...Array.from(Array(20).keys()).map((i) => ({
      gem: copy(gem, {
        Corrupted: true,
        Quality: Math.min(gem.Quality + 20 - i, 23),
      }),
      chance:
        (outcomes.length === 1 ? (outcomes[0].includes("quality") ? 0 : chance / 6) : chance / 8) /
        20,
      outcomes: [...outcomes, "Add quality"],
    })),
    ...Array.from(Array(20).keys()).map((i) => ({
      gem: copy(gem, {
        Corrupted: true,
        Quality: Math.max(gem.Quality - i - 1, 0),
      }),
      chance:
        (outcomes.length === 1 ? (outcomes[0].includes("quality") ? 0 : chance / 6) : chance / 8) /
        20,
      outcomes: [...outcomes, "Remove quality"],
    })),
  ]
    .filter(exists)
    .filter((v) => v?.chance && v.chance > 0) as ConversionData[];

export const getQuery = (gem: Gem): SearchQueryContainer => ({
  query: {
    status: {
      option: "onlineleague",
    },
    filters: {
      misc_filters: {
        filters: {
          gem_level: { min: gem.Level },
          corrupted: { option: gem.Corrupted },
          quality: { min: gem.Quality },
          gem_alternate_quality: altQualities.includes(gem.Type as any)
            ? { option: `${altQualities.indexOf(gem.Type as any) + 1}` }
            : undefined,
        },
      },
    },
    type: gem.Vaal ? "Vaal " + gem.baseName : gem.baseName,
  },
  sort: { price: "asc" },
});
