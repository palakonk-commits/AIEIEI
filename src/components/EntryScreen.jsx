import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import s from './EntryScreen.module.css';

export default function EntryScreen({ onSubmit, busy: parentBusy, error: parentError }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loadingCode, setLoadingCode] = useState(null);
  const [progress, setProgress] = useState(0);

  const displayError = parentError || error;

  // Reset loading state if parent gives an error back
  useEffect(() => {
    if (parentError && loadingCode) {
      setLoadingCode(null);
      setProgress(0);
    }
  }, [parentError]);

  useEffect(() => {
    if (loadingCode) {
      let current = 0;
      const interval = setInterval(() => {
        // Random increment between 5 and 20
        current += Math.floor(Math.random() * 15) + 5;
        if (current >= 100) {
          current = 100;
          setProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            onSubmit(loadingCode);
          }, 400); // Wait a bit at 100% before submitting
        } else {
          setProgress(current);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loadingCode, onSubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parentBusy || loadingCode) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError('กรุณาใส่รหัสนักศึกษาหรือชื่อเล่น');
      return;
    }
    if (trimmed.length < 2) {
      setError('กรุณาใส่อย่างน้อย 2 ตัวอักษร');
      return;
    }
    setLoadingCode(trimmed);
  };

  if (loadingCode) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.card}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={s.loadingBox}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className={s.loadingIcon}
            >
              ⚙️
            </motion.div>
            <h2 className={s.loadingTitle}>กำลังเชื่อมต่อเข้าสู่ระบบ...</h2>
            <p className={s.loadingSub}>เตรียมพร้อมภารกิจ P'Code สำหรับ <span>{loadingCode}</span></p>
            
            <div className={s.progressWrap}>
              <div className={s.progressBar}>
                <motion.div
                  className={s.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className={s.progressText}>{progress}%</p>
            </div>
            
            <p className={s.loadingDesc}>
              {progress < 30 && 'กำลังดาวน์โหลดข้อมูลภารกิจ...'}
              {progress >= 30 && progress < 70 && 'กำลังถอดรหัสระบบ...'}
              {progress >= 70 && progress < 100 && 'เชื่อมต่อฐานข้อมูล...'}
              {progress === 100 && 'เสร็จสิ้น!'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <motion.span
          className={s.icon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
        >
          🕵️
        </motion.span>

        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI MISSION
        </motion.h1>

        <motion.p
          className={s.sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ค้นหารุ่นพี่ P'Code — ใส่รหัสของคุณเพื่อเริ่มภารกิจ
        </motion.p>

        <motion.form
          className={s.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <input
            className={s.input}
            type="text"
            placeholder="รหัสนักศึกษา หรือ ชื่อเล่น"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            autoFocus
          />
          {displayError && (
            <motion.p
              className={s.error}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {displayError}
            </motion.p>
          )}
          <button className={s.btn} type="submit" disabled={parentBusy}>
            {parentBusy ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ภารกิจ →'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
