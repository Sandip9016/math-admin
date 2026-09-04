
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { useToast } from "../../context/ToastContext";
import { getGameLogs } from "../../api/gameLogs.api";

interface GameLogRow {
  logType: "pvp" | "computer";
  validateId: string;
  gameId?: string;
  player1Username?: string;
  player2Username?: string;
  playerId?: string;
  finalScorePlayer1?: number;
  finalScorePlayer2?: number;
  finalPlayerScore?: number;
  finalComputerScore?: number;
  winner?: string;
  diffCode?: string;
  timer?: number | string;
  gameStartTime?: string;
  gameEndTime?: string;
}

const typeOptions = [
  { value: "all", label: "All" },
  { value: "pvp", label: "PvP" },
  { value: "computer", label: "Computer" },
];

const diffCodeOptions = [
  { value: "E2", label: "E2" },
  { value: "E4", label: "E4" },
  { value: "M2", label: "M2" },
  { value: "M4", label: "M4" },
  { value: "H2", label: "H2" },
  { value: "H4", label: "H4" },
];

const timerOptions = [
  { value: "1", label: "1 min" },
  { value: "2", label: "2 min" },
  { value: "3", label: "3 min" },
];

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

// Safety cap so an active filter can't trigger unbounded API calls.
// 40 pages * 100/page = up to 4000 games scanned.
const FILTER_FETCH_PAGE_SIZE = 100;
const FILTER_FETCH_MAX_PAGES = 40;

const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : "-");

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Monday-based week start
const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
};
const endOfWeek = (d: Date) => {
  const monday = startOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return endOfDay(sunday);
};

/** Resolve a preset date-range option into concrete [from, to] Date bounds. */
function resolvePresetRange(option: string): [Date, Date] | null {
  const now = new Date();
  switch (option) {
    case "today":
      return [startOfDay(now), endOfDay(now)];
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return [startOfDay(y), endOfDay(y)];
    }
    case "this_week":
      return [startOfWeek(now), endOfDay(now)];
    case "last_week": {
      const lastWeekAnchor = new Date(now);
      lastWeekAnchor.setDate(now.getDate() - 7);
      return [startOfWeek(lastWeekAnchor), endOfWeek(lastWeekAnchor)];
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return [startOfDay(start), endOfDay(now)];
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day prev month
      return [startOfDay(start), endOfDay(end)];
    }
    default:
      return null;
  }
}

export default function GameLogsList() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Normal (unfiltered) server-paginated results.
  const [items, setItems] = useState<GameLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPvp, setTotalPvp] = useState(0);
  const [totalComputer, setTotalComputer] = useState(0);

  // Full result set gathered across pages while a client-side filter
  // (date range / diff code / timer) is active, since those filters
  // aren't supported by the API and must otherwise be applied to just
  // the current page's 20 rows.
  const [filterModeItems, setFilterModeItems] = useState<GameLogRow[]>([]);
  const [filterModeLoading, setFilterModeLoading] = useState(false);
  const [filterModeCapped, setFilterModeCapped] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [type, setType] = useState("all");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [playerId, setPlayerId] = useState("");

  const [diffCode, setDiffCode] = useState(""); // E2/E4/M2/M4/H2/H4
  const [timerMin, setTimerMin] = useState(""); // "1" | "2" | "3"
  const [dateRange, setDateRange] = useState(""); // dateRangeOptions value
  const [customFrom, setCustomFrom] = useState(""); // yyyy-mm-dd
  const [customTo, setCustomTo] = useState(""); // yyyy-mm-dd

  const hasClientFilters = !!(diffCode || timerMin || dateRange);

  // ---- Normal server-paginated fetch (used when no client filter is active) ----
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (type && type !== "all") params.type = type;
      if (playerId) params.playerId = playerId;

      const res: any = await getGameLogs(params);
      setItems(res.data || []);
      setHasMore(!!res.pagination?.hasMore);
      setTotal(res.pagination?.total || 0);
      setTotalPvp(res.pagination?.totalPvp || 0);
      setTotalComputer(res.pagination?.totalComputer || 0);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to load game logs", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, type, playerId]);

  useEffect(() => {
    if (!hasClientFilters) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasClientFilters, fetchLogs]);

  // ---- Full-set fetch across pages (used when a client filter is active) ----
  const fetchAllForFilters = useCallback(async () => {
    setFilterModeLoading(true);
    setFilterModeCapped(false);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        limit: FILTER_FETCH_PAGE_SIZE,
      };
      if (type && type !== "all") params.type = type;
      if (playerId) params.playerId = playerId;

      let all: GameLogRow[] = [];
      let p = 1;
      let more = true;

      while (more && p <= FILTER_FETCH_MAX_PAGES) {
        const res: any = await getGameLogs({ ...params, page: p });
        const batch: GameLogRow[] = res.data || [];
        all = all.concat(batch);
        setTotal(res.pagination?.total || 0);
        setTotalPvp(res.pagination?.totalPvp || 0);
        setTotalComputer(res.pagination?.totalComputer || 0);
        more = !!res.pagination?.hasMore;
        p += 1;
      }

      if (more) setFilterModeCapped(true);
      setFilterModeItems(all);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to load game logs", "error");
    } finally {
      setFilterModeLoading(false);
    }
  }, [type, playerId, showToast]);

  useEffect(() => {
    if (hasClientFilters) {
      setPage(1);
      fetchAllForFilters();
    }
  }, [hasClientFilters, fetchAllForFilters]);

  // debounce playerId search box
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setPlayerId(playerIdInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [playerIdInput]);

  // Resolve the active date bounds, whether from a preset or the custom pickers.
  const [fromBound, toBound] = useMemo<[number | null, number | null]>(() => {
    if (!dateRange) return [null, null];
    if (dateRange === "custom") {
      const from = customFrom ? startOfDay(new Date(customFrom)).getTime() : null;
      const to = customTo ? endOfDay(new Date(customTo)).getTime() : null;
      return [from, to];
    }
    const preset = resolvePresetRange(dateRange);
    if (!preset) return [null, null];
    return [preset[0].getTime(), preset[1].getTime()];
  }, [dateRange, customFrom, customTo]);

  // Source set: the full multi-page fetch while filtering, otherwise just
  // the current server page.
  const sourceItems = hasClientFilters ? filterModeItems : items;

  const filteredItems = useMemo(() => {
    return sourceItems.filter((g) => {
      if (fromBound || toBound) {
        const t = g.gameStartTime ? new Date(g.gameStartTime).getTime() : NaN;
        if (Number.isNaN(t)) return false;
        if (fromBound && t < fromBound) return false;
        if (toBound && t > toBound) return false;
      }
      if (diffCode) {
        if ((g.diffCode || "").toUpperCase() !== diffCode) return false;
      }
      if (timerMin) {
        const wanted = Number(timerMin);
        const raw = g.timer;
        if (raw === undefined || raw === null || raw === "") return false;
        const rawNum = Number(raw);
        // timer might be stored in minutes or seconds depending on backend
        if (rawNum !== wanted && rawNum !== wanted * 60) return false;
      }
      return true;
    });
  }, [sourceItems, fromBound, toBound, diffCode, timerMin]);

  // Rows actually rendered: locally paginate the filtered set when in
  // filter mode, otherwise show the server page as-is.
  const pageItems = hasClientFilters
    ? filteredItems.slice((page - 1) * limit, page * limit)
    : filteredItems;

  const pageHasMore = hasClientFilters
    ? filteredItems.length > page * limit
    : hasMore;

  const isLoading = hasClientFilters ? filterModeLoading : loading;

  const clearFilters = () => {
    setDiffCode("");
    setTimerMin("");
    setDateRange("");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  return (
    <>
      <PageMeta
        title="Game Logs | Admin"
        description="Browse PvP and Computer game logs"
      />
      <PageBreadcrumb pageTitle="Game Logs" />

      <div className="space-y-6">
        <ComponentCard
          title={`Game Logs (${total}) — PvP ${totalPvp} / Computer ${totalComputer}${
            hasClientFilters
              ? ` — ${filteredItems.length} match filters`
              : ""
          }`}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-end gap-3 justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <Select
                  key={`type-${type}`}
                  placeholder="Type"
                  defaultValue={type}
                  options={typeOptions}
                  onChange={(v) => {
                    setPage(1);
                    setType(v || "all");
                  }}
                />
              </div>
              <div className="w-56">
                <Input
                  placeholder="Filter by Player ID..."
                  value={playerIdInput}
                  onChange={(e) => setPlayerIdInput(e.target.value)}
                />
              </div>
              <div className="w-32">
                <Select
                  key={`diff-${diffCode}`}
                  placeholder="Diff Code"
                  defaultValue={diffCode}
                  options={diffCodeOptions}
                  onChange={(v) => {
                    setPage(1);
                    setDiffCode(v);
                  }}
                />
              </div>
              <div className="w-32">
                <Select
                  key={`timer-${timerMin}`}
                  placeholder="Timer"
                  defaultValue={timerMin}
                  options={timerOptions}
                  onChange={(v) => {
                    setPage(1);
                    setTimerMin(v);
                  }}
                />
              </div>
              <div className="w-40">
                <Select
                  key={`daterange-${dateRange}`}
                  placeholder="Date Range"
                  defaultValue={dateRange}
                  options={dateRangeOptions}
                  onChange={(v) => {
                    setPage(1);
                    setDateRange(v);
                  }}
                />
              </div>
              {dateRange === "custom" && (
                <div className="flex items-end gap-2">
                  <div>
                    <label className="block mb-1 text-xs text-gray-400 dark:text-gray-500">
                      From
                    </label>
                    <Input
                      type="date"
                      className="w-36"
                      value={customFrom}
                      onChange={(e) => {
                        setPage(1);
                        setCustomFrom(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-400 dark:text-gray-500">
                      To
                    </label>
                    <Input
                      type="date"
                      className="w-36"
                      value={customTo}
                      onChange={(e) => {
                        setPage(1);
                        setCustomTo(e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}
              {hasClientFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {hasClientFilters && (
            <p className="text-xs text-gray-400 dark:text-gray-500 -mt-3">
              {filterModeLoading
                ? "Scanning games to apply filters..."
                : filterModeCapped
                ? `Scanned the first ${FILTER_FETCH_MAX_PAGES * FILTER_FETCH_PAGE_SIZE} games matching Type/Player — narrow by player if older games are missing.`
                : `Scanned all ${filterModeItems.length} games matching Type/Player.`}
            </p>
          )}

          {/* Table */}
          <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  {[
                    "Mode",
                    "Players",
                    "Score",
                    "Winner",
                    "Diff",
                    "Started",
                    "Actions",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-400"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-400"
                    >
                      {hasClientFilters
                        ? "No games match the filters."
                        : "No game logs found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((g) => {
                    const isPvp = g.logType === "pvp";
                    const players = isPvp
                      ? `${g.player1Username || "-"} vs ${
                          g.player2Username || "-"
                        }`
                      : `${g.playerId || "-"} vs Computer`;
                    const score = isPvp
                      ? `${g.finalScorePlayer1 ?? "-"} : ${
                          g.finalScorePlayer2 ?? "-"
                        }`
                      : `${g.finalPlayerScore ?? "-"} : ${
                          g.finalComputerScore ?? "-"
                        }`;
                    return (
                      <TableRow key={`${g.logType}-${g.validateId}`}>
                        <TableCell className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                              isPvp
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                                : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400"
                            }`}
                          >
                            {g.logType}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[220px] truncate">
                          {players}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {score}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {g.winner || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {g.diffCode || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatDate(g.gameStartTime)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <button
                            className="text-brand-500 hover:underline"
                            onClick={() =>
                              navigate(`/game-logs/${g.logType}/${g.validateId}`)
                            }
                          >
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pageHasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}