export interface Builds {
  classNames: string[];
  classes: number[];
  uniqueItems: UniqueItem[];
  uniqueItemUse: { [key: string]: number[] };
  activeSkills: ActiveSkill[];
  activeSkillUse: { [key: string]: number[] };
  allSkills: AllSkill[];
  allSkillUse: { [key: string]: number[] };
  keystones: Keystone[];
  keystoneUse: { [key: string]: number[] };
  levels: number[];
  life: number[];
  energyShield: number[];
  weaponConfigurationTypeUse: number[];
  weaponConfigurationTypes: Mastery[];
  names: string[];
  accounts: string[];
  ladderRanks: Array<number | null>;
  updatedUtc: Date;
  skillModes: Mastery[];
  skillModeUse: { [key: string]: number[] };
  skillDetails: SkillDetail[];
  delveSolo: number[];
  language: Language;
  intervals: any[];
  intervalNames: any[];
  leagues: any[];
  leagueNames: any[];
  twitchAccounts: any[];
  twitchNames: any[];
  online: any[];
  uniqueItemTooltips: boolean[];
  keystoneTooltips: boolean[];
  masteries: Mastery[];
  masteryUse: { [key: string]: number[] };
}

export interface ActiveSkill {
  name: string;
  icon: string;
  dpsName: string;
}

export interface AllSkill {
  name: string;
  icon?: string;
}

export interface Keystone {
  name: string;
  icon?: string;
  isKeystone: boolean;
  type: KeystoneType;
}

export type KeystoneType = "Ascendency" | "Cluster" | "Keystone";

export interface Language {
  name: string;
  translations: Translations;
}

export interface Translations {}

export interface Mastery {
  name: string;
}

export interface SkillDetail {
  name: string;
  supportGems: SupportGems;
  dps: { [key: string]: number[] };
}

export interface SupportGems {
  names: Mastery[];
  use: { [key: string]: number[] };
  dictionary: { [key: string]: number };
}

export interface UniqueItem {
  name: string;
  type: UniqueItemType;
}

export type UniqueItemType =
  | "Amulet"
  | "Belt"
  | "Body Armour"
  | "Boots"
  | "Flask"
  | "Gloves"
  | "Helmet"
  | "Jewel"
  | "Quiver"
  | "Ring"
  | "Shield"
  | "Weapon";
