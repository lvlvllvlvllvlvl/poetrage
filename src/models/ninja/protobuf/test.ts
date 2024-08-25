import { fromBinary } from "@bufbuild/protobuf";
import { NinjaSearchResultSchema } from "./ninja_pb";

fetch(
  "https://poe.ninja/api/builds/search/300a2734e4ad45d63a57c05987b0650c?overview=affliction&type=exp",
)
  .then((r) => r.arrayBuffer())
  .then((r) => new Uint8Array(r))
  .then((r) => fromBinary(NinjaSearchResultSchema, r).result)
  .then((r) => r?.dimensions.forEach((d) => console.log(d.id, d.dictionaryId)));
