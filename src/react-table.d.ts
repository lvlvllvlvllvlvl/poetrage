import "@tanstack/react-table";

declare module "@tanstack/table-core" {
  interface ColumnMeta {
    tooltip?: string;
    filter?: {
      isMin?: boolean;
      isMax?: boolean;
      isBool?: boolean;
      isFloat?: boolean;
      isText?: boolean;
      options?: string[];
      minDefault?: number;
    };
  }
}
