import { useState } from 'react';
import { motion } from 'framer-motion';
import LevelContent from './LevelContent';
import s from './LevelPanel.module.css';

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 28, stiffness: 300 } },
  exit: { opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.2 } },
};

export default function LevelPanel({ level, idx, done, busy, onClose, onCheckChoice, playerCode, photoStatus, onRefresh }) {
  const [result, setResult] = useState(null); // null | 'ok' | 'wrong'

  const handleChoice = (ok) => {
    if (busy) return;
    onCheckChoice(ok, (r) => setResult(r));
  };

  const isLocked = level.type === 'locked';

  return (
    <>
      <motion.div className={s.overlay} {...overlay} onClick={onClose} />
      <div className={s.wrapper}>
        <motion.div className={s.panel} {...panel}>
          <button className={s.close} onClick={onClose} aria-label="ปิด">✕</button>
          <div className={s.head}>
            <span className={s.emoji}>{level.emoji}</span>
            <div>
              <p className={s.label}>{level.label}</p>
              <h2 className={s.title}>{level.title}</h2>
            </div>
          </div>

          <p className={s.desc}>{level.desc}</p>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
                <span className={s.doneIcon}>✓</span>
                <div>
                  <p className={s.doneTitle}>ผ่านแล้ว!</p>
                  <p className={s.clue}>คำใบ้: {level.clue}</p>
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
            <motion.p
              className={s.wrong}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              key={Date.now()}
            >
              ❌ ไม่ถูกต้อง — ลองอีกครั้ง
            </motion.p>
          )}
        </motion.div>
      </div>
    </>
  );
}
