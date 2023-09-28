import { writeFile } from "fs/promises";
import { getGemInfo } from "../src/apis/getGemInfo";

getGemInfo().then(info => writeFile("src/data/gemInfo.json", JSON.stringify(info)))
