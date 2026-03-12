import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './Levels.module.css';

export default function ChoiceLevel({ level, busy, result, onChoice }) {
  const [wrongIdx, setWrongIdx] = useState(null);
  const [showHidden, setShowHidden] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [showRevealImg, setShowRevealImg] = useState(false);
  const pinRef = useRef(null);

  // Level 2: reveal hidden choice after 2 wrong attempts
  useEffect(() => {
    if (level.type === 'choice-hidden-5th' && wrongCount >= 2) {
      setShowHidden(true);
    }
  }, [wrongCount, level.type]);

  // Level 4/5: show image(s) when solved
  useEffect(() => {
    if ((level.type === 'choice-image-reveal') && result === 'ok') {
      setShowRevealImg(true);
    }
  }, [result, level.type]);

  const handleClick = (ch, i, isHidden = false) => {
    if (busy) return;
    if (!ch.ok) {
      setWrongIdx(isHidden ? 'hidden' : i);
      setWrongCount(c => c + 1);
      setTimeout(() => setWrongIdx(null), 600);
      onChoice(false);
    } else {
      onChoice(true);
    }
  };

  // Level 3: PIN input handler
  const handlePinChange = (e) => {
    const val = e.target.value;
    if (val.length <= (level.pinLength || 6)) {
      setPin(val);
      if (val.length === (level.pinLength || 6)) {
        setPinUnlocked(true);
      }
    }
  };

  // ── Locked level ──
  if (level.type === 'locked') {
    return (
      <div className={s.section}>
        <div className={s.lockedBox}>
          <span className={s.lockedIcon}>🔒</span>
          <p className={s.lockedText}>ด่านนี้ยังไม่เปิด — รอติดตามนะ!</p>
        </div>
      </div>
    );
  }

  // ── Image reveal after solving (single or multiple) ──
  if (showRevealImg && (level.revealImage || level.revealImages)) {
    const images = level.revealImages || [level.revealImage];
    return (
      <div className={s.section}>
        {images.map((src, i) => (
          <motion.div
            key={i}
            className={s.imageWrap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: i * 0.15 }}
          >
            <img src={src} alt={`คำใบ้ ${i + 1}`} className={s.levelImage} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={s.section}>
      {/* Code snippet for Level 4 */}
      {level.codeSnippet && (
        <motion.pre
          className={s.codeBlock}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <code>{level.codeSnippet}</code>
        </motion.pre>
      )}

      <p className={s.question}>{level.question}</p>

      {/* Level 3: PIN input before showing choices */}
      {level.type === 'choice-pin-unlock' && !pinUnlocked && (
        <motion.div
          className={s.pinBox}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={s.pinLabel}>🔐 พิมพ์ PIN {level.pinLength} ตัว เพื่อปลดล็อคตัวเลือก</p>
          <input
            ref={pinRef}
            className={s.pinInput}
            type="text"
            maxLength={level.pinLength}
            value={pin}
            onChange={handlePinChange}
            placeholder={'•'.repeat(level.pinLength)}
            autoFocus
          />
          <p className={s.pinHint}>({pin.length}/{level.pinLength}) พิมพ์อะไรก็ได้!</p>
        </motion.div>
      )}

      {/* Choices — hidden behind PIN for Level 3 */}
      {(level.type !== 'choice-pin-unlock' || pinUnlocked) && (
        <>
          {busy ? (
            <div className={s.busy}><span className={s.spinner} /> กำลังตรวจสอบ...</div>
          ) : (
            <div className={s.choices}>
              {level.choices.map((ch, i) => (
                <motion.button
                  key={i}
                  className={`${s.choice} ${wrongIdx === i ? s.choiceWrong : ''}`}
                  onClick={() => handleClick(ch, i)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {ch.text}
                </motion.button>
              ))}

              {/* Level 2: Hidden 5th choice appears after wrong attempts */}
              <AnimatePresence>
                {showHidden && level.hiddenChoice && (
                  <motion.button
                    className={`${s.choice} ${s.choiceHidden} ${wrongIdx === 'hidden' ? s.choiceWrong : ''}`}
                    onClick={() => handleClick(level.hiddenChoice, -1, true)}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    ✨ {level.hiddenChoice.text}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Hint for Level 2 */}
              {level.type === 'choice-hidden-5th' && !showHidden && wrongCount > 0 && (
                <motion.p
                  className={s.hiddenHint}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  💡 ลองอีกที... มีคำตอบซ่อนอยู่
                </motion.p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
