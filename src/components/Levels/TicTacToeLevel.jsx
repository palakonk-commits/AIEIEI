import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import s from './Levels.module.css';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6] // diagonals
];

function checkThemeWin(board) {
  for (let line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export default function TicTacToeLevel({ level, busy, result, onChoice, playerCode }) {
  const cacheKey = `aiei_xo_state_${playerCode}`;
  
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X'); // User is always X
  const [winner, setWinner] = useState(null);
  const [isBotPlaying, setIsBotPlaying] = useState(false);
  
  // Track attempts (max 3 per hour)
  const [attemptData, setAttemptData] = useState({ tries: 0, lockoutUntil: 0 });
  const [locked, setLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Load attempt state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() < parsed.lockoutUntil) {
          setAttemptData(parsed);
          setLocked(true);
        } else {
          // lockout expired
          setAttemptData({ tries: 0, lockoutUntil: 0 });
          localStorage.removeItem(cacheKey);
        }
      }
    } catch {}
  }, [cacheKey]);

  // Lockout countdown timer
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      const left = attemptData.lockoutUntil - Date.now();
      if (left <= 0) {
        setLocked(false);
        setAttemptData({ tries: 0, lockoutUntil: 0 });
        localStorage.removeItem(cacheKey);
        clearInterval(interval);
      } else {
        const mins = Math.floor(left / 60000);
        const secs = Math.floor((left % 60000) / 1000);
        setTimeRemaining(`${mins} นาที ${secs} วินาที`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, attemptData, cacheKey]);

  const bestMoveMinimax = (currentBoard, aiPlayer, humanPlayer) => {
    // Basic AI - if attempts < 2, play perfect. Else, play dumb.
    const emptySpots = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    
    // Dumb mode (Attempt 3): just pick random
    if (attemptData.tries >= 2) {
      return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }

    // Unbeatable/Cheat mode (Attempt 1-2)
    // Check if AI can win
    for (let i of emptySpots) {
      const temp = [...currentBoard];
      temp[i] = aiPlayer;
      if (checkThemeWin(temp) === aiPlayer) return i;
    }
    // Check if Human can win and block
    for (let i of emptySpots) {
      const temp = [...currentBoard];
      temp[i] = humanPlayer;
      if (checkThemeWin(temp) === humanPlayer) return i;
    }
    // Take center if available
    if (emptySpots.includes(4)) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8].filter(c => emptySpots.includes(c));
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    
    return emptySpots[Math.floor(Math.random() * emptySpots.length)];
  };

  useEffect(() => {
    if (turn === 'O' && !winner && board.includes(null) && !locked) {
      setIsBotPlaying(true);
      setTimeout(() => {
        const move = bestMoveMinimax(board, 'O', 'X');
        if (move !== undefined) {
          const nextBoard = [...board];
          nextBoard[move] = 'O';
          setBoard(nextBoard);
          const w = checkThemeWin(nextBoard);
          if (w) {
            handleGameOver(w);
          } else if (!nextBoard.includes(null)) {
            handleGameOver('Draw');
          } else {
            setTurn('X');
          }
        }
        setIsBotPlaying(false);
      }, 600); // bot thinking time
    }
  }, [turn, winner, board, locked]);

  const handleGameOver = (w) => {
    setWinner(w);
    let newTries = attemptData.tries;
    let newLock = attemptData.lockoutUntil;
    
    if (w === 'X') {
      // User wins
      onChoice(true, 'ชนะ XO');
    } else {
      // Draw or O wins - count as attempt used
      newTries += 1;
      if (newTries >= 3 && w !== 'X') {
        newLock = Date.now() + 60 * 60 * 1000; // 1 hour lockout
        setLocked(true);
      }
      const newData = { tries: newTries, lockoutUntil: newLock };
      setAttemptData(newData);
      localStorage.setItem(cacheKey, JSON.stringify(newData));
      if (w !== 'X') onChoice(false, 'พ่ายแพ้หรือเสมอ');
    }
  };

  const handleSquareClick = (idx) => {
    if (board[idx] || winner || turn !== 'X' || isBotPlaying || locked) return;

    const nextBoard = [...board];
    nextBoard[idx] = 'X';
    setBoard(nextBoard);

    const w = checkThemeWin(nextBoard);
    if (w) {
      handleGameOver(w);
    } else if (!nextBoard.includes(null)) {
      handleGameOver('Draw');
    } else {
      setTurn('O');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setTurn('X');
  };

  if (locked) {
    return (
      <div className={s.section}>
        <p className={s.question}>ระบบต่อต้านผู้บุกรุกทำงาน</p>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#ff4d4d', fontSize: '1.2rem', marginBottom: '1rem' }}>คุณโดนแบนจากการพยายามเกินขีดจำกัด</p>
          <p style={{ color: 'var(--text-dim)' }}>กรุณารอเวลา: {timeRemaining}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        รอบที่เล่น: {attemptData.tries + 1}/3
        {attemptData.tries >= 2 && <span style={{ color: 'var(--neon-primary)', display: 'block' }}>ระบบ AI เริ่มทำงานบกพร่อง โอกาสนี้เป็นของคุณ</span>}
      </p>
      
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', 
        width: '100%', maxWidth: '280px', margin: '0 auto', marginBottom: '2rem'
      }}>
        {board.map((val, idx) => (
          <motion.div
            key={idx}
            className={`${s.choice} ${val ? '' : s.clickable}`}
            style={{ 
              aspectRatio: '1/1', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold',
              color: val === 'X' ? 'var(--neon-primary)' : '#ff4d4d',
              padding: 0, margin: 0,
              background: val ? 'var(--bg-hover)' : 'var(--bg-card)'
            }}
            onClick={() => handleSquareClick(idx)}
            whileTap={!val && !winner && turn === 'X' ? { scale: 0.9 } : {}}
          >
            {val}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {winner && winner !== 'X' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{ color: winner === 'Draw' ? 'var(--text-main)' : '#ff4d4d', marginBottom: '1rem', fontWeight: 'bold' }}>
              {winner === 'Draw' ? 'เสมอกัน' : 'คุณพ่ายแพ้ให้กับ AI'}
            </p>
            <button className={s.choice} onClick={resetGame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto' }}>
              <RotateCcw size={18} /> ลองใหม่อีกครั้ง
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
