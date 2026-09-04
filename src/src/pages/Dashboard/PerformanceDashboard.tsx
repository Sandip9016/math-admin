import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  getPvpGamePlayedDetails,
  getComputerGamePlayedDetails,
} from "../../api/gamePlayedDetails.api.js";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// ---- Option lists (mirrors sheet's Option List 1-4) ----
const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

const osTypeOptions = [
  { value: "android", label: "Android" },
  { value: "windows", label: "Windows" },
  { value: "ios", label: "iOS" },
  { value: "others", label: "Others" },
];

const difficultyOptions = [
  { value: "e2", label: "E2" },
  { value: "e4", label: "E4" },
  { value: "m2", label: "M2" },
  { value: "m4", label: "M4" },
  { value: "h2", label: "H2" },
  { value: "h4", label: "H4" },
];

const gameTypeOptions = [
  { value: "pvp", label: "Play - PvP" },
  { value: "practice", label: "Practice" },
  { value: "computer_l1", label: "Play - Computer L1" },
  { value: "computer_l2", label: "Play - Computer L2" },
  { value: "computer_l3", label: "Play - Computer L3" },
  { value: "computer_l4", label: "Play - Computer L4" },
  { value: "computer_l5", label: "Play - Computer L5" },
  { value: "friends", label: "Play - Friends" },
];

// ---- Mock data (mirrors sheet's sample numbers) ----
const kpis = {
  activeUsers: 1000,
  dau: 1000,
  gamesPlayed: 500,
  totalSignUps: 5000,
  activeUsersDifficulty: 10000,
  dauDifficulty: 12000,
  avgTimePerSession: "67 sec",
  avgTimePerUserPerDay: "90 sec",
};

const gameCountCols = ["0", "1", "2 - 10", "11 - 50", "50+"];
const gamesPlayedRows = ["0 - 1", "2 - 10", "10 - 30", "30+"];

const gameModeDurationCols = ["1 min", "2 min", "3 min"] as const;

type GamePlayedRow = {
  diffCode: string;
  "1 min": number;
  "2 min": number;
  "3 min": number;
  total: number;
};

type GamePlayedDetails = {
  success: boolean;
  mode: string;
  rows: GamePlayedRow[];
  columnTotals: { "1 min": number; "2 min": number; "3 min": number };
  grandTotal: number;
};

const timeToGameBins = [
  "< 10 min",
  "10 - 30 min",
  "30 - 6 hr",
  "6 hr - 24 hr",
  "1 day - 5 day",
  "6 day - 15 day",
  "16 day - 30 day",
];

const funnelSteps = {
  pvp: [
    "Home Page",
    "Play Selector",
    "Opponent Selector",
    "PvP Loader",
    "PvP Connection",
    "Game Start",
    "Game End",
  ],
  practice: [
    "Home Page",
    "Practice",
    "Opponent Selector",
    "PvP Loader",
    "PvP Connection",
    "Game Start",
    "Game End",
  ],
  computer: [
    "Home Page",
    "Practice",
    "Opponent Selector",
    "Computer Level",
    "Computer Loader",
    "Game Start",
    "Game End",
  ],
};
const funnelCounts = [100, 100, 95, 80, 75, 60, 50];

const failureCols = ["No Opponent", "No Opponent", "Socket Issue"];

export default function PerformanceDashboard() {
  const [dateRange, setDateRange] = useState("");
  const [osType, setOsType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [gameType, setGameType] = useState("");

  const [pvpDetails, setPvpDetails] = useState<GamePlayedDetails | null>(null);
  const [computerDetails, setComputerDetails] =
    useState<GamePlayedDetails | null>(null);

  useEffect(() => {
    getPvpGamePlayedDetails()
      .then((res: any) => setPvpDetails(res))
      .catch(() => setPvpDetails(null));
    getComputerGamePlayedDetails()
      .then((res: any) => setComputerDetails(res))
      .catch(() => setComputerDetails(null));
  }, []);

  return (
    <>
      <PageMeta
        title="mATHLETICS Performance Dashboard"
        description="mATHLETICS performance dashboard: active users, games played, funnels and failures."
      />

      <div className="space-y-6">
        {/* Filter bar */}
        <ComponentCard title="mATHLETICS Performance Dashboard">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              options={dateRangeOptions}
              placeholder="Date Range"
              onChange={setDateRange}
              defaultValue={dateRange}
            />
            <Select
              options={osTypeOptions}
              placeholder="OS Type"
              onChange={setOsType}
              defaultValue={osType}
            />
            <Select
              options={difficultyOptions}
              placeholder="Game Difficulty"
              onChange={setDifficulty}
              defaultValue={difficulty}
            />
            <Select
              options={gameTypeOptions}
              placeholder="Game Type"
              onChange={setGameType}
              defaultValue={gameType}
            />
          </div>
        </ComponentCard>

        {/* KPI strip */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiPair labelA="Active Users" valueA={kpis.activeUsers} labelB="DAU" valueB={kpis.dau} highlightB />
          <KpiPair labelA="Games Played" valueA={kpis.gamesPlayed} labelB="Total Sign Ups" valueB={kpis.totalSignUps} />
          <KpiPair labelA="Active Users" valueA={kpis.activeUsersDifficulty} labelB="DAU" valueB={kpis.dauDifficulty} highlightB />
          <KpiPair labelA="Avg Time per Session" valueA={kpis.avgTimePerSession} labelB="Avg Time per User / Day" valueB={kpis.avgTimePerUserPerDay} />
        </div>

        {/* Games Played matrix */}
        <ComponentCard title="Games Played">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Days | Game Count
                  </TableCell>
                  {gameCountCols.map((col) => (
                    <TableCell key={col} isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {col}
                    </TableCell>
                  ))}
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Total
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {gamesPlayedRows.map((row) => (
                  <TableRow key={row}>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {row}
                    </TableCell>
                    {gameCountCols.map((col) => (
                      <TableCell key={col} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        -
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      -
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        {/* Game Played Details (PvP + Computer) + Time to 1st Game */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <GamePlayedDetailsTable title="Game Played Details — PvP" data={pvpDetails} />
          <GamePlayedDetailsTable title="Game Played Details — Computer" data={computerDetails} />

          <ComponentCard title="Time to 1st Game">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Game Modes
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      1st Game
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      5th Game
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {timeToGameBins.map((bin) => (
                    <TableRow key={bin}>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {bin}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        -
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        -
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>

        {/* Play Game Funnel */}
        <ComponentCard title="Play Game Funnel">
          <div className="space-y-6">
            <FunnelTable label="PvP" steps={funnelSteps.pvp} counts={funnelCounts} />
            <FunnelTable label="Practice" steps={funnelSteps.practice} counts={funnelCounts} />
            <FunnelTable label="Computer" steps={funnelSteps.computer} counts={funnelCounts} />
          </div>
        </ComponentCard>

        {/* Failure for PvP */}
        <ComponentCard title="Failure for PvP">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    &nbsp;
                  </TableCell>
                  {failureCols.map((col, i) => (
                    <TableCell key={i} isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {col}
                    </TableCell>
                  ))}
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Total
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableRow>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Count of Users
                  </TableCell>
                  {failureCols.map((_, i) => (
                    <TableCell key={i} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      -
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    -
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        {/* Page Matrix */}
        <ComponentCard title="Page Matrix">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Page
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Count of Users
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableRow>
                  <TableCell className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500" colSpan={2}>
                    No data yet
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

function GamePlayedDetailsTable({
  title,
  data,
}: {
  title: string;
  data: GamePlayedDetails | null;
}) {
  const rows = data?.rows ?? [];
  return (
    <ComponentCard title={title}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Diff
              </TableCell>
              {gameModeDurationCols.map((col) => (
                <TableCell key={col} isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {col}
                </TableCell>
              ))}
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Total
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500" colSpan={5}>
                  No data yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.diffCode}>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {row.diffCode}
                  </TableCell>
                  {gameModeDurationCols.map((col) => (
                    <TableCell key={col} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      {row[col]}
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {row.total}
                  </TableCell>
                </TableRow>
              ))
            )}
            {data && (
              <TableRow className="bg-gray-50 dark:bg-white/[0.03]">
                <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total
                </TableCell>
                {gameModeDurationCols.map((col) => (
                  <TableCell key={col} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {data.columnTotals[col]}
                  </TableCell>
                ))}
                <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {data.grandTotal}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
}

function KpiPair({
  labelA,
  valueA,
  labelB,
  valueB,
  highlightB = false,
}: {
  labelA: string;
  valueA: string | number;
  labelB: string;
  valueB: string | number;
  highlightB?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{labelA}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {valueA}
        </span>
      </div>
      <div
        className={`mt-3 flex items-center justify-between rounded-lg px-2 py-1.5 ${
          highlightB ? "bg-success-50 dark:bg-success-500/15" : ""
        }`}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">{labelB}</span>
        <span
          className={`text-sm font-semibold ${
            highlightB
              ? "text-success-600 dark:text-success-500"
              : "text-gray-800 dark:text-white/90"
          }`}
        >
          {valueB}
        </span>
      </div>
    </div>
  );
}

function FunnelTable({
  label,
  steps,
  counts,
}: {
  label: string;
  steps: string[];
  counts: number[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                &nbsp;
              </TableCell>
              {steps.map((step) => (
                <TableCell key={step} isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {step}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            <TableRow>
              <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Count of Users
              </TableCell>
              {counts.map((c, i) => (
                <TableCell key={i} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {c}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
