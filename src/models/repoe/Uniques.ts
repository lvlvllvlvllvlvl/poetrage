export interface Unique {
  base_item: string;
  base_item_id?: string;
  cannot_be_traded_or_modified: MediawikiBoolean;
  drop_enabled: MediawikiBoolean;
  is_account_bound: MediawikiBoolean;
  is_corrupted: MediawikiBoolean;
  is_drop_restricted: MediawikiBoolean;
  is_eater_of_worlds_item: MediawikiBoolean;
  is_fractured: MediawikiBoolean;
  is_in_game: MediawikiBoolean;
  is_relic: MediawikiBoolean;
  is_replica: MediawikiBoolean;
  is_searing_exarch_item: MediawikiBoolean;
  is_synthesised: MediawikiBoolean;
  is_unmodifiable: MediawikiBoolean;
  is_veiled: MediawikiBoolean;
  item_class: ItemClass;
  item_class_id: ItemClassID;
  name: string;
  name_list: string;
  page_name: string;
  release_version?: string;
  required_dexterity?: string;
  required_intelligence?: string;
  required_level: string;
  required_strength?: string;
  tags: string;
  drop_monsters?: string;
  drop_text?: string;
  drop_level?: string;
  acquisition_tags?: string;
  drop_areas?: string;
  removal_version?: string;
  influences?: string;
}

export type MediawikiBoolean = "0" | "1";

export type ItemClass =
  | "Abyss Jewel"
  | "Amulet"
  | "Belt"
  | "Body Armour"
  | "Boots"
  | "Bow"
  | "Claw"
  | "Contract"
  | "Dagger"
  | "Fishing Rod"
  | "Gloves"
  | "Helmet"
  | "Hybrid Flask"
  | "Item Piece"
  | "Jewel"
  | "Life Flask"
  | "Mana Flask"
  | "Map"
  | "One-Handed Axe"
  | "One-Handed Mace"
  | "One-Handed Sword"
  | "Quiver"
  | "Relic"
  | "Ring"
  | "Rune Dagger"
  | "Sceptre"
  | "Sentinel"
  | "Shield"
  | "Staff"
  | "Thrusting One-Handed Sword"
  | "Two-Handed Axe"
  | "Two-Handed Mace"
  | "Two-Handed Sword"
  | "Utility Flask"
  | "Wand"
  | "Warstaff"
  | "Watchstone";

export type ItemClassID =
  | "AbyssJewel"
  | "Amulet"
  | "AtlasRegionUpgradeItem"
  | "Belt"
  | "Body Armour"
  | "Boots"
  | "Bow"
  | "Claw"
  | "Dagger"
  | "FishingRod"
  | "Gloves"
  | "HeistContract"
  | "Helmet"
  | "HybridFlask"
  | "Jewel"
  | "LifeFlask"
  | "ManaFlask"
  | "Map"
  | "One Hand Axe"
  | "One Hand Mace"
  | "One Hand Sword"
  | "Quiver"
  | "Relic"
  | "Ring"
  | "Rune Dagger"
  | "Sceptre"
  | "SentinelDrone"
  | "Shield"
  | "Staff"
  | "Thrusting One Hand Sword"
  | "Two Hand Axe"
  | "Two Hand Mace"
  | "Two Hand Sword"
  | "UniqueFragment"
  | "UtilityFlask"
  | "Wand"
  | "Warstaff";
