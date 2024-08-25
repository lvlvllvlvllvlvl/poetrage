export const scalarType = {
  1: "double",
  2: "float",
  3: "int64",
  4: "uint64",
  5: "int32",
  6: "fixed64",
  7: "fixed32",
  8: "bool",
  9: "string",
  12: "bytes",
  13: "uint32",
  15: "sfixed32",
  16: "sfixed64",
  17: "sint32",
  18: "sint64",
};
interface Base {
  no: number;
  name: string;
  repeated?: boolean;
}
interface Scalar extends Base {
  kind: "scalar";
  T: number;
}
interface Map extends Base {
  kind: "map";
  K: number;
  V:
    | {
        kind: "scalar";
        T: number;
      }
    | {
        kind: "message";
        T: Message;
      };
}
interface Message extends Base {
  kind: "message";
  T: { name: string };
}
export type Field = Scalar | Map | Message;
type Fields = Field[];
const We = {
  util: {
    setEnumType(_: any, name: string, values: { no: number; name: string }[]) {},
    newFieldList<T>(t: () => Fields) {
      return t;
    },
    initPartial: (..._) => {},
    equals: (..._) => {},
  },
};
class Mn {
  name: string = "";
  fromBinary(..._) {}
  fromJson(..._) {}
  fromJsonString(..._) {}
}
function we(clazz: { name: string }, property: "runtime" | "typeName" | "fields", value);
function we(instance: Mn, property: string, value?);
function we(obj, property, value) {
  if (!obj?.name) {
    return;
  }
  if (property === "typeName") {
    typeNames[obj.name] = value;
  }
  if (property === "fields") {
    fields[obj.name] = value;
  }
}
export const typeNames: Record<string, string> = {};
export const fields: Record<string, () => Fields> = {};

var xI = ((e) => ((e[(e.ASC = 0)] = "ASC"), (e[(e.DESC = 1)] = "DESC"), e))(xI || {});
We.util.setEnumType(xI, "SearchResultSortOrder", [
  {
    no: 0,
    name: "ASC",
  },
  {
    no: 1,
    name: "DESC",
  },
]);
const Wa = class Wa extends Mn {
  constructor(n?) {
    super();
    we(this, "total", 0);
    we(this, "dimensions", []);
    we(this, "integerDimensions", []);
    we(this, "performancePoints", []);
    we(this, "valueLists", []);
    we(this, "dictionaries", []);
    we(this, "fields", []);
    we(this, "sections", []);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Wa().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Wa().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Wa().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Wa, n, r);
  }
};
we(Wa, "runtime", We),
  we(Wa, "typeName", "SearchResult"),
  we(
    Wa,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "total",
        kind: "scalar",
        T: 13,
      },
      {
        no: 2,
        name: "dimensions",
        kind: "message",
        T: yb,
        repeated: !0,
      },
      {
        no: 3,
        name: "integer_dimensions",
        kind: "message",
        T: _b,
        repeated: !0,
      },
      {
        no: 4,
        name: "performance_points",
        kind: "message",
        T: bb,
        repeated: !0,
      },
      {
        no: 5,
        name: "value_lists",
        kind: "message",
        T: wb,
        repeated: !0,
      },
      {
        no: 6,
        name: "dictionaries",
        kind: "message",
        T: vb,
        repeated: !0,
      },
      {
        no: 7,
        name: "fields",
        kind: "message",
        T: gb,
        repeated: !0,
      },
      {
        no: 8,
        name: "sections",
        kind: "message",
        T: mb,
        repeated: !0,
      },
    ]),
  );
let pb = Wa;
const qa = class qa extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "type", "");
    we(this, "name", "");
    we(this, "valueListIds", []);
    we(this, "sortId", "");
    we(this, "integerDimensionId", "");
    we(this, "properties", {});
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new qa().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new qa().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new qa().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(qa, n, r);
  }
};
we(qa, "runtime", We),
  we(qa, "typeName", "SearchResultField"),
  we(
    qa,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "type",
        kind: "scalar",
        T: 9,
      },
      {
        no: 3,
        name: "name",
        kind: "scalar",
        T: 9,
      },
      {
        no: 4,
        name: "value_list_ids",
        kind: "scalar",
        T: 9,
        repeated: !0,
      },
      {
        no: 5,
        name: "sort_id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 6,
        name: "integer_dimension_id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 7,
        name: "properties",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 9,
        },
      },
    ]),
  );
let gb = qa;
const Va = class Va extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "type", "");
    we(this, "name", "");
    we(this, "dimensionId", "");
    we(this, "properties", {});
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Va().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Va().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Va().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Va, n, r);
  }
};
we(Va, "runtime", We),
  we(Va, "typeName", "SearchResultSection"),
  we(
    Va,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "type",
        kind: "scalar",
        T: 9,
      },
      {
        no: 3,
        name: "name",
        kind: "scalar",
        T: 9,
      },
      {
        no: 4,
        name: "dimension_id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 5,
        name: "properties",
        kind: "map",
        K: 9,
        V: {
          kind: "scalar",
          T: 9,
        },
      },
    ]),
  );
let mb = Va;
const Ya = class Ya extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "hash", "");
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Ya().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Ya().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Ya().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Ya, n, r);
  }
};
we(Ya, "runtime", We),
  we(Ya, "typeName", "SearchResultDictionaryReference"),
  we(
    Ya,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "hash",
        kind: "scalar",
        T: 9,
      },
    ]),
  );
let vb = Ya;
const Ga = class Ga extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "dictionaryId", "");
    we(this, "counts", []);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Ga().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Ga().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Ga().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Ga, n, r);
  }
};
we(Ga, "runtime", We),
  we(Ga, "typeName", "SearchResultDimension"),
  we(
    Ga,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "dictionary_id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 3,
        name: "counts",
        kind: "message",
        T: xb,
        repeated: !0,
      },
    ]),
  );
let yb = Ga;
const Xa = class Xa extends Mn {
  constructor(n?) {
    super();
    we(this, "key", 0);
    we(this, "count", 0);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Xa().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Xa().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Xa().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Xa, n, r);
  }
};
we(Xa, "runtime", We),
  we(Xa, "typeName", "SearchResultDimensionCount"),
  we(
    Xa,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "key",
        kind: "scalar",
        T: 13,
      },
      {
        no: 2,
        name: "count",
        kind: "scalar",
        T: 13,
      },
    ]),
  );
let xb = Xa;
const Ja = class Ja extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "minValue", 0);
    we(this, "maxValue", 0);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Ja().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Ja().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Ja().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Ja, n, r);
  }
};
we(Ja, "runtime", We),
  we(Ja, "typeName", "SearchResultIntegerDimension"),
  we(
    Ja,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "min_value",
        kind: "scalar",
        T: 13,
      },
      {
        no: 3,
        name: "max_value",
        kind: "scalar",
        T: 13,
      },
    ]),
  );
let _b = Ja;
const Za = class Za extends Mn {
  constructor(n?) {
    super();
    we(this, "name", "");
    we(this, "ms", 0);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Za().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Za().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Za().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Za, n, r);
  }
};
we(Za, "runtime", We),
  we(Za, "typeName", "SearchResultPerformance"),
  we(
    Za,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "name",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "ms",
        kind: "scalar",
        T: 1,
      },
    ]),
  );
let bb = Za;
const Ka = class Ka extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "values", []);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Ka().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Ka().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Ka().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Ka, n, r);
  }
};
we(Ka, "runtime", We),
  we(Ka, "typeName", "SearchResultValueList"),
  we(
    Ka,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "values",
        kind: "message",
        T: Sb,
        repeated: !0,
      },
    ]),
  );
let wb = Ka;
const Qa = class Qa extends Mn {
  constructor(n?) {
    super();
    we(this, "str", "");
    we(this, "number", 0);
    we(this, "numbers", []);
    we(this, "strs", []);
    we(this, "boolean", !1);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new Qa().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new Qa().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new Qa().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(Qa, n, r);
  }
};
we(Qa, "runtime", We),
  we(Qa, "typeName", "SearchResultValue"),
  we(
    Qa,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "str",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "number",
        kind: "scalar",
        T: 13,
      },
      {
        no: 3,
        name: "numbers",
        kind: "scalar",
        T: 13,
        repeated: !0,
      },
      {
        no: 4,
        name: "strs",
        kind: "scalar",
        T: 9,
        repeated: !0,
      },
      {
        no: 5,
        name: "boolean",
        kind: "scalar",
        T: 8,
      },
    ]),
  );
let Sb = Qa;
const eo = class eo extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "values", []);
    we(this, "properties", []);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new eo().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new eo().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new eo().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(eo, n, r);
  }
};
we(eo, "runtime", We),
  we(eo, "typeName", "SearchResultDictionary"),
  we(
    eo,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "values",
        kind: "scalar",
        T: 9,
        repeated: !0,
      },
      {
        no: 3,
        name: "properties",
        kind: "message",
        T: kb,
        repeated: !0,
      },
    ]),
  );
let Cb = eo;
const to = class to extends Mn {
  constructor(n?) {
    super();
    we(this, "id", "");
    we(this, "values", []);
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new to().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new to().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new to().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(to, n, r);
  }
};
we(to, "runtime", We),
  we(to, "typeName", "SearchResultDictionaryProperty"),
  we(
    to,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "id",
        kind: "scalar",
        T: 9,
      },
      {
        no: 2,
        name: "values",
        kind: "scalar",
        T: 9,
        repeated: !0,
      },
    ]),
  );
let kb = to;
const no = class no extends Mn {
  constructor(n?) {
    super();
    we(this, "result");
    We.util.initPartial(n, this);
  }
  static fromBinary(n, r) {
    return new no().fromBinary(n, r);
  }
  static fromJson(n, r) {
    return new no().fromJson(n, r);
  }
  static fromJsonString(n, r) {
    return new no().fromJsonString(n, r);
  }
  static equals(n, r) {
    return We.util.equals(no, n, r);
  }
};
we(no, "runtime", We),
  we(no, "typeName", "NinjaSearchResult"),
  we(
    no,
    "fields",
    We.util.newFieldList(() => [
      {
        no: 1,
        name: "result",
        kind: "message",
        T: pb,
      },
    ]),
  );
