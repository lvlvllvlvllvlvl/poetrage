export type Language = "br" | "ru" | "th" | "de" | "fr" | "es" | "ko-KR";

export interface Item extends ItemBase {
  inventoryId?: InventoryId | string;
  x?: number;
  y?: number;
  sockets?: Socket[];
  properties?: Property[];
  flavourText?: string[];
  craftedMods?: string[];
  enchantMods?: string[];
  itemLevel?: number;
  prophecyText?: string;
  utilityMods?: string[];
  artFilename?: string;
  note?: string;
  talismanTier?: number;
  influences?: Influences;
  elder?: boolean;
  shaper?: boolean;
  incubatedItem?: IncubatedItem;
  delve?: boolean;
  veiledMods?: string[];
  veiled?: boolean;
  duplicated?: boolean;
  isRelic?: boolean;
  cosmeticMods?: string[];
  stackSizeText?: string;
  replica?: boolean;
  cisRaceReward?: boolean;
  socketedItems?: SocketedItem[];
}
export type InventoryId =
  | "Helm"
  | "Weapon"
  | "Weapon2"
  | "Offhand"
  | "Offhand2"
  | "Amulet"
  | "Ring"
  | "Ring2"
  | "BodyArmour"
  | "Gloves"
  | "Belt"
  | "Boots"
  | "Flask"
  | "MainInventory"
  | "Trinket"
  | "PassiveJewels";

export interface Socket {
  group: number;
  attr?: Attribute;
  sColour?: SocketColour;
}
export declare const ATTRIBUTE_VALUES: readonly ["A", "D", "DV", "G", "I", "S"];
export declare type Attribute = (typeof ATTRIBUTE_VALUES)[number];
export declare const SOCKET_COLOUR_VALUES: readonly ["A", "B", "DV", "G", "R", "W"];
export declare type SocketColour = (typeof SOCKET_COLOUR_VALUES)[number];
export declare const COLOUR_VALUES: readonly ["S", "D", "I", "G"];
export declare type ItemColour = (typeof COLOUR_VALUES)[number];
export interface Property {
  name: string;
  values: Array<Array<number | string>>;
  displayMode: number;
  type?: number;
  suffix?: string;
}
export interface Influences {
  elder?: boolean;
  shaper?: boolean;
  hunter?: boolean;
  redeemer?: boolean;
  warlord?: boolean;
  crusader?: boolean;
}
export interface IncubatedItem {
  name: string;
  level: number;
  progress: number;
  total: number;
}
export interface SocketedItem extends ItemBase {
  properties: Property[];
  socket: number;
  colour: ItemColour | null;
  support?: boolean;
  descrText: string;
  secDescrText: string;
  explicitMods: string[];
  requirements: Property[];
}

export interface ItemBase {
  verified: boolean;
  w: number;
  h: number;
  icon: string;
  name: string;
  typeLine: string;
  baseType: string;
  identified: boolean;
  ilvl: number;
  frameType: number;
  league?: string;
  id?: string;
  stackSize?: number;
  maxStackSize?: number;
  forum_note?: string;
  searing?: boolean;
  tangled?: boolean;
  abyssJewel?: boolean;
  fractured?: boolean;
  synthesised?: boolean;
  lockedToCharacter?: boolean;
  lockedToAccount?: boolean;
  split?: boolean;
  corrupted?: boolean;
  unmodifiable?: boolean;
  cisRaseReward?: boolean;
  seaRaceReward?: boolean;
  thRaceReward?: boolean;
  notableProperties?: Property[];
  requirements?: Property[];
  additionalProperties?: AdditionalProperty[];
  nextLevelRequirements?: Property[];
  descrText?: string;
  secDescrText?: string;
  logbookMods?: LogbookMod[];
  implicitMods?: string[];
  ultimatumMods?: UltimatumMod[];
  explicitMods?: string[];
  fracturedMods?: string[];
  flavourTextParsed?: string;
  hybrid?: Hybrid;
  extended?: Extended;
  scourged?: Scourged;
  scourgeMods?: string[];
}
export interface AdditionalProperty extends Property {
  progress?: number;
}
export interface LogbookMod {
  name: string;
  faction: LogbookFaction;
  mods: string[];
}
export type LogbookFactionId = "Faction1" | "Faction2" | "Faction3" | "Faction4";

export interface LogbookFaction {
  id: LogbookFactionId;
  name: string;
}
export interface UltimatumMod {
  type: string;
  tier: number;
}
export interface Hybrid {
  baseTypeName: string;
  isVaalGem?: boolean;
  properties?: Property[];
  explicitMods?: string[];
  secDescrText?: string;
}
export interface Extended {
  category?: string;
  subcategories?: string[];
  prefixes?: number;
  suffixes?: number;
  text?: string;
  mods?: Mods;
  base_defence_percentile?: number;
  ar?: number;
  ar_aug?: boolean;
  ev?: number;
  ev_aug?: boolean;
  es?: number;
  es_aug?: boolean;
  hashes: ModHashes;
}
export interface Mods {
  explicit: Mod[];
  implicit?: Mod[];
}
export interface Mod {
  name: string;
  tier: string;
  level: number;
  magnitudes: Magnitude[];
}
export interface Magnitude {
  hash: string;
  min: number;
  max: number;
}
export interface ModHashes {
  explicit: Array<[string, Array<number>]>;
  implicit?: Array<[string, Array<number>]>;
}
declare const SCOURGE_ITEM_TIERS: readonly [1, 2, 3];
declare const SCOURGE_MAP_TIERS: readonly [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export declare type ScourgeTierItem = (typeof SCOURGE_ITEM_TIERS)[number];
export declare type ScourgeTierMap = (typeof SCOURGE_MAP_TIERS)[number];
export interface Scourged {
  tier: ScourgeTierItem | ScourgeTierMap;
  level?: number;
  progress?: number;
  total?: number;
}
