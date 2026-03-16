import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Fingerprint, Camera, ShieldAlert, Cloud } from 'lucide-react';
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className={s.spinner}></div>
          <p className={s.loadingText}>กำลังตรวจสอบและเข้ารหัสข้อมูล...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.span 
          className={s.iconWrap}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.4 }}
        >
          <AlertTriangle size={32} color="var(--primary)" strokeWidth={1.5} />
        </motion.span>

        <motion.h2 
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          ระเบียบปฏิบัติก่อนเริ่มภารกิจ
        </motion.h2>

        <motion.p 
          className={s.hello}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          ข้อมูลเป้าหมาย: <strong>{playerCode}</strong>
        </motion.p>

        <motion.div 
          className={s.rules}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <p className={s.rulesTitle}>
            <ShieldAlert size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
            ข้อตกลงและเงื่อนไข
          </p>
          <ul className={s.rulesList}>
            <li>ภารกิจนี้เป็นส่วนหนึ่งของการทดสอบศักยภาพ P'Code – N'Code</li>
            <li>ข้อมูลการตัดสินใจจะถูกซิงค์เข้าระบบทันทีและไม่อาจย้อนกลับได้</li>
            <li>ห้ามเผยแพร่ข้อมูลภารกิจ ถือเป็นความลับขั้นสูงสุด</li>
            <li>จงตั้งใจวิเคราะห์เบาะแสที่ซ่อนอยู่</li>
            <li>หากพบความไม่เสถียรของระบบ โปรดแจ้งผู้ดูแลทันที</li>
          </ul>
        </motion.div>

        <motion.div 
          className={s.warning}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p className={s.warningTitle}>
            <Cloud size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
            ระบบคลาวด์รับรอง
          </p>
          <p className={s.warningText}>
            ข้อมูลจะถูกบันทึกไว้ <strong>บนเซิร์ฟเวอร์กลาง</strong> — สามารถเชื่อมต่อโครงข่ายจากอุปกรณ์ใดก็ได้ผ่านรหัสประจำตัว
          </p>
        </motion.div>

        <motion.div 
          className={s.photoRequirement}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <p className={`${s.warningTitle} ${s.photoTitle}`}>
            <Camera size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
            กรุณายืนยันตัวตนด้วยภาพถ่าย
          </p>
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
                ปรับเปลี่ยนข้อมูลภาพ
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className={s.cameraBtn}
            >
              เปิดระบบกล้องบันทึกภาพ
            </button>
          )}
        </motion.div>

        <motion.label 
          className={s.checkRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className={s.checkbox}
          />
          <span className={s.checkLabel}>
            ข้าพเจ้ารับทราบระเบียบปฏิบัติและพร้อมยืนยันตัวตน
          </span>
        </motion.label>

        <motion.button
          className={`${s.btn} ${(!checked || !file) ? s.btnDisabled : ''}`}
          disabled={!checked || !file}
          onClick={handleStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          whileHover={checked && file ? { scale: 1.02 } : {}}
          whileTap={checked && file ? { scale: 0.98 } : {}}
        >
          <Fingerprint size={18} strokeWidth={1.5} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
          อนุมัติการเข้าถึง
        </motion.button>
      </motion.div>
    </div>
  );
}
