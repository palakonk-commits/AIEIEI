import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import s from './LevelCard.module.css';

export default function LevelCard({ emoji, icon, label, title, done, clue, index, onOpen }) {
  // Use `icon` string from data, fallback to 'HelpCircle' if not found
  const IconComponent = icon && LucideIcons[icon] ? LucideIcons[icon] : LucideIcons.HelpCircle;

  return (
    <motion.button
      className={`${s.card} ${done ? s.done : ''}`}
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={s.iconWrap}>
        <IconComponent strokeWidth={1.5} className={s.icon} />
      </div>
      <div className={s.info}>
        <span className={s.label}>{label}</span>
        <span className={s.title}>{title}</span>
      </div>
      {done && (
         <div className={s.check}>
           <LucideIcons.Check strokeWidth={2} size={16} />
         </div>
      )}
    </motion.button>
  );
}
