import axios from "axios";
import { Builds } from "../models/Builds";

export const getBuilds = async (league: string) =>
  (
    await axios.get<Builds>(
      `http://localhost:8080/ninja/api/data/x/getbuildoverview?overview=${league
        .toLowerCase()
        .replaceAll(" ", "-")}&type=exp&language=en`
    )
  ).data;
