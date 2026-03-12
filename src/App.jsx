import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LEVELS } from './data/levels';
import { apiLogin, apiAcceptTerms } from './api';
import useGame from './hooks/useGame';
import EntryScreen from './components/EntryScreen';
import TermsModal from './components/TermsModal';
import LevelCard from './components/LevelCard';
import LevelPanel from './components/LevelPanel';
import s from './App.module.css';

export default function App() {
  const [step, setStep] = useState('entry'); // 'entry' | 'terms' | 'game'
  const [playerCode, setPlayerCode] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  const game = useGame(playerCode);
  const { solved, activeId, busy, doneCount, playableCount, photoStatus, open, close, checkChoice, refreshProgress } = game;
  const activeIdx = activeId !== null ? LEVELS.findIndex(l => l.id === activeId) : -1;
  const activeLevel = activeIdx >= 0 ? LEVELS[activeIdx] : null;

  // Step 1: Entry
  if (step === 'entry') {
    return (
      <EntryScreen
        busy={loginBusy}
        error={loginError}
        onSubmit={async (code) => {
          setLoginBusy(true);
          setLoginError('');
          try {
            const data = await apiLogin(code);
            setPlayerCode(data.code);
            if (data.accepted_terms) {
              setStep('game');
            } else {
              setStep('terms');
            }
          } catch {
            setLoginError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ลองใหม่อีกครั้ง');
          } finally {
            setLoginBusy(false);
          }
        }}
      />
    );
  }

  // Step 2: Terms
  if (step === 'terms') {
    return (
      <TermsModal
        playerCode={playerCode}
        onAccept={async () => {
          try {
            await apiAcceptTerms(playerCode);
          } catch {}
          setStep('game');
        }}
      />
    );
  }

  // Step 3: Game
  return (
    <div className={s.root}>
      <header className={s.header}>
        <motion.p className={s.tag} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          AI MISSION
        </motion.p>
        <motion.h1 className={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          ค้นหารุ่นพี่ P'Code
        </motion.h1>
        <motion.p className={s.sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          แก้ปริศนา 5 ด่าน เพื่อค้นพบว่ารุ่นพี่ของคุณคือใคร
        </motion.p>
        <motion.div className={s.counter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <span className={s.playerTag}>👤 {playerCode}</span>
          <span className={s.counterNum}>{doneCount}</span>
          <span className={s.counterSlash}>/</span>
          <span className={s.counterTotal}>{playableCount}</span>
          <span className={s.counterLabel}>สำเร็จแล้ว</span>
        </motion.div>
      </header>

      <motion.div className={s.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {LEVELS.map((lv, i) => (
          <LevelCard
            key={lv.id}
            emoji={lv.emoji}
            label={lv.label}
            title={lv.title}
            done={solved[i]}
            clue={lv.clue}
            index={i}
            onOpen={() => open(lv.id)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {activeLevel && (
          <LevelPanel
            key="panel"
            level={activeLevel}
            idx={activeIdx}
            done={solved[activeIdx]}
            busy={busy}
            playerCode={playerCode}
            photoStatus={photoStatus}
            onClose={close}
            onCheckChoice={(ok, cb) => checkChoice(activeIdx, ok, cb)}
            onRefresh={refreshProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
