import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Lock, XCircle, Trash2 } from 'lucide-react';
import s from './SharedModals.module.css';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={s.overlay}>
          <motion.div 
            className={s.backdrop} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <motion.div
            className={s.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className={s.modalIcon}>
              <AlertCircle size={32} strokeWidth={1.5} color="var(--red)" />
            </span>
            <h3 className={s.modalTitle}>{title || 'Confirm Action'}</h3>
            <p className={s.modalMessage}>{message}</p>
            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={onCancel}>Cancel</button>
              <button className={s.confirmBtn} onClick={onConfirm}>Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <div className={s.toastContainer}>
          <motion.div
            className={`${s.toast} ${type === 'error' ? s.toastError : s.toastSuccess}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <span className={s.toastIcon}>
              {type === 'success' ? <CheckCircle size={18} strokeWidth={1.5} color="var(--green)" /> : <AlertCircle size={18} strokeWidth={1.5} color="var(--red)" />}
            </span>
            <span className={s.toastText}>{message}</span>
            <button className={s.toastClose} onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <XCircle size={16} strokeWidth={1.5} color="var(--text-3)" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}