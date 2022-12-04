import { Builds } from "../models/Builds";

export const getBuilds = (league: string) =>
  fetch(
    `http://localhost:8080/ninja/api/data/x/getbuildoverview?overview=${league
      .toLowerCase()
      .replaceAll(" ", "-")}&type=exp&language=en`
  ).then((r) => {
    if (r.status !== 200) {
      throw r.json();
    }
    return r.json() as Promise<Builds>;
  });
