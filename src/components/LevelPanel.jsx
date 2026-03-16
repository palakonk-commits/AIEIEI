import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import LevelContent from './LevelContent';
import s from './LevelPanel.module.css';

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const panel = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function LevelPanel({ level, idx, done, busy, onClose, onCheckChoice, playerCode, photoStatus, onRefresh }) {
  const [result, setResult] = useState(null); // null | 'ok' | 'wrong'

  const handleChoice = (ok, answerText) => {
    if (busy) return;
    onCheckChoice(ok, answerText, (r) => setResult(r));
  };

  const isLocked = level.type === 'locked';
  const IconComponent = level.icon && LucideIcons[level.icon] ? LucideIcons[level.icon] : LucideIcons.FileCode2;

  return (
    <>
      <motion.div className={s.overlay} {...overlay} onClick={onClose} />
      <div className={s.wrapper}>
        <motion.div className={s.panel} {...panel}>
          <button className={s.close} onClick={onClose} aria-label="Close">
            <LucideIcons.X size={20} strokeWidth={1.5} />
          </button>
          
          <div className={s.head}>
            <div className={s.iconWrap}>
              <IconComponent className={s.iconHead} strokeWidth={1.2} />
            </div>
            <div>
              <p className={s.label}>{level.label}</p>
              <h2 className={s.title}>{level.title}</h2>
            </div>
          </div>

          <p className={s.desc}>{level.desc}</p>

          {done ? (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Single reveal image */}
              {level.revealImage && !level.revealImages && (
                <motion.div
                  className={s.revealWrap}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <img src={level.revealImage} alt="คำใบ้" className={s.revealImg} />
                </motion.div>
              )}
              {/* Multiple reveal images */}
              {level.revealImages && (
                <div className={s.revealGrid}>
                  {level.revealImages.map((src, i) => (
                    <motion.div
                      key={i}
                      className={s.revealWrap}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                    >
                      <img src={src} alt={`คำใบ้ ${i + 1}`} className={s.revealImg} />
                    </motion.div>
                  ))}
                </div>
              )}
              <div className={s.doneBox}>
                <div className={s.doneIconWrap}>
                  <LucideIcons.CheckCircle2 className={s.doneIcon} strokeWidth={1.5} />
                </div>
                <div>
                  <p className={s.doneTitle}>อนุมัติสิทธิ์การเข้าถึง</p>
                  <p className={s.clue}>ข้อมูลลับ: {level.clue}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <LevelContent
              level={level}
              busy={busy}
              result={result}
              onChoice={handleChoice}
              playerCode={playerCode}
              photoStatus={photoStatus}
              onRefresh={onRefresh}
            />
          )}

          {result === 'wrong' && !done && !isLocked && level.type !== 'choice-all-correct' && (
            <motion.div
              className={s.wrong}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              key={Date.now()}
            >
              <LucideIcons.AlertCircle size={16} strokeWidth={1.5} />
              <span>ลำดับข้อมูลไม่ถูกต้อง โปรดประมวลผลใหม่</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
