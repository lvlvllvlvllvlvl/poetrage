export interface BaseItem {
  domain: Domain;
  drop_level: number;
  implicits: string[];
  inventory_height: number;
  inventory_width: number;
  item_class: ItemClass;
  name: string;
  properties: Properties;
  release_state: ReleaseState;
  requirements: Requirements | null;
  tags: string[];
  visual_identity: VisualIdentity;
  grants_buff?: GrantsBuff;
}

export type Domain =
  | "abyss_jewel"
  | "affliction_jewel"
  | "area"
  | "flask"
  | "heist_area"
  | "heist_npc"
  | "item"
  | "map_device"
  | "memory_lines"
  | "misc"
  | "sanctum_relic"
  | "sentinel"
  | "templar_relic"
  | "undefined"
  | "watchstone";

export interface GrantsBuff {
  id: string;
  stats: { [key: string]: number };
}

export type ItemClass =
  | "AbyssJewel"
  | "Active Skill Gem"
  | "Amulet"
  | "AtlasUpgradeItem"
  | "Belt"
  | "Body Armour"
  | "Boots"
  | "Bow"
  | "Claw"
  | "Currency"
  | "Dagger"
  | "DelveSocketableCurrency"
  | "DelveStackableSocketableCurrency"
  | "DivinationCard"
  | "ExpeditionLogbook"
  | "FishingRod"
  | "Gloves"
  | "HeistBlueprint"
  | "HeistContract"
  | "HeistEquipmentReward"
  | "HeistEquipmentTool"
  | "HeistEquipmentUtility"
  | "HeistEquipmentWeapon"
  | "Helmet"
  | "HybridFlask"
  | "IncubatorStackable"
  | "Jewel"
  | "LifeFlask"
  | "ManaFlask"
  | "Map"
  | "MapFragment"
  | "MemoryLine"
  | "One Hand Axe"
  | "One Hand Mace"
  | "One Hand Sword"
  | "QuestItem"
  | "Quiver"
  | "Relic"
  | "Ring"
  | "Rune Dagger"
  | "SanctumSpecialRelic"
  | "Sceptre"
  | "SentinelDrone"
  | "Shield"
  | "StackableCurrency"
  | "Staff"
  | "Support Skill Gem"
  | "Thrusting One Hand Sword"
  | "Two Hand Axe"
  | "Two Hand Mace"
  | "Two Hand Sword"
  | "UtilityFlask"
  | "Wand"
  | "Warstaff";

export interface Properties {
  armour?: Armour;
  energy_shield?: Armour;
  evasion?: Armour;
  movement_speed?: number;
  block?: number;
  description?: string;
  directions?: string;
  stack_size?: number;
  stack_size_currency_tab?: number;
  full_stack_turns_into?: string;
  charges_max?: number;
  charges_per_use?: number;
  duration?: number;
  life_per_use?: number;
  mana_per_use?: number;
  attack_time?: number;
  critical_strike_chance?: number;
  physical_damage_max?: number;
  physical_damage_min?: number;
  range?: number;
}

export interface Armour {
  max: number;
  min: number;
}

export type ReleaseState = "legacy" | "released" | "unique_only" | "unreleased";

export interface Requirements {
  dexterity: number;
  intelligence: number;
  level: number;
  strength: number;
}

export interface VisualIdentity {
  dds_file: string;
  id: string;
}
