import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './TermsModal.module.css';

export default function TermsModal({ playerCode, onAccept }) {
  const [checked, setChecked] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleStart = () => {
    if (!checked || !file) return;
    setLoading(true);
  };

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onAccept();
            }, 300);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loading, onAccept]);

  if (loading) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.loadingCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={s.spinner}></div>
          <p className={s.loadingText}>กำลังเตรียมความพร้อม...</p>
          <div className={s.progressBarWrap}>
            <div className={s.progressBar} style={{ width: `${progress}%` }} />
          </div>
          <p className={s.progressText}>{progress}%</p>
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
        <span className={s.icon}>⚠️</span>

        <h2 className={s.title}>คำเตือนก่อนเริ่มภารกิจ</h2>

        <p className={s.hello}>
          สวัสดี <strong>{playerCode}</strong> 👋
        </p>

        <div className={s.rules}>
          <p className={s.rulesTitle}>📋 กฎกติกา — อ่านให้จบก่อนนะ!</p>
          <ul className={s.rulesList}>
            <li>เกมนี้เป็นส่วนหนึ่งของกิจกรรมรับน้อง P'Code – N'Code</li>
            <li>ทุกคำตอบจะถูกบันทึกไว้ ไม่สามารถแก้ไขได้</li>
            <li>ห้ามแชร์คำตอบให้เพื่อน — เล่นด้วยตัวเองนะ!</li>
            <li>สนุกกับมัน อย่าเครียด 😄</li>
            <li>ถ้ามีปัญหาให้ติดต่อรุ่นพี่ได้เลย</li>
          </ul>
        </div>

        <div className={s.warning}>
          <p className={s.warningTitle}>📡 ข้อมูลสำคัญ</p>
          <p className={s.warningText}>
            ข้อมูลของคุณถูกเก็บไว้ <strong>บนเซิร์ฟเวอร์</strong> — เล่นจากเครื่องไหนก็ได้แค่ใส่รหัสเดิมที่เคยใช้ ข้อมูลจะกลับมาเหมือนเดิม!
          </p>
        </div>

        <div className={s.photoRequirement}>
          <p className={s.warningTitle} style={{color: '#fff', marginBottom: '8px'}}>📸 ถ่ายรูปยืนยันตัวตน</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="camera"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          {preview ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: '200px', margin: '0 auto 1rem auto' }}>
              <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--accent)' }} />
              <button 
                onClick={() => inputRef.current?.click()}
                style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              >
                ถ่ายใหม่
              </button>
            </div>
          ) : (
            <button 
              onClick={() => inputRef.current?.click()}
              style={{ width: '100%', padding: '0.8rem', background: 'var(--elevated)', border: '1px dashed var(--accent)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', marginBottom: '1rem' }}
            >
              แตะเพื่อเปิดกล้องถ่ายรูป
            </button>
          )}
        </div>

        <label className={s.checkRow}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className={s.checkbox}
          />
          <span className={s.checkLabel}>
            ฉันได้อ่านและยอมรับเงื่อนไขแล้ว
          </span>
        </label>

        <button
          className={`${s.btn} ${(!checked || !file) ? s.btnDisabled : ''}`}
          disabled={!checked || !file}
          onClick={handleStart}
        >
          เริ่มภารกิจ 🚀
        </button>
      </motion.div>
    </div>
  );
}
