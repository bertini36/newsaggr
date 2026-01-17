import { AnimatePresence, motion } from "framer-motion"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          {/* Modal */}
          <motion.div
            className={$([
              "fixed z-101 top-1/2 left-1/2",
              "w-[90vw] max-w-400px p-6 rounded-lg",
              "bg-white dark:bg-github-card",
              "border border-neutral-200 dark:border-github-border",
              "shadow-xl dark:shadow-none",
            ])}
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
          >
            <h3 className="text-lg font-bold mb-2 text-neutral-800 dark:text-white">
              {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={$([
                  "px-4 py-2 rounded-md transition-colors cursor-pointer",
                  "bg-neutral-100 hover:bg-neutral-200",
                  "dark:bg-white/10 dark:hover:bg-white/20",
                  "text-neutral-700 dark:text-neutral-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                ])}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={$([
                  "px-4 py-2 rounded-md transition-colors cursor-pointer",
                  "bg-red-400 hover:bg-red-500",
                  "text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                ])}
              >
                {isLoading ? "..." : confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
