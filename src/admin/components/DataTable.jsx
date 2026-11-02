import { useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/**
 * Sortable, searchable, paginated table built on MUI Table.
 *
 * columns: [{
 *   key, label, align?, width?, sortable?,
 *   render?(row), sortValue?(row), searchValue?(row)
 * }]
 */
export default function DataTable({
  columns,
  rows,
  getRowId,
  loading = false,
  error = "",
  onRetry,
  searchable = true,
  searchPlaceholder = "Search…",
  initialSort,
  initialRowsPerPage = 10,
  emptyTitle = "Nothing here yet",
  emptyMessage = "",
  onRowClick,
  toolbar,
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const filtered = useMemo(() => {
    const source = Array.isArray(rows) ? rows : [];
    const needle = query.trim().toLowerCase();
    if (!needle) return source;

    const cellText = (column, row) => {
      if (column.searchValue) return String(column.searchValue(row) ?? "");
      const raw = row?.[column.key];
      if (raw === null || raw === undefined) return "";
      if (typeof raw === "object") return "";
      return String(raw);
    };

    return source.filter((row) =>
      columns.some((column) => cellText(column, row).toLowerCase().includes(needle)),
    );
  }, [query, rows, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return filtered;
    const valueOf = (row) => {
      const raw = column.sortValue ? column.sortValue(row) : row?.[column.key];
      if (raw === null || raw === undefined) return "";
      return raw;
    };
    const copy = [...filtered];
    copy.sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      if (typeof left === "number" && typeof right === "number") {
        return left - right;
      }
      return String(left).localeCompare(String(right), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    return sort.dir === "desc" ? copy.reverse() : copy;
  }, [filtered, sort, columns]);

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  const toggleSort = (key) => {
    setPage(0);
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const showToolbar = searchable || Boolean(toolbar);

  return (
    <Paper sx={{ overflow: "hidden" }}>
      {showToolbar && (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {searchable && (
            <TextField
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          {toolbar}
        </Box>
      )}

      <TableContainer>
        <Table size="small" sx={{ minWidth: 680 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || "left"}
                  sx={{ width: column.width }}
                  sortDirection={sort?.key === column.key ? sort.dir : false}
                >
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={sort?.key === column.key}
                      direction={sort?.key === column.key ? sort.dir : "asc"}
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_unused, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && error && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <ErrorOutlineIcon color="error" />
                    <Typography sx={{ mt: 1, fontWeight: 600 }}>
                      Could not load this data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {error}
                    </Typography>
                    {onRetry && (
                      <Button onClick={onRetry} variant="outlined" sx={{ mt: 2 }}>
                        Try again
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <InboxOutlinedIcon sx={{ color: "text.disabled", fontSize: 32 }} />
                    <Typography sx={{ mt: 1, fontWeight: 600 }}>
                      {query ? "No matches" : emptyTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {query
                        ? `Nothing matches “${query}”.`
                        : emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              paged.map((row, rowIndex) => (
                <TableRow
                  key={getRowId ? getRowId(row) : rowIndex}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || "left"}>
                      {column.render ? column.render(row) : row?.[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && !error && sorted.length > 0 && (
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </Paper>
  );
}
