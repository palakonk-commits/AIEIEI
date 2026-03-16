import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './SharedModals.module.css';

export function Toast({ message, onClose, type = 'error' }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <div className={s.toastContainer}>
      <AnimatePresence>
        {message && (
          <motion.div
            className={`${s.toast} ${type === 'success' ? s.toastSuccess : s.toastError}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <span className={s.toastIcon}>{type === 'success' ? '✅' : '⚠️'}</span>
            <span className={s.toastText}>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
            onClick={onCancel}
          />
          <motion.div
            className={s.modal}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={s.modalIcon}>❓</div>
            <h3 className={s.modalTitle}>{title || 'ยืนยันการดำเนินการ'}</h3>
            <p className={s.modalMessage}>{message}</p>
            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={onCancel}>ยกเลิก</button>
              <button className={s.confirmBtn} onClick={onConfirm}>ยืนยัน</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}