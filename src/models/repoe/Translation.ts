export interface Translation {
  English: Stat[];
  ids: string[];
  hidden?: boolean;
}

export interface Stat {
  condition: Condition[];
  format: Format[];
  index_handlers: Array<IndexHandler[]>;
  string: string;
}

export interface Condition {
  min?: number;
  max?: number;
  negated?: boolean;
}

export type Format = "#" | "+#" | "ignore";

export type IndexHandler =
  | "affliction_reward_type"
  | "canonical_stat"
  | "deciseconds_to_seconds"
  | "display_indexable_support"
  | "divide_by_fifteen_0dp"
  | "divide_by_fifty"
  | "divide_by_five"
  | "divide_by_four"
  | "divide_by_one_hundred"
  | "divide_by_one_hundred_2dp"
  | "divide_by_one_hundred_2dp_if_required"
  | "divide_by_one_hundred_and_negate"
  | "divide_by_one_thousand"
  | "divide_by_six"
  | "divide_by_ten_0dp"
  | "divide_by_ten_1dp"
  | "divide_by_ten_1dp_if_required"
  | "divide_by_three"
  | "divide_by_twelve"
  | "divide_by_twenty_then_double_0dp"
  | "divide_by_two_0dp"
  | "double"
  | "metamorphosis_reward_description"
  | "milliseconds_to_seconds"
  | "milliseconds_to_seconds_0dp"
  | "milliseconds_to_seconds_1dp"
  | "milliseconds_to_seconds_2dp"
  | "milliseconds_to_seconds_2dp_if_required"
  | "mod_value_to_item_class"
  | "multiplicative_damage_modifier"
  | "negate"
  | "negate_and_double"
  | "old_leech_percent"
  | "old_leech_permyriad"
  | "passive_hash"
  | "per_minute_to_per_second"
  | "per_minute_to_per_second_0dp"
  | "per_minute_to_per_second_1dp"
  | "per_minute_to_per_second_2dp"
  | "per_minute_to_per_second_2dp_if_required"
  | "plus_two_hundred"
  | "30%_of_value"
  | "60%_of_value"
  | "times_one_point_five"
  | "times_twenty"
  | "tree_expansion_jewel_passive";
