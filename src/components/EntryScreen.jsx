import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './EntryScreen.module.css';

export default function EntryScreen({ onSubmit, busy: parentBusy, error: parentError }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const displayError = parentError || error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parentBusy) return;
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

  return (
    <div className={s.root}>
      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <motion.span
          className={s.icon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
        >
          🕵️
        </motion.span>

        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI MISSION
        </motion.h1>

        <motion.p
          className={s.sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ค้นหารุ่นพี่ P'Code — ใส่รหัสของคุณเพื่อเริ่มภารกิจ
        </motion.p>

        <motion.form
          className={s.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <input
            className={s.input}
            type="text"
            placeholder="รหัสนักศึกษา หรือ ชื่อเล่น"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            autoFocus
          />
          {displayError && (
            <motion.p
              className={s.error}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {displayError}
            </motion.p>
          )}
          <button className={s.btn} type="submit" disabled={parentBusy}>
            {parentBusy ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ภารกิจ →'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
