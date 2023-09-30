import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";

export const forageStore = localforage.defineDriver(memoryDriver).then(() =>
  localforage.createInstance({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver],
    name: "poetrage",
  }),
);
