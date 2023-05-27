import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
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
import { useEffect, useState } from "react";
import * as api from "state/api";
import { setters } from "state/app";
import { zippedData } from "state/selectors/zipData";
import { useAppDispatch, useAppSelector } from "state/store";
import LinearProgress from "@mui/material/LinearProgress";

const pin = { id: "Pinned", desc: true };

const wrapFilter: (fn: FilterFn<any>) => FilterFn<any> = (fn) => (row, id, value, meta) =>
  row.original.Pinned || fn(row, id, value, meta);

export const GemTable = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { setSorting, setColumnFilters } = setters(dispatch);

  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const gemInfo = useAppSelector(api.gemInfo);
  const meta = useAppSelector(api.meta);
  const league = useAppSelector((state) => state.app.league);
  const source = useAppSelector((state) => state.app.source);
  const sorting = useAppSelector((state) => state.app.sorting);
  const columnFilters = useAppSelector((state) => state.app.columnFilters);
  const data = useAppSelector(zippedData);
  const progress = useAppSelector((state) => state.app.progress);
  const progressMsg = useAppSelector((state) => state.app.progressMsg);
  const graphProgress = useAppSelector((state) => state.app.graphProgress);
  const graphProgressMsg = useAppSelector((state) => state.app.graphProgressMsg);

  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      columnVisibility: { Meta: !!league?.indexed, Listings: source !== "watch" },
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

  useEffect(() => void table.setPageSize(rowsPerPage), [table, rowsPerPage]);

  return (
    <>
      <Paper sx={{ width: "100vw", height: "100%", overflow: "auto" }} ref={setContainerRef}>
        {gems.status === "done" && currencyMap.status === "done" && (
          <TableContainer sx={{ height: containerRef?.clientHeight }}>
            <Table stickyHeader sx={{ width: table.getCenterTotalSize(), tableLayout: "fixed" }}>
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
                            position: header.column.getIsPinned() ? "sticky" : undefined,
                            left: header.column.getIsPinned() ? 0 : undefined,
                            zIndex: header.column.getIsPinned() ? 1001 : undefined,
                            width: header.getSize(),
                          }}>
                          {header.isPlaceholder || header.id === "Pinned" ? null : (
                            <Box>
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
                    <TableRow key={row.id} sx={{ p: 0 }}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            sx={{
                              p: 1,
                              position: cell.column.getIsPinned() ? "sticky" : undefined,
                              left: cell.column.getIsPinned() ? 0 : undefined,
                              zIndex: cell.column.getIsPinned() ? 1000 : undefined,
                              width: cell.column.getSize(),
                              backgroundColor: theme.palette.background.paper,
                              backgroundImage:
                                "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
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
          </TableContainer>
        )}
      </Paper>
      <Box sx={{ display: "flex" }}>
        {gems.status === "done" && currencyMap.status === "done" && (
          <TablePagination
            component="div"
            count={table.getFilteredRowModel().rows.length}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              table.setPageIndex(0);
            }}
          />
        )}
        {gems.status === "done" &&
        currencyMap.status === "done" &&
        meta.status === "done" &&
        gemInfo.status === "done" ? (
          <Box sx={{ pl: 2, flexGrow: 1 }}>
            <Typography component="p" p={1}>
              {progressMsg || "All currency costs accounted for in profit values"}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <LinearProgress title={graphProgressMsg} variant="determinate" value={graphProgress} />
          </Box>
        ) : (
          <Box>
            fetching data... gem data: {gemInfo.error || gemInfo.status}, gem prices:{" "}
            {gems.error || gems.status}, currency: {currencyMap.error || currencyMap.status},
            builds: {meta.error || meta.status}
          </Box>
        )}
        <Typography p={1}>
          This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
        </Typography>
      </Box>
    </>
  );
};
