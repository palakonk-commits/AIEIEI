import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './levels.module.css';

export default function AILevel({ level, busy, onSubmitText }) {
  const [value, setValue] = useState('');

  return (
    <div className={s.section}>
      <div className={s.modelTable}>
        {level.model.map((row, i) => (
          <motion.div
            key={i}
            className={s.modelRow}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className={s.modelKey}>{row.k}</span>
            {row.v ? (
              <span className={s.modelVal}>{row.v}</span>
            ) : (
              <span className={s.modelMissing}>???</span>
            )}
          </motion.div>
        ))}
      </div>

      <p className={s.question}>{level.question}</p>
      {level.tip && <p className={s.tip}>{level.tip}</p>}

      {busy ? (
        <div className={s.busy}><span className={s.spinner} /> AI กำลังประมวลผล...</div>
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
