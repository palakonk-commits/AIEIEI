import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './levels.module.css';

export default function VisualLevel({ level, busy, onSubmitText }) {
  const [value, setValue] = useState('');

  return (
    <div className={s.section}>
      <div className={s.icons}>
        {level.icons.map((ic, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            {ic}
          </motion.span>
        ))}
      </div>

      <p className={s.question}>{level.question}</p>
      {level.tip && <p className={s.tip}>{level.tip}</p>}

      {busy ? (
        <div className={s.busy}><span className={s.spinner} /> กำลังวิเคราะห์ภาพ...</div>
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
