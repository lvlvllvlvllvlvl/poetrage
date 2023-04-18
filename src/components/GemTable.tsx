import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import {
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
import * as api from "redux/api";
import { setters } from "redux/app";
import { zippedData } from "redux/selectors/zipData";
import { useAppDispatch, useAppSelector } from "redux/store";

export const GemTable = () => {
  const dispatch = useAppDispatch();
  const { setSorting, setColumnFilters } = setters(dispatch);

  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const league = useAppSelector((state) => state.app.league);
  const sorting = useAppSelector((state) => state.app.sorting);
  const columnFilters = useAppSelector((state) => state.app.columnFilters);
  const preview = useAppSelector((state) => state.app.preview);
  const data = useAppSelector(zippedData);

  const columns = useAppSelector(getColumns);
  const table = useReactTable({
    data,
    columns,
    filterFns: { search, includes },
    enablePinning: true,
    defaultColumn: { size: 100 },
    state: {
      sorting,
      columnFilters,
      columnVisibility: { Meta: !!league?.indexed, Profit: preview },
      columnPinning: { left: ["Name"] },
    },
    onColumnFiltersChange: (updater) =>
      setColumnFilters(isFunction(updater) ? updater(columnFilters) : updater),
    onSortingChange: (updater) => setSorting(isFunction(updater) ? updater(sorting) : updater),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });
  return (
    <>
      {gems.status === "done" && currencyMap.status === "done" && (
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
                          {header.isPlaceholder ? null : (
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
                                    onClick: header.column.getToggleSortingHandler(),
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
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
          />
        </>
      )}
      {gems.status === "fail" && String(gems.error)}
    </>
  );
};
