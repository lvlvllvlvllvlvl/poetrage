import { Leagues } from "../models/ninja/Leagues";
import { api } from "./axios";

export const getLeagues = async () =>
  (await api.get<Leagues>("https://poe.ninja/api/data/getindexstate")).data;
