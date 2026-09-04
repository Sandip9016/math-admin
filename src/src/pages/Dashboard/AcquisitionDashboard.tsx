import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";
import LineChartOne from "../../components/charts/line/LineChartOne";
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
  totalDownloads: "1,00,000",
  totalUninstalls: 500,
  totalSignUps: "5,000",
  activeUsers: "10,000",
  dau: "12,000",
  avgTimePerSession: "67 sec",
  avgTimePerUserPerDay: "90 sec",
};

const osCols = ["iOS", "Android"] as const;
const sourceRows = ["Source A", "Source B", "Source C"];

type OsSourceRow = { source: string; ios: number; android: number; total: number };

const downloadsDetails: OsSourceRow[] = sourceRows.map((source) => ({
  source,
  ios: 10,
  android: 20,
  total: 30,
}));

const signUpDetails: OsSourceRow[] = sourceRows.map((source) => ({
  source,
  ios: 10,
  android: 20,
  total: 30,
}));

const osCountRows = ["iOS", "Android", "Others"];

type OsCountRow = { os: string; count: number };

const uninstalls: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

const retention: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

const avgTimePerSession: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

const avgTimePerDayPerUser: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

const dauByOs: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

const mauByOs: OsCountRow[] = [
  { os: "iOS", count: 10 },
  { os: "Android", count: 20 },
  { os: "Others", count: 30 },
];

type ActiveDauMauRow = { os: string; activeUser: number; dau: number; mau: number };

const signUpActiveDauMau: ActiveDauMauRow[] = [
  { os: "iOS", activeUser: 10, dau: 20, mau: 30 },
  { os: "Android", activeUser: 10, dau: 20, mau: 30 },
  { os: "Others", activeUser: 10, dau: 20, mau: 30 },
];

const funnelSteps = [
  "Splash Screen",
  "Language Selector",
  "Sign Up Page 1",
  "Sign Up OTP",
  "Theme",
  "Demo",
  "Home",
];
const funnelCounts = [100, 100, 95, 60, 75, 60, 50];

const failureCols = ["No Opponent v No Opponent", "Socket Issue"];

function sum(rows: OsCountRow[]) {
  return rows.reduce((acc, r) => acc + r.count, 0);
}

export default function AcquisitionDashboard() {
  const [dateRange, setDateRange] = useState("");
  const [osType, setOsType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [gameType, setGameType] = useState("");

  return (
    <>
      <PageMeta
        title="mATHLETICS Acquisition Dashboard"
        description="mATHLETICS acquisition dashboard: downloads, sign ups, uninstalls, retention and DAU/MAU."
      />

      <div className="space-y-6">
        {/* Filter bar */}
        <ComponentCard title="mATHLETICS Acquisition Dashboard">
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
          <KpiPair
            labelA="Total Downloads"
            valueA={kpis.totalDownloads}
            labelB="Total Uninstalls"
            valueB={kpis.totalUninstalls}
          />
          <KpiPair
            labelA="Total Sign Ups"
            valueA={kpis.totalSignUps}
            labelB="Active Users"
            valueB={kpis.activeUsers}
            highlightB
          />
          <KpiPair labelA="DAU" valueA={kpis.dau} labelB="Active Users" valueB={kpis.activeUsers} highlightB />
          <KpiPair
            labelA="Avg Time per Session"
            valueA={kpis.avgTimePerSession}
            labelB="Avg Time per User / Day"
            valueB={kpis.avgTimePerUserPerDay}
          />
        </div>

        {/* Line chart */}
        <ComponentCard title="Month Wise Downloads / Sign Up / Uninstalls">
          <LineChartOne />
        </ComponentCard>

        {/* Downloads Details + Sign Up Details */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <OsSourceTable title="Downloads Details" rows={downloadsDetails} />
          <OsSourceTable title="Sign Up Details" rows={signUpDetails} />
        </div>

        {/* Uninstalls + Retention + Sign Up Details (Active User / DAU / MAU) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <OsCountTable title="Uninstalls" rows={uninstalls} />
          <OsCountTable title="Retention" rows={retention} />
          <ActiveDauMauTable title="Sign Up Details" rows={signUpActiveDauMau} />
        </div>

        {/* Avg Time per Session + Avg Time per Day Per User + DAU + MAU */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <OsCountTable title="Avg Time per Session" rows={avgTimePerSession} />
          <OsCountTable title="Avg Time per Day Per User" rows={avgTimePerDayPerUser} />
          <OsCountTable title="DAU" rows={dauByOs} />
          <OsCountTable title="MAU" rows={mauByOs} />
        </div>

        {/* Sign Up Funnel */}
        <ComponentCard title="Sign Up Funnel">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    &nbsp;
                  </TableCell>
                  {funnelSteps.map((step) => (
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
                  {funnelCounts.map((c, i) => (
                    <TableCell key={i} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        {/* Failure for Sign In / Sign Up */}
        <ComponentCard title="Failure for Sign In / Sign Up">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    &nbsp;
                  </TableCell>
                  {failureCols.map((col) => (
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
                <TableRow>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Count of Users
                  </TableCell>
                  {failureCols.map((col) => (
                    <TableCell key={col} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
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
      </div>
    </>
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

function OsSourceTable({ title, rows }: { title: string; rows: OsSourceRow[] }) {
  const iosTotal = rows.reduce((acc, r) => acc + r.ios, 0);
  const androidTotal = rows.reduce((acc, r) => acc + r.android, 0);
  const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);

  return (
    <ComponentCard title={title}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Source | OS Type
              </TableCell>
              {osCols.map((col) => (
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
            {rows.map((row) => (
              <TableRow key={row.source}>
                <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {row.source}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.ios}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.android}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {row.total}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 dark:bg-white/[0.03]">
              <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {iosTotal}
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {androidTotal}
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {grandTotal}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
}

function OsCountTable({ title, rows }: { title: string; rows: OsCountRow[] }) {
  return (
    <ComponentCard title={title}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                OS Type
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Count
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <TableRow key={row.os}>
                <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {row.os}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.count}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 dark:bg-white/[0.03]">
              <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {sum(rows)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
}

function ActiveDauMauTable({ title, rows }: { title: string; rows: ActiveDauMauRow[] }) {
  const activeTotal = rows.reduce((acc, r) => acc + r.activeUser, 0);
  const dauTotal = rows.reduce((acc, r) => acc + r.dau, 0);
  const mauTotal = rows.reduce((acc, r) => acc + r.mau, 0);

  return (
    <ComponentCard title={title}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                OS Type
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Active User
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                DAU
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                MAU
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <TableRow key={row.os}>
                <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {row.os}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.activeUser}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.dau}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {row.mau}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 dark:bg-white/[0.03]">
              <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {activeTotal}
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {dauTotal}
              </TableCell>
              <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {mauTotal}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
}
