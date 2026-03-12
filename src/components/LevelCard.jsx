import { motion } from 'framer-motion';
import s from './LevelCard.module.css';

export default function LevelCard({ emoji, label, title, done, clue, index, onOpen }) {
  return (
    <motion.button
      className={`${s.card} ${done ? s.done : ''}`}
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={s.emoji}>{emoji}</span>
      <div className={s.info}>
        <span className={s.label}>{label}</span>
        <span className={s.title}>{title}</span>
      </div>
      {done && <span className={s.check}>✓</span>}
    </motion.button>
  );
}
