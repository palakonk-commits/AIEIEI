import { motion } from 'framer-motion';
import s from './FinalScreen.module.css';

export default function FinalScreen({ clues }) {
  return (
    <motion.div
      className={s.root}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <motion.div
        className={s.badge}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      >
        🎉
      </motion.div>

      <motion.h2
        className={s.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        ภารกิจสำเร็จ!
      </motion.h2>

      <motion.p
        className={s.sub}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        คุณค้นพบแล้วว่ารุ่นพี่ P'Code คือ...
      </motion.p>

      <motion.div
        className={s.reveal}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 200 }}
      >
        <span className={s.name}>BOSS</span>
        <span className={s.aka}>บอส</span>
      </motion.div>

      <motion.div
        className={s.clues}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className={s.cluesTitle}>เบาะแสที่รวบรวมได้</p>
        {clues.map((c, i) => (
          <motion.div
            key={i}
            className={s.clueRow}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
          >
            <span className={s.clueIcon}>{c.icon}</span>
            <span className={s.clueText}>{c.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
