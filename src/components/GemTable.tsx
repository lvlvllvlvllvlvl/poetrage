import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import {
  Column,
  FilterFn,
  filterFns,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Filter from "components/Filter";
import { getColumns } from "components/columns";
import { includes, search } from "functions/columnFilters";
import { isFunction } from "lodash";
import { GemDetails } from "models/gems";
import * as api from "state/api";
import { setters } from "state/app";
import { zippedData } from "state/selectors/zipData";
import { useAppDispatch, useAppSelector } from "state/store";

const pin = { id: "Pinned", desc: true };

const wrapFilter: (fn: FilterFn<any>) => FilterFn<any> = (fn) => (row, id, value, meta) =>
  row.original.Pinned || fn(row, id, value, meta);

export const GemTable = () => {
  const dispatch = useAppDispatch();
  const { setSorting, setColumnFilters } = setters(dispatch);

  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const league = useAppSelector((state) => state.app.league);
  const sorting = useAppSelector((state) => state.app.sorting);
  const columnFilters = useAppSelector((state) => state.app.columnFilters);
  const preview = useAppSelector((state) => state.app.devMode);
  const data = useAppSelector(zippedData);

  const sortingHandler = (col: Column<GemDetails>) => {
    const descFirst = col.id !== "Name";
    const existing = sorting.find(({ id }) => id === col.id);
    if (existing) {
      if (Boolean(existing.desc) === descFirst) {
        setSorting([pin, { id: col.id, desc: !descFirst }]);
      } else {
        setSorting([pin]);
      }
    } else {
      setSorting([pin, { id: col.id, desc: descFirst }]);
    }
  };

  const columns = useAppSelector(getColumns);
  const table = useReactTable({
    data,
    columns,
    filterFns: Object.fromEntries(
      Object.entries(filterFns)
        .concat(Object.entries({ search, includes }))
        .map(([k, fn]) => [k, Object.assign(wrapFilter(fn), fn)])
    ),
    enablePinning: true,
    enableMultiSort: true,
    maxMultiSortColCount: 3,
    defaultColumn: { size: 100, enableMultiSort: true },
    state: {
      sorting,
      columnFilters,
      columnVisibility: { Meta: !!league?.indexed, Profit: preview },
      columnPinning: { left: ["Name"] },
    },
    onColumnFiltersChange: (updater) =>
      setColumnFilters(isFunction(updater) ? updater(columnFilters) : updater),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });
  return (
    <>
      {gems.status === "done" && currencyMap.status === "done" ? (
        <>
          <Box sx={{ maxWidth: "100vw", overflow: "auto" }}>
            <Table sx={{ width: table.getCenterTotalSize(), tableLayout: "fixed" }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableCell
                          key={header.id}
                          colSpan={header.colSpan}
                          sx={{
                            height: 0,
                            background: "white",
                            position: header.column.getIsPinned() ? "sticky" : undefined,
                            left: header.column.getIsPinned() ? 0 : undefined,
                            zIndex: header.column.getIsPinned() ? 1000 : undefined,
                            width: header.getSize(),
                          }}>
                          {header.isPlaceholder || header.id === "Pinned" ? null : (
                            <Box
                              sx={{
                                flex: "1",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}>
                              <Tooltip title={header.column.columnDef.meta?.tooltip}>
                                <Box
                                  {...{
                                    style: {
                                      ...(header.column.getCanSort()
                                        ? {
                                            cursor: "pointer",
                                            userSelect: "none",
                                          }
                                        : {}),
                                      verticalAlign: "top",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    },
                                    onClick: () => sortingHandler(header.column),
                                  }}>
                                  {{ asc: " ▲", desc: " ▼" }[
                                    header.column.getIsSorted() as string
                                  ] ?? null}
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </Box>
                              </Tooltip>
                              <Filter column={header.column as any} />
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            sx={{
                              background: "white",
                              position: cell.column.getIsPinned() ? "sticky" : undefined,
                              left: cell.column.getIsPinned() ? 0 : undefined,
                              zIndex: cell.column.getIsPinned() ? 1000 : undefined,
                              width: cell.column.getSize(),
                            }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Pagination
              count={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              onChange={(_, page) => table.setPageIndex(page - 1)}
            />
            This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
          </Box>
        </>
      ) : (
        <>
          gems: {gems.error || gems.status}, currency: {currencyMap.error || currencyMap.status}
        </>
      )}
    </>
  );
};
