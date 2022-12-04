import axios from "axios";
import { Leagues } from "../models/Leagues";

export const getLeagues = async () =>
  (await axios.get<Leagues>("http://localhost:8080/ninja/api/data/getindexstate")).data;
