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
  downloadQuestionsExport,
} from "../../api/question.api";
import QuestionFormModal from "../../components/questions/QuestionFormModal";
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
}

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const finalLevelOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Level ${i + 1}`,
}));

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
  const [showInactive, setShowInactive] = useState(false);

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
      if (finalLevel) params.finalLevel = finalLevel;
      if (showInactive) params.active = "false";

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
  }, [page, limit, search, difficulty, finalLevel, showInactive]);

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
      showToast("Question deactivated", "success");
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err) {
      showToast(typeof err === "string" ? err : "Delete failed", "error");
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
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 pb-3">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => {
                    setPage(1);
                    setShowInactive(e.target.checked);
                  }}
                />
                Show deleted
              </label>
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
            Importing an Excel file always adds new questions — it never
            overwrites existing rows, even if the question key matches.
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
                    "Active",
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
                            q.active
                              ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                              : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                          }`}
                        >
                          {q.active ? "Active" : "Deleted"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm whitespace-nowrap space-x-2">
                        <button
                          className="text-brand-500 hover:underline"
                          onClick={() => {
                            setEditingId(q._id);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-brand-500 hover:underline"
                          onClick={() => setAnalyticsId(q._id)}
                        >
                          Analytics
                        </button>
                        {q.active && (
                          <button
                            className="text-error-500 hover:underline"
                            onClick={() => setDeleteTarget(q)}
                          >
                            Delete
                          </button>
                        )}
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
            setImportOpen(false);
            fetchQuestions();
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleteTarget}
        message="Delete this question? It will no longer appear in games. All historical analytics are preserved."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
