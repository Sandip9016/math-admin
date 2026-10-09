// import { useEffect, useState } from "react";
// import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
// import Input from "../form/input/InputField";
// import Label from "../form/Label";
// import Select from "../form/Select";
// import { useToast } from "../../context/ToastContext";
// import {
//   getQuestionById,
//   createQuestion,
//   updateQuestion,
//   getQuestions,
// } from "../../api/question.api";

// interface Props {
//   questionId: string | null; // null = Add mode
//   onClose: () => void;
//   onSaved: () => void;
// }

// interface FormState {
//   questionKey: string;
//   questionLevel: string;
//   difficulty: string;
//   question: string;
//   input1: string;
//   input2: string;
//   answer: string;
//   symbol: string;
//   valid: string;
//   combo: string;
//   finalLevel: string;
// }

// const emptyForm: FormState = {
//   questionKey: "",
//   questionLevel: "",
//   difficulty: "",
//   question: "",
//   input1: "",
//   input2: "",
//   answer: "",
//   symbol: "",
//   valid: "",
//   combo: "",
//   finalLevel: "",
// };

// const difficultyOptions = [
//   { value: "easy", label: "Easy" },
//   { value: "medium", label: "Medium" },
//   { value: "hard", label: "Hard" },
// ];

// export default function QuestionFormModal({ questionId, onClose, onSaved }: Props) {
//   const { showToast } = useToast();
//   const isEdit = !!questionId;

//   const [form, setForm] = useState<FormState>(emptyForm);
//   const [loading, setLoading] = useState(isEdit);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState<string[]>([]);
//   const [dupWarning, setDupWarning] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isEdit) return;
//     (async () => {
//       try {
//         const res: any = await getQuestionById(questionId as string);
//         const q = res.question;
//         setForm({
//           questionKey: q.questionKey ?? "",
//           questionLevel: q.questionLevel ?? "",
//           difficulty: q.difficulty ?? "",
//           question: q.question ?? "",
//           input1: String(q.input1 ?? ""),
//           input2: String(q.input2 ?? ""),
//           answer: String(q.answer ?? ""),
//           symbol: q.symbol ?? "",
//           valid: q.valid ?? "",
//           combo: q.combo ?? "",
//           finalLevel: String(q.finalLevel ?? ""),
//         });
//       } catch (err) {
//         showToast(typeof err === "string" ? err : "Failed to load question", "error");
//         onClose();
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [questionId]);

//   const update = (field: keyof FormState, value: string) => {
//     setForm((f) => ({ ...f, [field]: value }));
//   };

//   const checkDuplicateKey = async () => {
//     if (!form.questionKey.trim()) {
//       setDupWarning(null);
//       return;
//     }
//     try {
//       const res: any = await getQuestions({ search: form.questionKey.trim(), limit: 5 });
//       const matches = (res.items || []).filter(
//         (it: { questionKey: string; _id: string }) =>
//           it.questionKey === form.questionKey.trim() && it._id !== questionId
//       );
//       if (matches.length > 0) {
//         setDupWarning(
//           `${res.pagination?.total ?? matches.length} other question(s) already use this key — that's OK, but confirm this is intentional.`
//         );
//       } else {
//         setDupWarning(null);
//       }
//     } catch {
//       // non-blocking, ignore lookup failures
//     }
//   };

//   const validate = (): string[] => {
//     const errs: string[] = [];
//     if (!form.difficulty) errs.push("Difficulty is required");
//     if (form.input1 === "" || isNaN(Number(form.input1))) errs.push("Input1 must be a number");
//     if (form.input2 === "" || isNaN(Number(form.input2))) errs.push("Input2 must be a number");
//     if (form.answer === "" || isNaN(Number(form.answer))) errs.push("Answer must be a number");
//     if (!form.symbol.trim()) errs.push("Symbol is required");
//     if (
//       form.finalLevel === "" ||
//       isNaN(Number(form.finalLevel)) ||
//       Number(form.finalLevel) < 1 ||
//       Number(form.finalLevel) > 10
//     ) {
//       errs.push("Final Level must be a number between 1 and 10");
//     }
//     return errs;
//   };

//   const handleSubmit = async () => {
//     const clientErrors = validate();
//     if (clientErrors.length > 0) {
//       setErrors(clientErrors);
//       return;
//     }
//     setErrors([]);
//     setSaving(true);

//     const payload = {
//       questionKey: form.questionKey,
//       questionLevel: form.questionLevel,
//       difficulty: form.difficulty,
//       question: form.question,
//       input1: Number(form.input1),
//       input2: Number(form.input2),
//       answer: Number(form.answer),
//       symbol: form.symbol,
//       valid: form.valid,
//       combo: form.combo,
//       finalLevel: Number(form.finalLevel),
//     };

//     try {
//       if (isEdit) {
//         await updateQuestion(questionId as string, payload);
//         showToast("Question updated and is now live.", "success");
//       } else {
//         await createQuestion(payload);
//         showToast("Question added and is now live.", "success");
//       }
//       onSaved();
//     } catch (err: unknown) {
//       const message =
//         (err as { message?: string })?.message ||
//         (typeof err === "string" ? err : "Save failed");
//       // backend may reject via thrown message string (see axios interceptor)
//       setErrors([message]);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal isOpen onClose={onClose} className="max-w-2xl m-4">
//       <div className="p-6">
//         <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
//           {isEdit ? "Edit Question" : "Add Question"}
//         </h3>

//         {loading ? (
//           <p className="text-sm text-gray-400">Loading...</p>
//         ) : (
//           <>
//             {errors.length > 0 && (
//               <div className="mb-4 rounded-lg bg-error-50 dark:bg-error-500/10 p-3">
//                 {errors.map((e, i) => (
//                   <p key={i} className="text-sm text-error-600 dark:text-error-400">
//                     {e}
//                   </p>
//                 ))}
//               </div>
//             )}
//             {dupWarning && (
//               <div className="mb-4 rounded-lg bg-warning-50 dark:bg-warning-500/10 p-3">
//                 <p className="text-sm text-warning-700 dark:text-warning-400">{dupWarning}</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
//               <div>
//                 <Label>Question Key</Label>
//                 <Input
//                   value={form.questionKey}
//                   onChange={(e) => update("questionKey", e.target.value)}
//                   onBlur={checkDuplicateKey}
//                   placeholder="Sum011"
//                 />
//               </div>
//               <div>
//                 <Label>Question Level</Label>
//                 <Input
//                   value={form.questionLevel}
//                   onChange={(e) => update("questionLevel", e.target.value)}
//                   placeholder="Easy 1"
//                 />
//               </div>
//               <div>
//                 <Label>Difficulty *</Label>
//                 <Select
//                   key={`difficulty-${form.difficulty}`}
//                   placeholder="Select difficulty"
//                   defaultValue={form.difficulty}
//                   options={difficultyOptions}
//                   onChange={(v) => update("difficulty", v)}
//                 />
//               </div>
//               <div>
//                 <Label>Final Level (1-10) *</Label>
//                 <Input
//                   type="number"
//                   min="1"
//                   max="10"
//                   value={form.finalLevel}
//                   onChange={(e) => update("finalLevel", e.target.value)}
//                 />
//               </div>
//               <div className="sm:col-span-2">
//                 <Label>Question Text</Label>
//                 <Input
//                   value={form.question}
//                   onChange={(e) => update("question", e.target.value)}
//                   placeholder="Add:"
//                 />
//               </div>
//               <div>
//                 <Label>Input 1 *</Label>
//                 <Input
//                   type="number"
//                   value={form.input1}
//                   onChange={(e) => update("input1", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Input 2 *</Label>
//                 <Input
//                   type="number"
//                   value={form.input2}
//                   onChange={(e) => update("input2", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Answer *</Label>
//                 <Input
//                   type="number"
//                   value={form.answer}
//                   onChange={(e) => update("answer", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Symbol *</Label>
//                 <Input
//                   value={form.symbol}
//                   onChange={(e) => update("symbol", e.target.value)}
//                   placeholder="Sum"
//                 />
//               </div>
//               <div>
//                 <Label>Valid</Label>
//                 <Input
//                   value={form.valid}
//                   onChange={(e) => update("valid", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Combo</Label>
//                 <Input
//                   value={form.combo}
//                   onChange={(e) => update("combo", e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end gap-3">
//               <Button variant="outline" onClick={onClose} disabled={saving}>
//                 Cancel
//               </Button>
//               <Button onClick={handleSubmit} disabled={saving}>
//                 {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Question"}
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }


import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { useToast } from "../../context/ToastContext";
import {
  getQuestionById,
  createQuestion,
  updateQuestion,
} from "../../api/question.api";

interface Props {
  questionId: string | null; // null = Add mode
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  questionLevel: string;
  difficulty: string;
  question: string;
  input1: string;
  input2: string;
  answer: string;
  symbol: string;
  valid: string;
  combo: string;
  finalLevel: string;
}

const emptyForm: FormState = {
  questionLevel: "",
  difficulty: "",
  question: "",
  input1: "",
  input2: "",
  answer: "",
  symbol: "",
  valid: "",
  combo: "",
  finalLevel: "",
};

// Dropdown values are the full names the API stores.
export const symbolOptions = [
  { value: "Sum", label: "Sum (+)" },
  { value: "Difference", label: "Difference (-)" },
  { value: "Product", label: "Product (*)" },
  { value: "Quotient", label: "Quotient (/)" },
  { value: "Remainder", label: "Remainder (%)" },
  { value: "Power", label: "Power (^)" },
];

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function QuestionFormModal({ questionId, onClose, onSaved }: Props) {
  const { showToast } = useToast();
  const isEdit = !!questionId;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // edit mode: values as loaded, used to send only changed fields
  const [original, setOriginal] = useState<FormState>(emptyForm);
  const [active, setActive] = useState(true);
  const [origActive, setOrigActive] = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res: any = await getQuestionById(questionId as string);
        const q = res.question;
        const loaded: FormState = {
          questionLevel: q.questionLevel ?? "",
          difficulty: q.difficulty ?? "",
          question: q.question ?? "",
          input1: String(q.input1 ?? ""),
          input2: String(q.input2 ?? ""),
          answer: String(q.answer ?? ""),
          symbol: q.symbol ?? "",
          valid: q.valid ?? "",
          combo: q.combo ?? "",
          finalLevel: String(q.finalLevel ?? ""),
        };
        setForm(loaded);
        setOriginal(loaded);
        setActive(q.active !== false);
        setOrigActive(q.active !== false);
      } catch (err) {
        showToast(typeof err === "string" ? err : "Failed to load question", "error");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Level 0 -> 1+ enables the question (it then shows in the main table).
    if (
      isEdit &&
      field === "finalLevel" &&
      Number(value) > 0 &&
      Number(original.finalLevel) === 0
    ) {
      setActive(true);
    }
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.difficulty) errs.push("Difficulty is required");
    if (form.input1 === "" || isNaN(Number(form.input1))) errs.push("Input1 must be a number");
    if (form.input2 === "" || isNaN(Number(form.input2))) errs.push("Input2 must be a number");
    if (form.answer === "" || isNaN(Number(form.answer))) errs.push("Answer must be a number");
    if (!form.symbol.trim()) errs.push("Symbol is required");
    // edit: 0 is allowed and means disabled. add: must be 1-10.
    const minLevel = isEdit ? 0 : 1;
    if (
      form.finalLevel === "" ||
      isNaN(Number(form.finalLevel)) ||
      Number(form.finalLevel) < minLevel ||
      Number(form.finalLevel) > 10
    ) {
      errs.push(
        isEdit
          ? "Final Level must be a number between 0 and 10 (0 = disabled)"
          : "Final Level must be a number between 1 and 10"
      );
    }
    return errs;
  };

  const handleSubmit = async () => {
    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors([]);

    const all: Record<keyof FormState, string | number> = {
      questionLevel: form.questionLevel,
      difficulty: form.difficulty,
      question: form.question,
      input1: Number(form.input1),
      input2: Number(form.input2),
      answer: Number(form.answer),
      symbol: form.symbol,
      valid: form.valid,
      combo: form.combo,
      finalLevel: Number(form.finalLevel),
    };
    const payload: Record<string, string | number | boolean> = {};
    if (isEdit) {
      // send only the fields that changed
      (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
        if (form[k] !== original[k]) payload[k] = all[k];
      });
      // Level 0 = disabled. The edit route does not apply that rule itself.
      const level = Number(form.finalLevel);
      const wantActive = level === 0 ? false : active;
      if (wantActive !== origActive) {
        payload.active = wantActive;
        if (wantActive) payload.finalLevel = level; // enabling needs level >= 1
      }
      if (Object.keys(payload).length === 0) {
        showToast("No changes to save.", "info");
        return;
      }
    } else {
      // questionKey omitted — backend auto-generates it. Optional blanks omitted.
      Object.assign(payload, all);
      (["questionLevel", "question", "valid", "combo"] as const).forEach((k) => {
        if (all[k] === "") delete payload[k];
      });
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateQuestion(questionId as string, payload);
        showToast("Question updated and is now live.", "success");
      } else {
        await createQuestion(payload);
        showToast("Question added and is now live.", "success");
      }
      onSaved();
    } catch (err: unknown) {
      // Interceptor rejects with a string; field errors are joined by "\n".
      const message = typeof err === "string" ? err : "Save failed";
      setErrors(message.split("\n"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl m-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {isEdit ? "Edit Question" : "Add Question"}
        </h3>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <>
            {errors.length > 0 && (
              <div className="mb-4 rounded-lg bg-error-50 dark:bg-error-500/10 p-3">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-error-600 dark:text-error-400">
                    {e}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label>Question Level</Label>
                <Input
                  value={form.questionLevel}
                  onChange={(e) => update("questionLevel", e.target.value)}
                  placeholder="Easy 1"
                />
              </div>
              <div>
                <Label>Difficulty *</Label>
                <Select
                  key={`difficulty-${form.difficulty}`}
                  placeholder="Select difficulty"
                  defaultValue={form.difficulty}
                  options={difficultyOptions}
                  onChange={(v) => update("difficulty", v)}
                />
              </div>
              <div>
                <Label>{isEdit ? "Final Level (0 = disabled, max 10) *" : "Final Level (1-10) *"}</Label>
                <Input
                  type="number"
                  min={isEdit ? "0" : "1"}
                  max="10"
                  value={form.finalLevel}
                  onChange={(e) => update("finalLevel", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Question Text</Label>
                <Input
                  value={form.question}
                  onChange={(e) => update("question", e.target.value)}
                  placeholder="Add:"
                />
              </div>
              <div>
                <Label>Input 1 *</Label>
                <Input
                  type="number"
                  value={form.input1}
                  onChange={(e) => update("input1", e.target.value)}
                />
              </div>
              <div>
                <Label>Input 2 *</Label>
                <Input
                  type="number"
                  value={form.input2}
                  onChange={(e) => update("input2", e.target.value)}
                />
              </div>
              <div>
                <Label>Answer *</Label>
                <Input
                  type="number"
                  value={form.answer}
                  onChange={(e) => update("answer", e.target.value)}
                />
              </div>
              <div>
                <Label>Symbol *</Label>
                <Input
                  value={form.symbol}
                  onChange={(e) => update("symbol", e.target.value)}
                  placeholder="+ - * / % ^"
                />
              </div>
              <div>
                <Label>Valid</Label>
                <Input
                  value={form.valid}
                  onChange={(e) => update("valid", e.target.value)}
                />
              </div>
              <div>
                <Label>Combo</Label>
                <Input
                  value={form.combo}
                  onChange={(e) => update("combo", e.target.value)}
                />
              </div>
              {isEdit && (
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={Number(form.finalLevel) === 0 ? false : active}
                      disabled={Number(form.finalLevel) === 0}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    Active (used in games)
                  </label>
                  {!origActive && (
                    <p className="mt-1 text-xs text-gray-400">
                      This question is disabled. Set Final Level to 1 or higher to
                      enable it.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Question"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}