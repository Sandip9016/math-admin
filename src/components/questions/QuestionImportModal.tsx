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

interface ImportResult {
  addedCount: number;
  skippedCount: number;
  skippedRows: SkippedRow[];
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
        addedCount: res.addedCount,
        skippedCount: res.skippedCount,
        skippedRows: res.skippedRows || [],
      });
      showToast(
        `${res.addedCount} questions added${res.skippedCount ? `, ${res.skippedCount} rows skipped` : ""}.`,
        res.skippedCount ? "info" : "success"
      );
      onImported();
    } catch (err) {
      setError(typeof err === "string" ? err : "Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl m-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Import from Excel
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Uploading will add these as new questions. To edit an existing
          question, use the Edit screen instead. Accepted headers: Question
          Key, Question Level, Difficulty, Question, Input 1, Input 2,
          Answer, Symbol, Valid, Combo, Final Level.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-white/5 dark:file:text-brand-400"
        />

        {error && (
          <p className="mt-3 text-sm text-error-500">{error}</p>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>{result.addedCount}</strong> questions added,{" "}
              <strong>{result.skippedCount}</strong> rows skipped.
            </p>
            {result.skippedRows.length > 0 && (
              <>
                <div className="max-h-64 overflow-y-auto border rounded-lg border-gray-100 dark:border-gray-800">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2">Row #</th>
                        <th className="px-3 py-2">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {result.skippedRows.map((r) => (
                        <tr key={r.row}>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.row}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {r.errors.join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.skippedCount > 50 && (
                  <p className="text-xs text-gray-400">
                    Showing first 50 errors.
                  </p>
                )}
              </>
            )}
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
