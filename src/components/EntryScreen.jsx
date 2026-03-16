import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Fingerprint } from 'lucide-react';
import s from './EntryScreen.module.css';

export default function EntryScreen({ onSubmit, busy, error: parentError }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const displayError = parentError || error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError('กรุณาระบุข้อมูลเพื่อเข้าสู่ระบบ');
      return;
    }
    if (trimmed.length < 2) {
      setError('ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง');
      return;
    }
    onSubmit(trimmed);
  };

  if (busy) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.card}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.loadingBox}>
            <div className={s.fingerprintScanner}>
              <Fingerprint className={s.fingerprintIconBase} strokeWidth={1} />
              
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden'
                }}
                animate={{ height: ['0%', '100%', '0%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <Fingerprint className={s.fingerprintIconActive} strokeWidth={1.5} />
              </motion.div>

              <motion.div
                className={s.scanLine}
                animate={{ y: [0, 80, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <h2 className={s.loadingTitle}>กำลังตรวจสอบลายนิ้วมือดิจิทัล</h2>
            <p className={s.loadingSub}>ระบบกำลังเข้ารหัสเพื่อสิทธิเข้าถึงของคุณ...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <motion.div
        className={s.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className={s.iconWrap}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Fingerprint className={s.icon} strokeWidth={1} />
        </motion.div>

        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ยืนยันตัวตน
        </motion.h1>

        <motion.p
          className={s.sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          โปรดระบุรหัสนักศึกษาหรือชื่อเล่นของคุณเพื่อเข้าถึงระบบ
        </motion.p>

        <motion.form
          className={s.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.inputWrap}>
            <input
              className={s.input}
              type="text"
              placeholder="รหัสประจำตัว"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              autoFocus
            />
            <span className={s.inputLine}></span>
          </div>
          <AnimatePresence>
            {displayError && (
              <motion.p
                className={s.error}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {displayError}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button 
            className={s.btn} 
            type="submit" 
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            ดำเนินการเข้าสู่ระบบ
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
