import { writeFile } from "fs/promises";

/**
 * Like https://stackoverflow.com/a/45813619/2063518 with size == 3
 * but instead of building the permutation arrays just count the
 * number of permutations with each input index as their first item.
 * If the input array is sorted high-to-low, this will be the count
 * of permutations that have each index as their maximum value.
 * E.g. if we generated permutations of [4,3,2,1] we would get
 * [4,3,2] [4,3,1] [4,2,1] [3,2,1], with max counts of [3,1,0,0]
 */
export function getPermutationMaximums(count) {
  function p(max, length: number, i) {
    if (length === 3) {
      total++;
      counts[max]++;
      return;
    }
    if (i + 1 > count) {
      return;
    }
    p(length == 0 ? i : max, length + 1, i + 1);
    p(max, length, i + 1);
  }

  let total = 0;
  const counts = new Array(count).fill(0);
  p(0, 0, 0);
  return { total: total, counts };
}

const result: ReturnType<typeof getPermutationMaximums>[] = [];
while (result.length < 300) {
  if (result.length < 3) {
    result.push({} as any);
  } else {
    result.push(getPermutationMaximums(result.length));
  }
}
writeFile("src/data/permutations.json", JSON.stringify(result, undefined, 2));
