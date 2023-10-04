import localforage from "localforage";

export const forageStore = localforage.createInstance({ name: "poetrage", version: 1 });
