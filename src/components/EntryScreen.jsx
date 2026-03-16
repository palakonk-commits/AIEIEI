import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Fingerprint } from 'lucide-react';
import s from './EntryScreen.module.css';

export default function EntryScreen({ onSubmit, busy, error: parentError }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const displayError = parentError || error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError('กรุณาใส่รหัสนักศึกษาหรือชื่อเล่น');
      return;
    }
    if (trimmed.length < 2) {
      setError('กรุณาใส่อย่างน้อย 2 ตัวอักษร');
      return;
    }
    onSubmit(trimmed);
  };

  if (busy) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.card}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.loadingBox}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className={s.spinnerWrap}
            >
              <Loader2 className={s.spinnerIcon} strokeWidth={1.5} />
            </motion.div>
            <h2 className={s.loadingTitle}>Authenticating.</h2>
            <p className={s.loadingSub}>Establishing secure connection.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <motion.div
        className={s.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className={s.iconWrap}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Fingerprint className={s.icon} strokeWidth={1} />
        </motion.div>

        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Identify.
        </motion.h1>

        <motion.p
          className={s.sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Enter your student ID or alias to begin.
        </motion.p>

        <motion.form
          className={s.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.inputWrap}>
            <input
              className={s.input}
              type="text"
              placeholder="Credentials"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              autoFocus
            />
            <span className={s.inputLine}></span>
          </div>
          {displayError && (
            <motion.p
              className={s.error}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayError}
            </motion.p>
          )}
          <motion.button 
            className={s.btn} 
            type="submit" 
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {busy ? 'Processing...' : 'Proceed'}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
