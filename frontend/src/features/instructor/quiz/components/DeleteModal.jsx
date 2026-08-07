import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

function DeleteModal({ quiz, onClose, onConfirm }) {
  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg-main/75 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        className="relative w-full max-w-md rounded-2xl border border-main bg-surface p-6 shadow-card"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-500/15">
          <Trash2 size={20} />
        </div>
        <h2 className="mt-5 font-display text-lg font-semibold text-main">
          Delete this quiz?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          “{quiz.title}” will be removed from your quiz list. This action cannot
          be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-main px-4 py-2.5 text-sm font-semibold text-main hover:bg-main"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400"
          >
            Delete quiz
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DeleteModal;