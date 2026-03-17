import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import s from './Levels.module.css';

const COLORS = [
  { id: 0, color: '#ff4d4d', active: '#ff8080' },
  { id: 1, color: '#4da6ff', active: '#80c1ff' },
  { id: 2, color: '#4dff4d', active: '#80ff80' },
  { id: 3, color: '#ffff4d', active: '#ffff80' }
];

export default function MemorySyncLevel({ level, busy, result, onChoice }) {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePad, setActivePad] = useState(null);
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const WIN_ROUNDS = 3; // ต้องจำถูก 3 รอบ

  const startGame = () => {
    setSequence([]);
    setPlayerInput([]);
    setRound(1);
    setGameOver(false);
    nextRound([Math.floor(Math.random() * 4)]);
  };

  const nextRound = useCallback((newSeq) => {
    setIsPlaying(true);
    let index = 0;
    
    const interval = setInterval(() => {
      setActivePad(newSeq[index]);
      
      setTimeout(() => {
        setActivePad(null);
        index++;
        if (index >= newSeq.length) {
          clearInterval(interval);
          setSequence(newSeq);
          setIsPlaying(false);
        }
      }, 500); // ระยะเวลาไฟติดแต่ละดวง
    }, 1000); // ระยะห่างระหว่างไฟแต่ละดวง
  }, []);

  const handlePadClick = (id) => {
    if (isPlaying || gameOver || busy) return;
    
    // flash the pad immediately onClick
    setActivePad(id);
    setTimeout(() => setActivePad(null), 300);

    const checkIdx = playerInput.length;
    if (sequence[checkIdx] !== id) {
      // Wrong!
      setGameOver(true);
      return;
    }
    
    const newPInput = [...playerInput, id];
    setPlayerInput(newPInput);
    
    if (newPInput.length === sequence.length) {
      if (round === WIN_ROUNDS) {
        // วิน!
        onChoice(true, 'ซิงค์หน่วยความจำสำเร็จ');
      } else {
        // ขึ้นรอบต่อไป
        setTimeout(() => {
          setPlayerInput([]);
          setRound(r => r + 1);
          nextRound([...sequence, Math.floor(Math.random() * 4)]);
        }, 1000);
      }
    }
  };

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        {round === 0 && 'กด "เริ่มสแกน" เพื่อเริ่มลำดับสัญญาณ'}
        {round > 0 && !gameOver && `ระดับการซิงค์: ${round}/${WIN_ROUNDS}`}
        {gameOver && <span style={{ color: '#ff4d4d' }}>ซิงค์ล้มเหลว ลำดับผิดพลาด</span>}
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem',
        width: '100%', maxWidth: '250px', margin: '0 auto', marginBottom: '2rem'
      }}>
        {COLORS.map((pad) => (
          <motion.button
            key={pad.id}
            whileTap={(isPlaying || gameOver) ? {} : { scale: 0.95 }}
            onClick={() => handlePadClick(pad.id)}
            disabled={isPlaying || gameOver || busy || round === 0}
            style={{
              aspectRatio: '1/1', borderRadius: '12px', border: 'none',
              background: activePad === pad.id ? pad.active : pad.color,
              boxShadow: activePad === pad.id ? `0 0 20px ${pad.color}` : 'none',
              cursor: (isPlaying || gameOver || round === 0) ? 'not-allowed' : 'pointer',
              opacity: (isPlaying || gameOver || round === 0) ? 0.7 : 1,
              transition: 'all 0.1s ease',
              outline: 'none'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {round === 0 && !gameOver ? (
          <button className={s.choice} onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--neon-primary)' }}>
            <Play size={18} /> เริ่มซิงค์สัญญาณ
          </button>
        ) : (
          <button className={s.choice} onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={18} /> {(gameOver || round === WIN_ROUNDS) ? 'รีเซ็ตระบบ' : 'บังคับรีสตาร์ท'}
          </button>
        )}
      </div>
    </div>
  );
}
