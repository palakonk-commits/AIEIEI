import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './levels.module.css';

export default function CipherLevel({ level, busy, onSubmitText }) {
  const [value, setValue] = useState('');

  return (
    <div className={s.section}>
      <div className={s.codeKey}>
        {level.codeKey.map((k, i) => (
          <motion.span
            key={i}
            className={s.keyChip}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className={s.keyNum}>{k.n}</span> = {k.l}
          </motion.span>
        ))}
      </div>

      <motion.div
        className={s.cipher}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {level.cipher}
      </motion.div>

      <p className={s.question}>{level.question}</p>

      {busy ? (
        <div className={s.busy}><span className={s.spinner} /> กำลังถอดรหัส...</div>
      ) : (
        <div className={s.inputRow}>
          <input
            className={s.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmitText(value)}
            placeholder="พิมพ์คำตอบ..."
          />
          <button className={s.btn} onClick={() => onSubmitText(value)}>ส่ง</button>
        </div>
      )}
    </div>
  );
}
