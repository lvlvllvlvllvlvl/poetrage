import { getGemInfo } from "apis/getGemInfo";
import { writeFile } from "fs/promises";

getGemInfo().then((info) => writeFile("src/data/gemInfo.json", JSON.stringify(info)));
