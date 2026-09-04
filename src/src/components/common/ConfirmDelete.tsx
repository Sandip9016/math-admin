import { ReactNode } from "react";

interface ConfirmDeleteProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
  trigger?: ReactNode;
}

export default function ConfirmDelete({
  open,
  onCancel,
  onConfirm,
  message = "Are you sure you want to delete?",
}: ConfirmDeleteProps) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center  
 justify-center bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg bg-white p-4  shadow-[0_0_4px_rgba(255,255,255,0.15)]
 dark:bg-gray-800"
      >
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          Confirm Delete
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
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
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
