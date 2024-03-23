import { writeFileSync } from "fs";
import { Field, fields, scalarType, typeNames } from "./schema";
const lines = ['syntax = "proto3";', ""];
Object.entries(fields).forEach(([k, v]) => {
  lines.push(`message ${typeNames[k]} {`);
  for (const field of v()) {
    lines.push(
      `  ${field.repeated ? "repeated " : ""}${getType(field)} ${field.name} = ${field.no};`,
    );
  }
  lines.push("}");
  lines.push("");
});
function getType(field: Field) {
  switch (field.kind) {
    case "scalar":
      return scalarType[field.T];
    case "map":
      return `map<${scalarType[field.K]}, ${
        field.V.kind === "scalar" ? scalarType[field.V.T] : typeNames[field.V.T.T.name]
      }>`;
    case "message":
      return typeNames[field.T.name];
  }
}

writeFileSync("src/models/ninja/protobuf/ninja.proto", lines.join("\n"));
