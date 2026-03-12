import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './levels.module.css';

export default function PatternLevel({ level, busy, onSubmitText }) {
  const [value, setValue] = useState('');

  return (
    <div className={s.section}>
      <div className={s.sequence}>
        {level.sequence.map((item, i) => (
          <motion.span
            key={i}
            className={s.seqItem}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
          >
            {item}
          </motion.span>
        ))}
        <motion.span
          className={s.seqNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ?
        </motion.span>
      </div>

      <p className={s.question}>{level.question}</p>
      {level.tip && <p className={s.tip}>{level.tip}</p>}

      {busy ? (
        <div className={s.busy}><span className={s.spinner} /> กำลังวิเคราะห์...</div>
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
