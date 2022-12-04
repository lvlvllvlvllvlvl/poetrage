import { Leagues } from "../models/Leagues";

export const getLeagues = () =>
  fetch("http://localhost:8080/ninja/api/data/getindexstate").then((r) => {
    if (r.status !== 200) {
      throw r.json();
    }
    return r.json() as Promise<Leagues>;
  });
