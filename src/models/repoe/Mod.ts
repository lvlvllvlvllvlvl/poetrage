export interface Mod {
  adds_tags: AddsTag[];
  domain: Domain;
  generation_type: GenerationType;
  generation_weights: NWeight[];
  grants_effects: GrantsEffect[];
  groups: string[];
  implicit_tags: ImplicitTag[];
  is_essence_only: boolean;
  name: string;
  required_level: number;
  spawn_weights: NWeight[];
  stats: Stat[];
  type: string;
}

export type AddsTag =
  | "axe"
  | "blight_doesnt_engage"
  | "bow"
  | "cannot_be_twinned"
  | "caster_unique_weapon"
  | "chaos_warband"
  | "claw"
  | "corrupted_vaal"
  | "dagger"
  | "dual_wielding_mod"
  | "expedition_monster"
  | "grants_2h_support"
  | "grants_crit_chance_support"
  | "has_affliction_notable"
  | "has_attack_mod"
  | "has_caster_mod"
  | "infected_map"
  | "mace"
  | "map_has_blight_encounter"
  | "melee_mod"
  | "minion_unique_weapon"
  | "mirrored_monster"
  | "necromancer_raisable"
  | "one_handed_mod"
  | "pinnacle_boss"
  | "rare_monster_pack"
  | "RedbladeLeader"
  | "sanctum_braom_boss"
  | "sanctum_guard"
  | "sanctum_uzar_boss"
  | "shield_mod"
  | "specific_weapon"
  | "staff"
  | "sword"
  | "synthesised_monster"
  | "two_handed_mod"
  | "unusable_corpse"
  | "wand"
  | "weapon_can_roll_minion_modifiers";

export type Domain =
  | "abyss_jewel"
  | "affliction_jewel"
  | "area"
  | "atlas"
  | "chest"
  | "crafted"
  | "delve"
  | "delve_area"
  | "dummy"
  | "expedition_relic"
  | "flask"
  | "heist_area"
  | "heist_npc"
  | "heist_trinket"
  | "item"
  | "leaguestone"
  | "map_device"
  | "memory_lines"
  | "misc"
  | "mods_disallowed"
  | "monster"
  | "primordial_altar"
  | "sanctum_relic"
  | "sentinel"
  | "synthesis_a"
  | "synthesis_bonus"
  | "synthesis_globals"
  | "templar_relic"
  | "unveiled"
  | "veiled"
  | "watchstone";

export type GenerationType =
  | "archnemesis"
  | "bestiary"
  | "blight"
  | "blight_tower"
  | "bloodlines"
  | "corrupted"
  | "delve_area"
  | "enchantment"
  | "essence"
  | "expedition_logbook"
  | "flask_enchantment_enkindling"
  | "flask_enchantment_instilling"
  | "monster_affliction"
  | "nemesis"
  | "prefix"
  | "scourge_benefit"
  | "scourge_detriment"
  | "scourge_gimmick"
  | "searing_exarch_implicit"
  | "suffix"
  | "synthesis_a"
  | "synthesis_bonus"
  | "synthesis_globals"
  | "talisman"
  | "tempest"
  | "torment"
  | "unique"
  | "<unknown>";

export interface NWeight {
  tag: string;
  weight: number;
}

export interface GrantsEffect {
  granted_effect_id: string;
  level: number;
}

export type ImplicitTag =
  | "ailment"
  | "armour"
  | "attack"
  | "attribute"
  | "aura"
  | "bleed"
  | "block"
  | "blue_herring"
  | "caster"
  | "caster_damage"
  | "chaos"
  | "chaos_damage"
  | "cold"
  | "critical"
  | "curse"
  | "damage"
  | "defences"
  | "dot_multi"
  | "earth_elemental"
  | "elemental"
  | "elemental_damage"
  | "endurance_charge"
  | "energy_shield"
  | "evasion"
  | "fire"
  | "flask"
  | "flat_life_regen"
  | "frenzy_charge"
  | "gem"
  | "green_herring"
  | "life"
  | "lightning"
  | "mana"
  | "minion"
  | "physical"
  | "physical_damage"
  | "poison"
  | "power_charge"
  | "red_herring"
  | "resistance"
  | "resource"
  | "skill"
  | "speed"
  | "support"
  | "unveiled_mod"
  | "vaal";

export interface Stat {
  id: string;
  max: number;
  min: number;
}
