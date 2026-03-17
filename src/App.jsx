import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserCircle, Fingerprint } from 'lucide-react';
import { apiLogin, apiAcceptTerms, apiGetLevels } from './api';
import useGame from './hooks/useGame';
import EntryScreen from './components/EntryScreen';
import TermsModal from './components/TermsModal';
import LevelCard from './components/LevelCard';
import LevelPanel from './components/LevelPanel';
import s from './App.module.css';
import { Toast } from './components/SharedModals';

export default function App() {
  const [step, setStep] = useState('entry'); // 'entry' | 'terms' | 'game'
  const [playerCode, setPlayerCode] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    apiGetLevels()
      .then(data => {
        setLevels(data);
      })
      .catch(err => {
        console.error('Failed to load levels', err);
        showToast('ไม่สามารถโหลดข้อมูลคำถามได้', 'error');
      })
      .finally(() => setLoadingLevels(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const game = useGame(playerCode, levels);
  const { solved, activeId, busy, doneCount, playableCount, photoStatus, open, close, checkChoice, refreshProgress } = game;
  const activeIdx = activeId !== null ? levels.findIndex(l => l.id === activeId) : -1;
  const activeLevel = activeIdx >= 0 ? levels[activeIdx] : null;

  if (loadingLevels) {
    return (
      <div className={s.root} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Fingerprint size={48} color="var(--neon-primary)" />
        </motion.div>
        <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>กำลังเชื่อมต่อฐานข้อมูลส่วนกลาง...</p>
      </div>
    );
  }

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
        onAccept={async (photoFile) => {
          try {
            await apiAcceptTerms(playerCode, photoFile);
            setStep('game');
          } catch (error) {
            console.error(error);
            showToast('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
            throw error; // Throw to let TermModal know to stop loading
          }
        }}
      />
    );
  }

  // Step 3: Game
  return (
    <div className={s.root}>
      <header className={s.header}>
        <motion.p className={s.tag} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          โปรโตคอลลับขั้นสูง
        </motion.p>
        <motion.h1 className={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          ปฏิบัติการ: ยืนยันตัวตน
        </motion.h1>
        <motion.p className={s.sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          ถอดรหัสปริศนาทั้งห้าเพื่อเปิดเผยข้อมูลเป้าหมาย
        </motion.p>
        <motion.div className={s.counter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <span className={s.playerTag}>
            <UserCircle size={14} className={s.userIcon} strokeWidth={1.5} />
            {playerCode}
          </span>
          <span className={s.counterNum}>{doneCount}</span>
          <span className={s.counterSlash}>/</span>
          <span className={s.counterTotal}>{playableCount}</span>
          <span className={s.counterLabel}>ถอดรหัสแล้ว</span>
        </motion.div>
      </header>

      <motion.div className={s.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {levels.map((lv, i) => (
          <LevelCard
            key={lv.id}
            icon={lv.icon}
            label={lv.label || `ขั้นที่ ${i + 1}`}
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
            onCheckChoice={(ok, answerText, cb) => checkChoice(activeIdx, ok, answerText, cb)}
            onRefresh={refreshProgress}
          />
        )}
      </AnimatePresence>
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
    </div>
  );
}
