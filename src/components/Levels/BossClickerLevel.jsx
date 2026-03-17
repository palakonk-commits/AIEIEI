import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sword, Anchor } from 'lucide-react';
import s from './Levels.module.css';

export default function BossClickerLevel({ level, busy, result, onChoice }) {
  const [hp, setHp] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setHp(100);
    setTimeLeft(10);
    setIsPlaying(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  const attack = () => {
    if (!isPlaying || gameOver) return;
    setHp(h => {
      const nextHp = h - 5; // 20 clicks needed
      if (nextHp <= 0) {
        setIsPlaying(false);
        onChoice(true, 'ปราบระบบสำเร็จ');
        return 0;
      }
      return nextHp;
    });
  };

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        คลิก/แตะ รัวๆ ทำลายกำแพงระบบภายใน 10 วินาที!
      </p>

      {!isPlaying && !gameOver && hp > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button className={s.choice} onClick={startGame} style={{ borderColor: 'var(--neon-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sword size={18} /> เริ่มโจมตี
          </button>
        </div>
      )}

      {isPlaying && (
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--neon-primary)', fontWeight: 'bold' }}>
          เวลา: {timeLeft}s
        </div>
      )}

      {gameOver && hp > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ color: '#ff4d4d', fontWeight: 'bold', marginBottom: '1rem' }}>เวลาหมด! กำแพงระบบป้องกันไว้ได้</p>
          <button className={s.choice} onClick={startGame} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Anchor size={18} /> ลองใหม่
          </button>
        </div>
      )}

      <div style={{
          width: '100%', maxWidth: '300px', margin: '0 auto', 
          background: 'var(--bg-card)', padding: '2rem', 
          borderRadius: '12px', border: '2px solid var(--border-color)',
          textAlign: 'center'
      }}>
        <div style={{ width: '100%', height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ height: '100%', width: `${hp}%`, background: hp > 50 ? '#4dff4d' : hp > 20 ? '#ffff4d' : '#ff4d4d', transition: 'width 0.1s' }} />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={attack}
          disabled={!isPlaying}
          style={{
            width: '100px', height: '100px',
            borderRadius: '50%', background: 'var(--neon-primary)',
            border: 'none', color: '#000', fontSize: '2rem', fontWeight: 'bold',
            cursor: isPlaying ? 'pointer' : 'not-allowed',
            opacity: isPlaying ? 1 : 0.5,
            boxShadow: isPlaying ? '0 0 20px var(--neon-primary)' : 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Sword size={40} />
        </motion.button>
      </div>
    </div>
  );
}
