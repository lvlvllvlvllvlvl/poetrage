import { filterOutliers } from "../functions/filterOutliers";

it("filters outliers from data", () => {
  expect(
    filterOutliers([
      12.5539, 5.971, 6.2012, 7.53099, 15.1467, 40.12345, 1.55136, 23.967, 1.73521, 21.3101,
      8.80132, 50.12345,
    ]),
  ).toEqual([1.55136, 1.73521, 5.971, 6.2012, 7.53099, 8.80132, 12.5539, 15.1467, 21.3101, 23.967]);

  expect(filterOutliers([572.39, 542.97, 488.51, 514.09, 571.34, 555.71, 215.7, 1.4])).toEqual([
    488.51, 514.09, 542.97, 555.71, 571.34, 572.39,
  ]);
});
