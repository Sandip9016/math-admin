import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../ui/table";
import { useToast } from "../../context/ToastContext";
import { getQuestionAnalytics } from "../../api/question.api";

interface Props {
  questionId: string;
  onClose: () => void;
}

interface Band {
  asked: number;
  correct: number;
  incorrect: number;
  skipped: number;
  correctPct: number;
  incorrectPct: number;
  skippedPct: number;
  avgTimeCorrectSec: number;
  minTimeMs: number | null;
  maxTimeMs: number | null;
}

const bandOrder: { key: string; label: string }[] = [
  { key: "le400", label: "≤ 400" },
  { key: "b401_800", label: "401 – 800" },
  { key: "b801_1200", label: "801 – 1200" },
  { key: "b1201_1600", label: "1201 – 1600" },
  { key: "b1601_2000", label: "1601 – 2000" },
  { key: "gt2000", label: "> 2000" },
];

export default function QuestionAnalyticsModal({ questionId, onClose }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bands, setBands] = useState<Record<string, Band> | null>(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getQuestionAnalytics(questionId);
        const analytics = res.analytics;
        if (!analytics.bands || Object.keys(analytics.bands).length === 0) {
          setNoData(true);
        } else {
          setBands(analytics.bands);
        }
      } catch (err) {
        showToast(typeof err === "string" ? err : "Failed to load analytics", "error");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  return (
    <Modal isOpen onClose={onClose} className="max-w-3xl m-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Question Analytics
        </h3>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : noData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No plays recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  {["Band", "Asked", "Correct %", "Incorrect %", "Skipped %", "Avg Time (s)", "Fastest / Slowest"].map(
                    (h) => (
                      <TableCell
                        key={h}
                        isHeader
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bandOrder.map(({ key, label }) => {
                  const b = bands?.[key];
                  if (!b) return null;
                  return (
                    <TableRow key={key}>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {label}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.asked}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.correctPct}%
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.incorrectPct}%
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.skippedPct}%
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.avgTimeCorrectSec}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {b.minTimeMs != null ? `${(b.minTimeMs / 1000).toFixed(2)}s` : "-"}
                        {" / "}
                        {b.maxTimeMs != null ? `${(b.maxTimeMs / 1000).toFixed(2)}s` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Modal>
  );
}
