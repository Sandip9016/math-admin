import { ReactNode } from "react";

interface ConfirmBlockProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  action: "block" | "unblock";
  message?: string;
  username?: string;
  trigger?: ReactNode;
}

export default function ConfirmBlock({
  open,
  onCancel,
  onConfirm,
  action,
  message,
  username,
}: ConfirmBlockProps) {
  if (!open) return null;

  const isBlock = action === "block";
  const defaultMessage = isBlock
    ? `Are you sure you want to block ${
        username || "this user"
      }? They will not be able to access their account.`
    : `Are you sure you want to unblock ${
        username || "this user"
      }? They will regain access to their account.`;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg bg-white p-4 shadow-[0_0_4px_rgba(255,255,255,0.15)] dark:bg-gray-800"
      >
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {isBlock ? "Confirm Block" : "Confirm Unblock"}
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message || defaultMessage}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`rounded px-3 py-1 text-sm text-white ${
              isBlock
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isBlock ? "Block" : "Unblock"}
          </button>
        </div>
      </div>
    </div>
  );
}
