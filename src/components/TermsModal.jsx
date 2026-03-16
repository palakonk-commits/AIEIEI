import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './TermsModal.module.css';

export default function TermsModal({ playerCode, onAccept }) {
  const [checked, setChecked] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleStart = async () => {
    if (!checked || !file || loading) return;
    setLoading(true);
    try {
      await onAccept(file);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.loadingCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={s.spinner}></div>
          <p className={s.loadingText}>กำลังบันทึกข้อมูลและเตรียมภารกิจ...</p>
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
          <p className={`${s.warningTitle} ${s.photoTitle}`}>📸 ถ่ายรูปยืนยันตัวตน</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="camera"
            onChange={handleFile}
            className={s.hiddenInput}
          />
          {preview ? (
            <div className={s.previewWrap}>
              <img src={preview} alt="preview" className={s.previewImage} />
              <button
                onClick={() => inputRef.current?.click()}
                className={s.retakeBtn}
              >
                ถ่ายใหม่
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className={s.cameraBtn}
            >
              แตะเพื่อเปิดกล้องถ่ายรูป
            </button>
          )}
        </div>        <label className={s.checkRow}>
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
