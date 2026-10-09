import { useState, useRef } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useToast } from "../../context/ToastContext";
import { importQuestions } from "../../api/question.api";

interface Props {
  onClose: () => void;
  onImported: () => void;
}

interface SkippedRow {
  row: number;
  errors: string[];
}

interface DuplicateRow {
  row: number;
  questionKey?: string;
  reason: string;
}

interface UpdatedRow {
  row: number;
  questionId: string;
  questionKey: string;
  changes: Record<string, { from: unknown; to: unknown }>;
}

interface ImportResult {
  message?: string;
  addedCount: number;
  enabledCount: number;
  disabledCount: number;
  updatedCount: number;
  updatedRows: UpdatedRow[];
  unchangedCount: number;
  repeatedInFileCount: number;
  deletedMatchCount: number;
  duplicateCount: number;
  duplicateRows: DuplicateRow[];
  skippedCount: number;
  skippedRows: SkippedRow[];
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const fmt = (v: unknown) => (v === null || v === undefined || v === "" ? "(empty)" : String(v));

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function QuestionImportModal({ onClose, onImported }: Props) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (f: File | null) => {
    setError(null);
    setResult(null);
    if (!f) {
      setFile(null);
      return;
    }
    const isValidExt = /\.(xlsx|xls)$/i.test(f.name);
    if (!isValidExt) {
      setError("Only .xlsx or .xls files are accepted.");
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File is too large — max 10MB.");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res: any = await importQuestions(file);
      setResult({
        message: res.message,
        addedCount: res.addedCount || 0,
        enabledCount: res.enabledCount || 0,
        disabledCount: res.disabledCount || 0,
        updatedCount: res.updatedCount || 0,
        updatedRows: res.updatedRows || [],
        unchangedCount: res.unchangedCount || 0,
        repeatedInFileCount: res.repeatedInFileCount || 0,
        deletedMatchCount: res.deletedMatchCount || 0,
        duplicateCount: res.duplicateCount || 0,
        duplicateRows: res.duplicateRows || [],
        skippedCount: res.skippedCount || 0,
        skippedRows: res.skippedRows || [],
      });
      showToast(
        res.message || `${res.addedCount} added, ${res.updatedCount} updated.`,
        res.skippedCount ? "info" : "success"
      );
      onImported(); // refresh list behind the modal; modal stays open for the result
    } catch (err) {
      setError(typeof err === "string" ? err : "Import failed");
    } finally {
      setUploading(false);
    }
  };

  // Updates cannot be undone, so let the admin keep a record (first 200 only).
  const downloadUpdated = () => {
    if (!result) return;
    const lines = ["row,questionId,questionKey,field,from,to"];
    result.updatedRows.forEach((u) =>
      Object.entries(u.changes).forEach(([field, c]) =>
        lines.push(
          [u.row, u.questionId, u.questionKey, field, c.from, c.to].map(csvCell).join(",")
        )
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_import_updated.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sectionTitle = "text-sm font-semibold text-gray-800 dark:text-white/90";
  const listBox =
    "mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-100 p-2 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-300 space-y-1";

  return (
    <Modal isOpen onClose={onClose} className="max-w-3xl m-4">
      <div className="p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Import from Excel
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          A row is matched with existing questions by symbol + input 1 + input 2.
          No match: added. Match with any different field: the existing question
          is <strong>updated</strong> (cannot be undone). Match with no
          difference: ignored. Match with only a deleted question: skipped
          (restore it first). Blank cells never erase values. Final Level 0 =
          disabled. Import never enables a question: use Enable in the panel.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Columns (names must match exactly): Question Level, Difficulty,
          Question, Input 1, Input 2, Answer, Symbol, Valid, Combo, Final Level.
          Required: Difficulty, Input 1, Input 2, Answer, Symbol, Final Level.
        </p>
        <a
          href="/question-import-template.xlsx"
          download
          className="mb-4 inline-block text-xs text-brand-500 hover:underline"
        >
          Download template
        </a>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-white/5 dark:file:text-brand-400"
        />

        {error && <p className="mt-3 text-sm text-error-500 whitespace-pre-line">{error}</p>}

        {result && (
          <div className="mt-4 space-y-4">
            {result.message && (
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.message}</p>
            )}

            {/* Added */}
            <div>
              <p className={sectionTitle}>Added: {result.addedCount}</p>
              {result.addedCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {result.enabledCount} enabled, {result.disabledCount} disabled (Final Level 0)
                </p>
              )}
            </div>

            {/* Updated */}
            <div>
              <div className="flex items-center justify-between">
                <p className={sectionTitle}>Updated: {result.updatedCount}</p>
                {result.updatedRows.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadUpdated}>
                    Download updated list
                  </Button>
                )}
              </div>
              {result.updatedRows.length > 0 && (
                <div className={listBox}>
                  {result.updatedRows.map((u) => (
                    <div key={`${u.row}-${u.questionId}`}>
                      <span className="font-medium">Row {u.row}</span> · {u.questionKey}
                      {Object.entries(u.changes).map(([field, c]) => (
                        <div key={field} className="pl-3">
                          {field === "active" ? "enabled/disabled" : field}: {fmt(c.from)} →{" "}
                          {fmt(c.to)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {result.updatedCount > result.updatedRows.length && (
                <p className="text-xs text-gray-400">
                  Showing first {result.updatedRows.length} updates.
                </p>
              )}
            </div>

            {/* Ignored */}
            <div>
              <p className={sectionTitle}>Ignored: {result.duplicateCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {result.unchangedCount} no change, {result.repeatedInFileCount} repeated in
                file, {result.deletedMatchCount} match a deleted question
              </p>
              {result.duplicateRows.length > 0 && (
                <div className={listBox}>
                  {result.duplicateRows.map((d) => (
                    <div key={d.row}>
                      Row {d.row}{d.questionKey ? ` · ${d.questionKey}` : ""}: {d.reason}
                    </div>
                  ))}
                </div>
              )}
              {result.duplicateCount > result.duplicateRows.length && (
                <p className="text-xs text-gray-400">
                  Showing first {result.duplicateRows.length} rows.
                </p>
              )}
            </div>

            {/* Invalid */}
            <div>
              <p className={sectionTitle}>Invalid (skipped): {result.skippedCount}</p>
              {result.skippedRows.length > 0 && (
                <div className={listBox}>
                  {result.skippedRows.map((r) => (
                    <div key={r.row}>
                      Row {r.row}: {r.errors.join(", ")}
                    </div>
                  ))}
                </div>
              )}
              {result.skippedCount > result.skippedRows.length && (
                <p className="text-xs text-gray-400">
                  Showing first {result.skippedRows.length} errors.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}