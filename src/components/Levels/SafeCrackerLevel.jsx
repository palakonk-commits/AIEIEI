import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Check, RotateCcw } from 'lucide-react';
import s from './Levels.module.css';

export default function SafeCrackerLevel({ level, busy, result, onChoice }) {
  // รหัสผ่านคือ 4-0-4 (Not Found Vibe) หรือตั้งตามต้องการได้
  const TARGET_CODE = [4, 0, 4];
  
  const [digits, setDigits] = useState([0, 0, 0]);
  const [attempts, setAttempts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const updateDigit = (index, delta) => {
    const newDigits = [...digits];
    let val = newDigits[index] + delta;
    if (val > 9) val = 0;
    if (val < 0) val = 9;
    newDigits[index] = val;
    setDigits(newDigits);
  };

  const handleGuess = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      let correctPos = 0;
      let correctNum = 0;
      
      const targetCopy = [...TARGET_CODE];
      const guessCopy = [...digits];
      
      // หาตัวที่ถูกตำแหน่งเป๊ะๆ
      for (let i = 0; i < 3; i++) {
        if (guessCopy[i] === targetCopy[i]) {
          correctPos++;
          targetCopy[i] = null;
          guessCopy[i] = null;
        }
      }
      
      // หาตัวที่ถูกเลขแต่ผิดตำแหน่ง
      for (let i = 0; i < 3; i++) {
        if (guessCopy[i] !== null) {
          const foundIdx = targetCopy.indexOf(guessCopy[i]);
          if (foundIdx !== -1) {
            correctNum++;
            targetCopy[foundIdx] = null;
          }
        }
      }
      
      if (correctPos === 3) {
        onChoice(true, 'รหัสถูกต้อง');
      } else {
        setAttempts([{ guess: [...digits], pos: correctPos, num: correctNum }, ...attempts]);
      }
      setIsAnimating(false);
    }, 600);
  };

  const resetGame = () => {
    setDigits([0, 0, 0]);
    setAttempts([]);
  };

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {digits.map((digit, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => updateDigit(i, 1)}
              className={s.choice}
              style={{ padding: '0.5rem' }}
            >
              <ChevronUp size={24} />
            </motion.button>
            
            <div style={{ 
              fontSize: '2.5rem', fontWeight: 'bold', width: '60px', height: '80px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: 'var(--bg-card)', border: '2px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-main)'
            }}>
              {digit}
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => updateDigit(i, -1)}
              className={s.choice}
              style={{ padding: '0.5rem' }}
            >
              <ChevronDown size={24} />
            </motion.button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={s.choice} 
          onClick={handleGuess} 
          disabled={busy || isAnimating || result}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--neon-primary)' }}
        >
          <Check size={18} /> ยืนยันรหัส
        </button>
        <button className={s.choice} onClick={resetGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={18} /> เริ่มใหม่
        </button>
      </div>

      {attempts.length > 0 && (
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto' }}>
          <p style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>ประวัติการเดา</p>
          {attempts.map((att, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <span style={{ letterSpacing: '2px', fontWeight: 'bold', color: 'var(--text-main)' }}>{att.guess.join(' ')}</span>
              <span style={{ color: 'var(--text-dim)' }}>ถูกตำแหน่ง: <span style={{color: 'var(--neon-primary)'}}>{att.pos}</span> | ถูกเลขผิดตำแหน่ง: <span style={{color: '#ffaa00'}}>{att.num}</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
