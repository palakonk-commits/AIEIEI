import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import s from './Levels.module.css';

export default function MazeLevel({ level, busy, result, onChoice, playerCode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 90 });
  const [enemyPos, setEnemyPos] = useState({ x: 50, y: 10 });
  const [timeLeft, setTimeLeft] = useState(15);
  
  const cacheKey = `aiei_maze_state_${playerCode}`;
  const [attemptData, setAttemptData] = useState({ tries: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) setAttemptData(JSON.parse(saved));
    } catch {}
  }, [cacheKey]);

  const containerRef = useRef(null);
  
  const GAY_IMAGE = 'https://i.pinimg.com/236x/4c/c8/3d/4cc83df6f85e10552d13592838ce6d74.jpg';

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setGameWon(false);
    setPlayerPos({ x: 50, y: 90 });
    setEnemyPos({ x: 50, y: 10 });
    setTimeLeft(15);
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameWon(true);
          setIsPlaying(false);
          setTimeout(() => onChoice(true, 'รอดชีวิต'), 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, gameWon, onChoice]);

  // Enemy movement
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return;
    
    // Rigged Logic: 
    // 1st and 2nd tries: Normal speed, but at <= 3 seconds, super speed to catch player.
    // 3rd try (and beyond): Very slow, easy win.
    let speed = 2.5;
    if (attemptData.tries < 2) {
      if (timeLeft <= 4) speed = 15; // Bot accelerates crazily at the end
    } else {
      speed = 0.5; // Bot is very slow on the 3rd attempt
    }

    const interval = setInterval(() => {
      setEnemyPos(prev => {
        const dx = playerPos.x - prev.x;
        const dy = playerPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Collision check
        if (dist < 10) {
          setGameOver(true);
          setIsPlaying(false);
          const newTries = attemptData.tries + 1;
          setAttemptData({ tries: newTries });
          localStorage.setItem(cacheKey, JSON.stringify({ tries: newTries }));
          return prev;
        }
        
        return {
          x: prev.x + (dx / dist) * speed,
          y: prev.y + (dy / dist) * speed
        };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, playerPos, gameOver, gameWon, timeLeft, attemptData.tries, cacheKey]);

  const handlePointerMove = (e) => {
    if (!isPlaying || gameOver || gameWon || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));
    
    setPlayerPos({ x, y });
  };

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        ลากนิ้ว/เมาส์เพื่อหนีให้รอดใน 15 วินาที (รอบที่: {attemptData.tries + 1})
        {attemptData.tries >= 2 && <span style={{ color: 'var(--neon-primary)', display: 'block' }}>ศัตรูเริ่มอ่อนแรง โอกาสนี้เป็นของคุณ!</span>}
      </p>

      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        style={{
          width: '100%', maxWidth: '300px', height: '300px',
          margin: '0 auto', background: 'var(--bg-card)',
          border: '2px solid var(--border-color)', borderRadius: '12px',
          position: 'relative', overflow: 'hidden', touchAction: 'none',
          marginBottom: '2rem'
        }}
      >
        {isPlaying && <div style={{ position: 'absolute', top: 5, right: 10, color: 'var(--neon-primary)', fontWeight: 'bold' }}>{timeLeft}s</div>}
        
        {!isPlaying && !gameOver && !gameWon && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
            <button className={s.choice} onClick={startGame} style={{ borderColor: 'var(--neon-primary)' }}>เริ่มหนี!</button>
          </div>
        )}

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 20,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 2, 5, 20] }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  width: '20px', height: '20px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px 10px rgba(255,255,255,0.8)'
                }}
              />
              <p style={{ color: '#000', fontSize: '1.2rem', fontWeight: 'bold', zIndex: 21, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px' }}>คุณโดนจับได้!</p>
              <button onClick={startGame} style={{ zIndex: 21, marginTop: '10px', padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}>ลองใหม่</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player */}
        <div style={{
          position: 'absolute',
          width: '20px', height: '20px',
          background: 'var(--neon-primary)', borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          left: `${playerPos.x}%`, top: `${playerPos.y}%`,
          boxShadow: '0 0 10px var(--neon-primary)',
          transition: 'left 0.1s, top 0.1s'
        }} />

        {/* Enemy */}
        <div style={{
          position: 'absolute',
          width: '40px', height: '40px',
          backgroundImage: `url(${GAY_IMAGE})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '50%', border: '2px solid #ff4d4d',
          transform: 'translate(-50%, -50%)',
          left: `${enemyPos.x}%`, top: `${enemyPos.y}%`,
          boxShadow: '0 0 15px #ff4d4d',
          transition: 'left 0.1s, top 0.1s'
        }} />
      </div>
    </div>
  );
}
