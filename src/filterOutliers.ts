//https://gist.github.com/ogun/f19dc055e6b84d57e8186cbc9eaa8e45
export function filterOutliers(someArray: number[]) {

    if (someArray.length < 4)
        return someArray;

    let q1: number, q3: number, iqr: number;

    const values = someArray.slice().sort((a, b) => a - b);//copy array fast and sort

    if ((values.length / 4) % 1 === 0) {//find quartiles
        q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
        q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
    } else {
        q1 = values[Math.floor(values.length / 4 + 1)];
        q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
    }

    iqr = q3 - q1;
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    return values.filter((x) => (x >= minValue) && (x <= maxValue));
}
