import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle } from 'lucide-react';
import s from './Levels.module.css';

export default function BossClickerLevel({ level, busy, result, onChoice }) {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isWon, setIsWon] = useState(false);
  
  const holdTimer = useRef(null);

  useEffect(() => {
    if (isPressing && !isWon) {
      holdTimer.current = setInterval(() => {
        setProgress(p => {
          const nextP = p + 2; // fills up in about 2.5 seconds (50 ticks of 50ms)
          if (nextP >= 100) {
            setIsWon(true);
            clearInterval(holdTimer.current);
            setTimeout(() => onChoice(true, 'ปลดล็อกประตูสุดท้ายสำเร็จ'), 1000);
            return 100;
          }
          return nextP;
        });
      }, 50);
    } else {
      if (holdTimer.current) clearInterval(holdTimer.current);
      if (!isWon && progress > 0 && progress < 100) {
        // Slowly decrease if released early
        holdTimer.current = setInterval(() => {
          setProgress(p => {
            if (p <= 0) {
              clearInterval(holdTimer.current);
              return 0;
            }
            return p - 5;
          });
        }, 50);
      }
    }
    
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, [isPressing, isWon, onChoice, progress]);

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        แตะค้างไว้จนกว่าพลังงานจะเต็ม เพื่อยืนยันตัวตน
      </p>

      <div style={{
          width: '100%', maxWidth: '300px', margin: '0 auto', 
          background: 'var(--bg-card)', padding: '2rem', 
          borderRadius: '12px', border: '2px solid var(--border-color)',
          textAlign: 'center'
      }}>
        
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', marginBottom: '2rem' }}>
          {/* Progress Ring */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" stroke="var(--bg-hover)" strokeWidth="8" fill="none" />
            <circle 
              cx="60" cy="60" r="54" 
              stroke={isWon ? '#4dff4d' : 'var(--neon-primary)'} 
              strokeWidth="8" fill="none" 
              strokeDasharray={339.292} 
              strokeDashoffset={339.292 - (339.292 * progress) / 100} 
              style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
            />
          </svg>

          {/* Button */}
          <motion.button
            onPointerDown={() => setIsPressing(true)}
            onPointerUp={() => setIsPressing(false)}
            onPointerLeave={() => setIsPressing(false)}
            whileTap={!isWon ? { scale: 0.95 } : {}}
            style={{
              position: 'absolute', inset: '10px',
              borderRadius: '50%', background: isWon ? '#4dff4d' : 'var(--bg-hover)',
              border: 'none', color: isWon ? '#000' : 'var(--text-main)',
              cursor: isWon ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'none' // prevent scrolling while holding
            }}
          >
            {isWon ? <CheckCircle size={40} /> : <Fingerprint size={40} />}
          </motion.button>
        </div>

        <p style={{ color: isWon ? '#4dff4d' : 'var(--neon-primary)', fontWeight: 'bold' }}>
          {isWon ? 'ยืนยันตัวตนสำเร็จ!' : `${Math.floor(progress)}%`}
        </p>

      </div>
    </div>
  );
}
