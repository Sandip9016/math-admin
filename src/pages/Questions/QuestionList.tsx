import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { useToast } from "../../context/ToastContext";
import {
  getQuestions,
  deleteQuestion,
  restoreQuestion,
  enableQuestion,
  disableQuestion,
  downloadQuestionsExport,
} from "../../api/question.api";
import { PencilIcon, TrashBinIcon, PieChartIcon } from "../../icons";
import QuestionFormModal, {
  symbolOptions,
} from "../../components/questions/QuestionFormModal";
import QuestionAnalyticsModal from "../../components/questions/QuestionAnalyticsModal";
import QuestionImportModal from "../../components/questions/QuestionImportModal";

interface QuestionRow {
  _id: string;
  questionKey: string;
  questionLevel: string;
  difficulty: string;
  question: string;
  input1: number;
  input2: number;
  answer: number;
  symbol: string;
  finalLevel: number;
  active: boolean;
  status: "enabled" | "disabled" | "deleted";
}

// "" = All (enabled + disabled). Deleted hidden unless Deleted tab.
const statusTabs = [
  { value: "", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
  { value: "deleted", label: "Deleted" },
];

const statusBadge: Record<string, { cls: string; label: string }> = {
  enabled: {
    cls: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
    label: "Enabled",
  },
  disabled: {
    cls: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
    label: "Disabled",
  },
  deleted: {
    cls: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
    label: "Deleted",
  },
};

const difficultyOptions = [
  { value: "", label: "All difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

// "All" has value "" so a chosen filter can be cleared again.
const finalLevelOptions = [
  { value: "", label: "All levels" },
  ...Array.from({ length: 11 }, (_, i) => ({
    value: String(i),
    label: i === 0 ? "Level 0 (disabled)" : `Level ${i}`,
  })),
];

export default function QuestionList() {
  const { showToast } = useToast();

  const [items, setItems] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [finalLevel, setFinalLevel] = useState("");
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<QuestionRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      if (finalLevel !== "") params.finalLevel = finalLevel;
      if (symbol) params.symbol = symbol;
      if (status) params.status = status;

      const res: any = await getQuestions(params);
      setItems(res.items || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to load questions", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, difficulty, finalLevel, symbol, status]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // debounce search box -> search param
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuestion(deleteTarget._id);
      showToast("Question deleted", "success");
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err) {
      showToast(typeof err === "string" ? err : "Delete failed", "error");
    }
  };

  // enable / disable / restore -> refresh list so badge + buttons match server
  const handleStatusAction = async (
    q: QuestionRow,
    action: "enable" | "disable" | "restore"
  ) => {
    try {
      if (action === "enable") await enableQuestion(q._id);
      else if (action === "disable") await disableQuestion(q._id);
      else await restoreQuestion(q._id);
      showToast(
        action === "restore"
          ? "Restored as disabled. Enable it to use it in games."
          : action === "enable"
          ? "Question enabled"
          : "Question disabled",
        "success"
      );
      fetchQuestions();
    } catch (err) {
      showToast(typeof err === "string" ? err : `${action} failed`, "error");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadQuestionsExport();
      showToast("Export downloaded", "success");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Question Management | Admin"
        description="Manage math game questions"
      />
      <PageBreadcrumb pageTitle="Questions" />

      <div className="space-y-6">
        <ComponentCard title={`Questions (${total})`}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-end gap-3 justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-56">
                <Input
                  placeholder="Search key or question text..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Select
                  key={`diff-${difficulty}`}
                  placeholder="Difficulty"
                  defaultValue={difficulty}
                  options={difficultyOptions}
                  onChange={(v) => {
                    setPage(1);
                    setDifficulty(v);
                  }}
                />
              </div>
              <div className="w-40">
                <Select
                  key={`level-${finalLevel}`}
                  placeholder="Final Level"
                  defaultValue={finalLevel}
                  options={finalLevelOptions}
                  onChange={(v) => {
                    setPage(1);
                    setFinalLevel(v);
                  }}
                />
              </div>
              <div className="w-40">
                <Select
                  key={`symbol-${symbol}`}
                  placeholder="Symbol"
                  defaultValue={symbol}
                  options={[{ value: "", label: "All symbols" }, ...symbolOptions]}
                  onChange={(v) => {
                    setPage(1);
                    setSymbol(v);
                  }}
                />
              </div>
              <div className="flex gap-1 pb-1">
                {statusTabs.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setStatus(t.value);
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      status === t.value
                        ? "bg-brand-500 text-white border-brand-500"
                        : "text-gray-600 border-gray-200 dark:text-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                Import Excel
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exporting..." : "Export Excel"}
              </Button>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormOpen(true);
                }}
              >
                + Add Question
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-3">
            Importing adds new questions and updates existing ones (same
            symbol + input 1 + input 2) when any field differs. Updates
            cannot be undone. Import never enables a question; deleted
            questions are skipped.
          </p>

          {/* Table */}
          <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  {[
                    "Key",
                    "Level",
                    "Difficulty",
                    "Question",
                    "In1",
                    "In2",
                    "Answer",
                    "Symbol",
                    "Final Lvl",
                    "Status",
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="px-4 py-6 text-center text-sm text-gray-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="px-4 py-6 text-center text-sm text-gray-400">
                      No questions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((q) => (
                    <TableRow key={q._id}>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[160px] truncate">
                        {q.questionKey}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.questionLevel}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm capitalize text-gray-700 dark:text-gray-300">
                        {q.difficulty}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                        {q.question}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.input1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.input2}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.answer}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.symbol}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {q.finalLevel}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            (statusBadge[q.status] || statusBadge.disabled).cls
                          }`}
                        >
                          {(statusBadge[q.status] || statusBadge.disabled).label}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {q.status === "deleted" ? (
                            <button
                              className="text-brand-500 hover:underline"
                              onClick={() => handleStatusAction(q, "restore")}
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              {/* toggle: on = enabled. Level 0 cannot be enabled */}
                              <button
                                type="button"
                                role="switch"
                                aria-checked={q.status === "enabled"}
                                title={
                                  q.status === "enabled"
                                    ? "Disable"
                                    : q.finalLevel > 0
                                    ? "Enable"
                                    : "Set Final Level above 0 to enable"
                                }
                                disabled={q.status !== "enabled" && q.finalLevel <= 0}
                                onClick={() =>
                                  handleStatusAction(
                                    q,
                                    q.status === "enabled" ? "disable" : "enable"
                                  )
                                }
                                className={`relative h-6 w-11 shrink-0 rounded-full transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                                  q.status === "enabled"
                                    ? "bg-brand-500"
                                    : "bg-gray-200 dark:bg-white/10"
                                }`}
                              >
                                <span
                                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-theme-sm transition duration-150 ${
                                    q.status === "enabled" ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <button
                                title="Edit"
                                aria-label="Edit"
                                className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                onClick={() => {
                                  setEditingId(q._id);
                                  setFormOpen(true);
                                }}
                              >
                                <PencilIcon className="size-5" />
                              </button>
                              <button
                                title="Analytics"
                                aria-label="Analytics"
                                className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                                onClick={() => setAnalyticsId(q._id)}
                              >
                                <PieChartIcon className="size-5" />
                              </button>
                              <button
                                title="Delete"
                                aria-label="Delete"
                                className="text-error-500 hover:text-error-600"
                                onClick={() => setDeleteTarget(q)}
                              >
                                <TrashBinIcon className="size-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
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
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {formOpen && (
        <QuestionFormModal
          questionId={editingId}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchQuestions();
          }}
        />
      )}

      {analyticsId && (
        <QuestionAnalyticsModal
          questionId={analyticsId}
          onClose={() => setAnalyticsId(null)}
        />
      )}

      {importOpen && (
        <QuestionImportModal
          onClose={() => setImportOpen(false)}
          onImported={() => {
            // keep modal open so the admin can read the import result
            fetchQuestions();
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleteTarget}
        message="Delete this question? It is disabled and hidden from the normal list. You can restore it later (comes back disabled)."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}