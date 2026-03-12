import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './TermsModal.module.css';

export default function TermsModal({ playerCode, onAccept }) {
  const [checked, setChecked] = useState(false);

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
            ข้อมูลของคุณถูกเก็บไว้ <strong>บนเซิร์ฟเวอร์</strong> — เล่นจากเครื่องไหนก็ได้
            แค่ใส่รหัสเดิมที่เคยใช้ ข้อมูลจะกลับมาเหมือนเดิม!
          </p>
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
          className={`${s.btn} ${!checked ? s.btnDisabled : ''}`}
          disabled={!checked}
          onClick={onAccept}
        >
          เริ่มภารกิจ 🚀
        </button>
      </motion.div>
    </div>
  );
}
