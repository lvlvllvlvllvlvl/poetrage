import std from "just-standard-deviation";

/**
  Run the Modified Thompson Tau Test on the given data to determine which elements are outliers.
  Port of https://github.com/vvaezian/modified_thompson_tau_test

  @param data the data that needs to be evaluated
  @param strictness how aggresive the outlier detection should be (1-5, 5 is most strict and removes the most values)
  @param is_sorted indicating whether data is already sorted
  @param in_place if true, will update the data in-place and return a reference to the original array
*/
export function filterOutliers(
  data: number[],
  strictness = 3,
  is_sorted = false,
  in_place = false,
) {
  strictness = Math.min(5, Math.max(1, strictness));
  if (!in_place) {
    data = [...data];
  }
  if (!is_sorted) {
    data.sort((l, r) => l - r);
  }

  // running the algorithm on the sorted target column
  while (data.length >= 3) {
    // run the alg for the biggest element (absolute value), get the result and update the data accordingly
    const [res, position] = run_alg_one_step(data, strictness);
    if (res === 0) {
      break;
    } else if (position === 0) {
      data.shift();
    } else {
      data.pop();
    }
  }

  return data;
}

const mapping = [
  [
    {
      1: 3.078,
      2: 1.886,
      3: 1.638,
      4: 1.533,
      5: 1.476,
      6: 1.44,
      7: 1.415,
      8: 1.397,
      9: 1.383,
      10: 1.372,
      11: 1.363,
      12: 1.356,
      13: 1.35,
      14: 1.345,
      15: 1.341,
      16: 1.337,
      17: 1.333,
      18: 1.33,
      19: 1.328,
      20: 1.325,
      21: 1.323,
      22: 1.321,
      23: 1.319,
      24: 1.318,
      25: 1.316,
      26: 1.315,
      27: 1.314,
      28: 1.313,
      29: 1.311,
      30: 1.31,
      40: 1.303,
      50: 1.299,
      60: 1.296,
      80: 1.292,
      100: 1.29,
      120: 1.289,
    },
    1.282,
  ],
  [
    {
      1: 6.314,
      2: 2.92,
      3: 2.353,
      4: 2.132,
      5: 2.015,
      6: 1.943,
      7: 1.895,
      8: 1.86,
      9: 1.833,
      10: 1.812,
      11: 1.796,
      12: 1.782,
      13: 1.771,
      14: 1.761,
      15: 1.753,
      16: 1.746,
      17: 1.74,
      18: 1.734,
      19: 1.729,
      20: 1.725,
      21: 1.721,
      22: 1.717,
      23: 1.714,
      24: 1.711,
      25: 1.708,
      26: 1.706,
      27: 1.703,
      28: 1.701,
      29: 1.699,
      30: 1.697,
      40: 1.684,
      50: 1.676,
      60: 1.671,
      80: 1.664,
      100: 1.66,
      120: 1.658,
    },
    1.645,
  ],
  [
    {
      1: 12.71,
      2: 4.303,
      3: 3.182,
      4: 2.776,
      5: 2.571,
      6: 2.447,
      7: 2.365,
      8: 2.306,
      9: 2.262,
      10: 2.228,
      11: 2.201,
      12: 2.179,
      13: 2.16,
      14: 2.145,
      15: 2.131,
      16: 2.12,
      17: 2.11,
      18: 2.101,
      19: 2.093,
      20: 2.086,
      21: 2.08,
      22: 2.074,
      23: 2.069,
      24: 2.064,
      25: 2.06,
      26: 2.056,
      27: 2.052,
      28: 2.048,
      29: 2.045,
      30: 2.042,
      40: 2.021,
      50: 2.009,
      60: 2.0,
      80: 1.99,
      100: 1.984,
      120: 1.98,
    },
    1.96,
  ],
  [
    {
      1: 31.82,
      2: 6.965,
      3: 4.541,
      4: 3.747,
      5: 3.365,
      6: 3.143,
      7: 2.998,
      8: 2.896,
      9: 2.821,
      10: 2.764,
      11: 2.718,
      12: 2.681,
      13: 2.65,
      14: 2.624,
      15: 2.602,
      16: 2.583,
      17: 2.567,
      18: 2.552,
      19: 2.539,
      20: 2.528,
      21: 2.518,
      22: 2.508,
      23: 2.5,
      24: 2.492,
      25: 2.485,
      26: 2.479,
      27: 2.473,
      28: 2.467,
      29: 2.462,
      30: 2.457,
      40: 2.423,
      50: 2.403,
      60: 2.39,
      80: 2.374,
      100: 2.364,
      120: 2.358,
    },
    2.326,
  ],
  [
    {
      1: 63.66,
      2: 9.925,
      3: 5.841,
      4: 4.604,
      5: 4.032,
      6: 3.707,
      7: 3.499,
      8: 3.355,
      9: 3.25,
      10: 3.169,
      11: 3.106,
      12: 3.055,
      13: 3.012,
      14: 2.977,
      15: 2.947,
      16: 2.921,
      17: 2.898,
      18: 2.878,
      19: 2.861,
      20: 2.845,
      21: 2.831,
      22: 2.819,
      23: 2.807,
      24: 2.797,
      25: 2.787,
      26: 2.779,
      27: 2.771,
      28: 2.763,
      29: 2.756,
      30: 2.75,
      40: 2.704,
      50: 2.678,
      60: 2.66,
      80: 2.639,
      100: 2.626,
      120: 2.617,
    },
    2.576,
  ],
];

function get_T_critical_value(n: number, strictness = 3) {
  // Get the value from the t-Student distribution for the given n.;
  const [t, inf_val] = mapping[5 - strictness];
  for (const e of Object.entries(t)) {
    const [key, val] = e;
    if (n <= parseInt(key)) {
      return val;
    }
  }
  return inf_val;
}

function calc_tau(n: number, strictness = 3) {
  // Calculate the rejection threshold.
  if (n < 3) {
    throw Error("ValueError");
  }
  const t = get_T_critical_value(n - 2, strictness);
  return (t * (n - 1)) / (Math.sqrt(n) * Math.sqrt(n - 2 + t ** 2));
}

function run_alg_one_step(sorted_series: number[], strictness = 3) {
  // Determine whether the biggest (absolute value) element of the given series is an outlier or not
  // using the Modified Thompson Tau Test.
  const n = sorted_series.length;
  const sample_mean = mean(sorted_series);
  const first_element = sorted_series[0];
  const last_element = sorted_series[sorted_series.length - 1];
  let candidate_position: number, outlier_candidate: number;
  if (Math.abs(first_element - sample_mean) > Math.abs(last_element - sample_mean)) {
    candidate_position = 0; // first
    outlier_candidate = first_element;
  } else {
    candidate_position = -1; // last
    outlier_candidate = last_element;
  }
  const rejection_region = calc_tau(n, strictness);
  const sample_std = std(sorted_series);
  const delta = Math.abs(outlier_candidate - sample_mean) / sample_std;
  return delta > rejection_region ? [1, candidate_position] : [0, null];
}

export function mean(arr: number[]) {
  return arr.reduce((l, r) => l + r, 0) / arr.length;
}
