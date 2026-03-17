import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, CheckCircle2, Save, Image as ImageIcon, Type, Layout } from 'lucide-react';
import s from './AdminQuestionBuilder.module.css';
import ChoiceLevel from './Levels/ChoiceLevel';

// Temporary fallback for new levels
const defaultLevel = {
  id: Date.now(),
  type: 'choice-standard', // or 'choice-image', 'text-only'
  question: 'ตั้งคำถามของคุณที่นี่...',
  choices: [
    { text: 'ตัวเลือก 1', ok: true },
    { text: 'ตัวเลือก 2', ok: false }
  ]
};

export default function AdminQuestionBuilder() {
  const [levels, setLevels] = useState([defaultLevel]);
  const [activeId, setActiveId] = useState(defaultLevel.id);
  const [levelForm, setLevelForm] = useState(defaultLevel);

  const activeLevelContext = levels.find(l => l.id === activeId) || levelForm;

  const handleUpdate = (field, value) => {
    setLevelForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChoiceUpdate = (i, field, value) => {
    const newChoices = [...levelForm.choices];
    newChoices[i] = { ...newChoices[i], [field]: value };
    handleUpdate('choices', newChoices);
  };

  const handleSave = () => {
    setLevels(prev => prev.map(l => l.id === levelForm.id ? levelForm : l));
    // In real app, call API here
    alert('บันทึกสำเร็จ');
  };

  const addChoice = () => {
    handleUpdate('choices', [...levelForm.choices, { text: 'ตัวเลือกใหม่', ok: false }]);
  };

  return (
    <div className={s.builderContainer}>
      <div className={s.editorPanel}>
        <div className={s.header}>
          <h2><Layout size={20} strokeWidth={1.5} /> เครื่องมือสร้างคำถาม (Real-time Builder)</h2>
          <button className={s.saveBtn} onClick={handleSave}>
            <Save size={16} strokeWidth={1.5} /> บันทึกข้อมูล
          </button>
        </div>

        <div className={s.formGroup}>
          <label>ประเภทคำถาม</label>
          <div className={s.typeSelector}>
            <button
              className={levelForm.type === 'choice-standard' ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'choice-standard')}
            >
              <Type size={16} /> ข้อความล้วน
            </button>
            <button
              className={levelForm.type === 'choice-image' ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'choice-image')}
            >
              <ImageIcon size={16} /> รูปภาพ
            </button>
          </div>
        </div>

        <div className={s.formGroup}>
          <label>โจทย์ / คำถาม</label>
          <textarea
            className={s.input}
            rows={3}
            value={levelForm.question}
            onChange={(e) => handleUpdate('question', e.target.value)}
            placeholder="โปรดระบุคำถามให้ชัดเจน"
          />
        </div>

        <div className={s.formGroup}>
          <label>ตัวเลือก (ระบุเฉลยด้วยการติ๊กถูก)</label>
          <div className={s.choiceList}>
            {levelForm.choices.map((ch, i) => (
              <div key={i} className={s.choiceItem}>
                <button
                  className={`${s.isOkBtn} ${ch.ok ? s.isOkActive : ''}`}
                  onClick={() => handleChoiceUpdate(i, 'ok', !ch.ok)}
                  title={ch.ok ? "คำตอบที่ถูกต้อง" : "ตัวเลือกลวง"}
                >
                  <CheckCircle2 size={16} />
                </button>
                <input
                  type="text"
                  className={s.input}
                  value={ch.text}
                  onChange={(e) => handleChoiceUpdate(i, 'text', e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className={s.addBtn} onClick={addChoice}>
            <Plus size={16} /> เพิ่มตัวเลือก
          </button>
        </div>
      </div>

      <div className={s.previewPanel}>
        <div className={s.previewHeader}>โหมดพรีวิว (Live Preview)</div>
        <div className={s.mockPhone}>
          <motion.div
            className={s.phoneScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={JSON.stringify(levelForm)} // force remount on change for animation
          >
            {/* We reuse the ChoiceLevel component from frontend */}
            <ChoiceLevel
              level={levelForm}
              busy={false}
              result={null}
              onChoice={() => {}}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
