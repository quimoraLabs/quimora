// import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "You're about to delete your account",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = 'danger'
}) => {
  // Dynamic theme colors that work beautifully on both light & dark themes
  const colorMap = {
    danger: { 
      text: 'text-red-500 dark:text-red-400', 
      btn: 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
    },
    warning: { 
      text: 'text-amber-500 dark:text-amber-400', 
      btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' 
    },
    info: { 
      text: 'text-brand-mid', 
      btn: 'bg-brand-mid hover:bg-brand-primary text-white shadow-md' 
    }
  };

  const colors = colorMap[variant] || colorMap.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay - fixed to use proper Tailwind v4 variable mapping */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-main/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-bg-surface p-6 text-center shadow-xl border border-border-main"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-text-muted hover:bg-bg-main hover:text-text-main transition-colors"
            >
              <X size={16} />
            </button>

            {/* Dynamic Status Icon */}
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-main ${colors.text}`}>
              <AlertCircle size={24} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl px-4">
              {title}
            </h3>

            {/* Visual Skeleton Bars */}
            <div className="my-4 flex flex-col items-center gap-2">
              <div className="h-3 w-4/5 rounded-full bg-bg-main" />
              <div className="h-3 w-3/5 rounded-full bg-bg-main" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-bg-main py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-border-main hover:text-text-main"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors standard-properties ${colors.btn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};