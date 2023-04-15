import "@tanstack/react-table";

declare module "localforage-memoryStorageDriver";

declare module "@tanstack/table-core" {
  interface ColumnMeta {
    tooltip?: string;
    filter?: {
      isMin?: boolean;
      isMax?: boolean;
      isBool?: boolean;
      isFloat?: boolean;
      isText?: boolean;
      isType?: boolean;
      minDefault?: number;
    };
  }
}
