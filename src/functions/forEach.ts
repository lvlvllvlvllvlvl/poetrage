export async function forEach<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => void
) {
  for (let i = 0; i < array.length; i++) {
    await callbackfn(array[i], i, array);
  }
}
