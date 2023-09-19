import { isString } from "lodash";

const handler = {
  get: (target: any, name: string | symbol) => {
    if (!(name in target) && name !== "length" && isString(name)) {
      target[name] = defaultObj();
    }
    return target[name];
  },
};

export function defaultObj() {
  return new Proxy({}, handler);
}
