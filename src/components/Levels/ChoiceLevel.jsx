import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, Lightbulb, Sparkles } from 'lucide-react';
import s from './Levels.module.css';

export default function ChoiceLevel({ level, busy, result, onChoice }) {
  const [wrongIdx, setWrongIdx] = useState(null);
  const [showHidden, setShowHidden] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [showRevealImg, setShowRevealImg] = useState(false);
  const pinRef = useRef(null);

  useEffect(() => {
    if (level.type === 'choice-hidden-5th' && wrongCount >= 2) {
      setShowHidden(true);
    }
  }, [wrongCount, level.type]);

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
      onChoice(false, ch.text);
    } else {
      onChoice(true, ch.text);
    }
  };

  const handlePinChange = (e) => {
    const val = e.target.value;
    if (val.length <= (level.pinLength || 6)) {
      setPin(val);
      if (val.length === (level.pinLength || 6)) {
        setPinUnlocked(true);
      }
    }
  };

  if (level.type === 'locked') {
    return (
      <div className={s.section}>
        <div className={s.lockedBox}>
          <span className={s.lockedIcon}><Lock size={20} strokeWidth={1.5} /></span>
          <p className={s.lockedText}>พื้นที่นี้ถูกจำกัดสิทธิ์ในปัจจุบัน</p>
        </div>
      </div>
    );
  }

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
            <img src={src} alt={`ข้อมูลภาพที่ ${i + 1}`} className={s.levelImage} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={s.section}>
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

      {level.type === 'choice-pin-unlock' && !pinUnlocked && (
        <motion.div
          className={s.pinBox}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={s.pinLabel}>
            <Key size={16} strokeWidth={1.5} style={{ display: 'inline', marginRight: '6px' }} />
            ระบุรหัสประจำตัว {level.pinLength} หลัก เพื่อยืนยันคำสั่ง
          </p>       
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
          <p className={s.pinHint}>({pin.length}/{level.pinLength}) ข้อมูลใดก็ได้เพื่ออนุมัติ</p>
        </motion.div>
      )}

      {(level.type !== 'choice-pin-unlock' || pinUnlocked) && (
        <>
          {busy ? (
            <div className={s.busy}><span className={s.spinner} /> กำลังประมวลผลคำสั่ง...</div>
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
                    <Sparkles size={16} strokeWidth={1.5} style={{ display: 'inline', marginRight: '6px' }} />
                    {level.hiddenChoice.text}
                  </motion.button>
                )}
              </AnimatePresence>

              {level.type === 'choice-hidden-5th' && !showHidden && wrongCount > 0 && (
                <motion.p
                  className={s.hiddenHint}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Lightbulb size={16} strokeWidth={1.5} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  วิเคราะห์โครงสร้างใหม่... อาจมีตัวแปรแฝงอยู่ในระบบ
                </motion.p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
