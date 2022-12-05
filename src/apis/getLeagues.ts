import { api } from "./axios";
import { Leagues } from "../models/ninja/Leagues";

export const getLeagues = async () =>
  (await api.get<Leagues>("https://poe.ninja/api/data/getindexstate")).data;
