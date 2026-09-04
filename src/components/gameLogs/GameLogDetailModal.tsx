

// import { useEffect, useState } from "react";
// import { Modal } from "../ui/modal";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
// } from "../ui/table";
// import { useToast } from "../../context/ToastContext";
// import { getGameLogDetail } from "../../api/gameLogs.api";

// interface Props {
//   logType: "pvp" | "computer";
//   validateId: string;
//   onClose: () => void;
// }

// const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : "-");

// type QStatus = "unseen" | "skipped" | "correct" | "incorrect";

// function getStatus(entry: any, logType: "pvp" | "computer"): QStatus | undefined {
//   if (!entry) return undefined;
//   if (logType === "pvp") {
//     if (entry.unseen) return "unseen";
//     if (entry.skipped) return "skipped";
//     return entry.isCorrect ? "correct" : "incorrect";
//   }
//   // computer mode uses action string
//   if (entry.action === "unseen") return "unseen";
//   if (entry.action === "skip") return "skipped";
//   return entry.isCorrect ? "correct" : "incorrect";
// }

// export default function GameLogDetailModal({
//   logType,
//   validateId,
//   onClose,
// }: Props) {
//   const { showToast } = useToast();
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res: any = await getGameLogDetail(logType, validateId);
//         setData(res.data);
//       } catch (err) {
//         showToast(
//           typeof err === "string" ? err : "Failed to load game detail",
//           "error"
//         );
//         onClose();
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [logType, validateId]);

//   const questions = data?.questions || [];

//   return (
//     <Modal isOpen onClose={onClose} className="max-w-4xl m-4">
//       <div className="p-6 max-h-[85vh] overflow-y-auto">
//         <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
//           Game Detail —{" "}
//           <span className="capitalize">{logType}</span>
//         </h3>
//         <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 break-all">
//           {validateId}
//         </p>

//         {loading ? (
//           <p className="text-sm text-gray-400">Loading...</p>
//         ) : !data ? (
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             No data found.
//           </p>
//         ) : (
//           <>
//             {/* Summary */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
//               {logType === "pvp" ? (
//                 <>
//                   <SummaryItem
//                     label="Player 1"
//                     value={data.player1Username}
//                   />
//                   <SummaryItem
//                     label="Player 2"
//                     value={data.player2Username}
//                   />
//                   <SummaryItem
//                     label="Score"
//                     value={`${data.finalScorePlayer1 ?? "-"} : ${
//                       data.finalScorePlayer2 ?? "-"
//                     }`}
//                   />
//                   <SummaryItem label="Winner" value={data.winner} />
//                   <SummaryItem label="Result" value={data.result} />
//                   <SummaryItem label="Diff Code" value={data.diffCode} />
//                   <SummaryItem label="Difficulty" value={data.difficulty} />
//                   <SummaryItem label="Timer" value={data.timer} />
//                   <SummaryItem
//                     label="Friend Match"
//                     value={data.isFriendMatch ? "Yes" : "No"}
//                   />
//                 </>
//               ) : (
//                 <>
//                   <SummaryItem label="Player ID" value={data.playerId} />
//                   <SummaryItem
//                     label="Score"
//                     value={`${data.finalPlayerScore ?? "-"} : ${
//                       data.finalComputerScore ?? "-"
//                     }`}
//                   />
//                   <SummaryItem label="Winner" value={data.winner} />
//                   <SummaryItem label="Result" value={data.result} />
//                   <SummaryItem label="Diff Code" value={data.diffCode} />
//                   <SummaryItem label="Difficulty" value={data.difficulty} />
//                   <SummaryItem
//                     label="Computer Level"
//                     value={data.computerLevel}
//                   />
//                   <SummaryItem label="Game Mode" value={data.gameMode} />
//                 </>
//               )}
//               <SummaryItem label="End Reason" value={data.endReason} />
//               <SummaryItem
//                 label="Started"
//                 value={formatDate(data.gameStartTime)}
//               />
//               <SummaryItem
//                 label="Ended"
//                 value={formatDate(data.gameEndTime)}
//               />
//             </div>

//             {/* Questions breakdown */}
//             <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//               Questions ({questions.length})
//             </h4>
//             <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
//               <Table>
//                 <TableHeader className="border-b border-gray-100 dark:border-gray-800">
//                   <TableRow>
//                     {[
//                       "#",
//                       "Question",
//                       "Correct Answer",
//                       logType === "pvp" ? "P1 Answer" : "Player Answer",
//                       logType === "pvp" ? "P1 Status" : "Status",
//                       logType === "pvp" ? "P2 Answer" : "Computer Answer",
//                       logType === "pvp" ? "P2 Status" : "Computer Status",
//                       "Time (ms)",
//                     ].map((h) => (
//                       <TableCell
//                         key={h}
//                         isHeader
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
//                       >
//                         {h}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
//                   {questions.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={8}
//                         className="px-3 py-4 text-center text-sm text-gray-400"
//                       >
//                         No question data recorded.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     questions.map((q: any, idx: number) => {
//                       const p1 = logType === "pvp" ? q.player1 : q.player;
//                       const p2 = logType === "pvp" ? q.player2 : q.computer;
//                       return (
//                         <TableRow key={q.questionIndex ?? idx}>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
//                             {q.questionIndex ?? idx + 1}
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
//                             {q.questionText}
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
//                             {q.correctAnswer}
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
//                             {p1?.answer ?? "-"}
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm">
//                             <StatusBadge status={getStatus(p1, logType)} />
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
//                             {p2?.answer ?? "-"}
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm">
//                             <StatusBadge status={getStatus(p2, logType)} />
//                           </TableCell>
//                           <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
//                             {p1?.timeSpent ?? "-"}
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }

// function SummaryItem({
//   label,
//   value,
// }: {
//   label: string;
//   value: React.ReactNode;
// }) {
//   return (
//     <div>
//       <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
//       <div className="text-sm text-gray-700 dark:text-gray-300 break-all">
//         {value === undefined || value === null || value === "" ? "-" : value}
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: QStatus | undefined }) {
//   if (!status) return <span className="text-gray-400">-</span>;

//   const styles: Record<QStatus, string> = {
//     correct:
//       "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
//     incorrect:
//       "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400",
//     skipped:
//       "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
//     unseen:
//       "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
//   };

//   const labels: Record<QStatus, string> = {
//     correct: "Correct",
//     incorrect: "Incorrect",
//     skipped: "Skipped",
//     unseen: "Unseen",
//   };

//   return (
//     <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status]}`}>
//       {labels[status]}
//     </span>
//   );
// }

import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import { useToast } from "../../context/ToastContext";
import { getGameLogDetail } from "../../api/gameLogs.api";

interface Props {
  logType: "pvp" | "computer";
  validateId: string;
  onClose: () => void;
}

const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : "-");

type QStatus = "unseen" | "skipped" | "correct" | "incorrect";

function getStatus(entry: any, logType: "pvp" | "computer"): QStatus | undefined {
  if (!entry) return undefined;
  if (logType === "pvp") {
    if (entry.unseen) return "unseen";
    if (entry.skipped) return "skipped";
    return entry.isCorrect ? "correct" : "incorrect";
  }
  // computer mode uses action string
  if (entry.action === "unseen") return "unseen";
  if (entry.action === "skip") return "skipped";
  return entry.isCorrect ? "correct" : "incorrect";
}

export default function GameLogDetailModal({
  logType,
  validateId,
  onClose,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getGameLogDetail(logType, validateId);
        setData(res.data);
      } catch (err) {
        showToast(
          typeof err === "string" ? err : "Failed to load game detail",
          "error"
        );
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logType, validateId]);

  const questions = data?.questions || [];

  return (
    <Modal isOpen onClose={onClose} className="max-w-4xl m-4">
      <div className="p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
          Game Detail —{" "}
          <span className="capitalize">{logType}</span>
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 break-all">
          {validateId}
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : !data ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No data found.
          </p>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {logType === "pvp" ? (
                <>
                  <SummaryItem
                    label="Player 1"
                    value={data.player1Username}
                  />
                  <SummaryItem
                    label="Player 2"
                    value={data.player2Username}
                  />
                  <SummaryItem
                    label="Score"
                    value={`${data.finalScorePlayer1 ?? "-"} : ${
                      data.finalScorePlayer2 ?? "-"
                    }`}
                  />
                  <SummaryItem label="Winner" value={data.winner} />
                  <SummaryItem label="Result" value={data.result} />
                  <SummaryItem label="Diff Code" value={data.diffCode} />
                  <SummaryItem label="Difficulty" value={data.difficulty} />
                  <SummaryItem label="Timer" value={data.timer} />
                  <SummaryItem
                    label="Friend Match"
                    value={data.isFriendMatch ? "Yes" : "No"}
                  />
                </>
              ) : (
                <>
                  <SummaryItem label="Player ID" value={data.playerId} />
                  <SummaryItem
                    label="Score"
                    value={`${data.finalPlayerScore ?? "-"} : ${
                      data.finalComputerScore ?? "-"
                    }`}
                  />
                  <SummaryItem label="Winner" value={data.winner} />
                  <SummaryItem label="Result" value={data.result} />
                  <SummaryItem label="Diff Code" value={data.diffCode} />
                  <SummaryItem label="Difficulty" value={data.difficulty} />
                  <SummaryItem
                    label="Computer Level"
                    value={data.computerLevel}
                  />
                  <SummaryItem label="Game Mode" value={data.gameMode} />
                </>
              )}
              <SummaryItem label="End Reason" value={data.endReason} />
              <SummaryItem
                label="Started"
                value={formatDate(data.gameStartTime)}
              />
              <SummaryItem
                label="Ended"
                value={formatDate(data.gameEndTime)}
              />
            </div>

            {/* Questions breakdown */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Questions ({questions.length})
            </h4>
            <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    {[
                      "#",
                      "Question",
                      "In1",
                      "Symbol",
                      "In2",
                      "Correct Answer",
                      logType === "pvp" ? "P1 Answer" : "Player Answer",
                      logType === "pvp" ? "P1 Status" : "Status",
                      logType === "pvp" ? "P2 Answer" : "Computer Answer",
                      logType === "pvp" ? "P2 Status" : "Computer Status",
                      "Time (ms)",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        isHeader
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {questions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="px-3 py-4 text-center text-sm text-gray-400"
                      >
                        No question data recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((q: any, idx: number) => {
                      const p1 = logType === "pvp" ? q.player1 : q.player;
                      const p2 = logType === "pvp" ? q.player2 : q.computer;
                      return (
                        <TableRow key={q.questionIndex ?? idx}>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {q.questionIndex ?? idx + 1}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
                            {q.questionText}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {q.input1 ?? "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {q.symbol ?? "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {q.input2 ?? "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {q.correctAnswer}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {p1?.answer ?? "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm">
                            <StatusBadge status={getStatus(p1, logType)} />
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {p2?.answer ?? "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm">
                            <StatusBadge status={getStatus(p2, logType)} />
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {p1?.timeSpent ?? "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
      <div className="text-sm text-gray-700 dark:text-gray-300 break-all">
        {value === undefined || value === null || value === "" ? "-" : value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QStatus | undefined }) {
  if (!status) return <span className="text-gray-400">-</span>;

  const styles: Record<QStatus, string> = {
    correct:
      "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
    incorrect:
      "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400",
    skipped:
      "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
    unseen:
      "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
  };

  const labels: Record<QStatus, string> = {
    correct: "Correct",
    incorrect: "Incorrect",
    skipped: "Skipped",
    unseen: "Unseen",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}