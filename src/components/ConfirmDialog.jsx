import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDialog({ open, msg, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card dark:bg-gray-800 p-6 rounded-xl w-[280px]"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
          >
            <p className="mb-4">{msg}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="btn-ghost">Cancel</button>
              <button onClick={onConfirm} className="btn-primary">Yes</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
