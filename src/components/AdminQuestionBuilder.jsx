import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, CheckCircle2, Save, Image as ImageIcon, Type, Layout, RefreshCw } from 'lucide-react';
import s from './AdminQuestionBuilder.module.css';
import ChoiceLevel from './Levels/ChoiceLevel';
import { apiAdminGetLevels, apiAdminSaveLevels } from '../api';

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

export default function AdminQuestionBuilder({ password, showToast }) {
  const [levels, setLevels] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [levelForm, setLevelForm] = useState(defaultLevel);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const data = await apiAdminGetLevels(password);
      if (data && data.length > 0) {
        setLevels(data);
        setActiveId(data[0].id);
        setLevelForm(data[0]);
      } else {
        setLevels([defaultLevel]);
        setActiveId(defaultLevel.id);
        setLevelForm(defaultLevel);
      }
    } catch {
      if (showToast) showToast('โหลดข้อมูลคำถามไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field, value) => {
    setLevelForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChoiceUpdate = (i, field, value) => {
    const newChoices = [...levelForm.choices];
    newChoices[i] = { ...newChoices[i], [field]: value };
    handleUpdate('choices', newChoices);
  };

  const handleLevelSelect = (lvl) => {
    // Before switching, maybe save current changes locally?
    // But let's explicitly make user hit Save if they want to.
    setActiveId(lvl.id);
    setLevelForm(lvl);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // First update the current active level in the list
      const updatedLevels = levels.map(l => l.id === levelForm.id ? levelForm : l);
      setLevels(updatedLevels);
      
      await apiAdminSaveLevels(password, updatedLevels);
      if (showToast) showToast('บันทึกชุดคำถามสำเร็จ', 'success');
      else alert('บันทึกสำเร็จ');
    } catch {
      if (showToast) showToast('บันทึกคำถามไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addChoice = () => {
    handleUpdate('choices', [...(levelForm.choices || []), { text: 'ตัวเลือกใหม่', ok: false }]);
  };

  const addNewLevel = () => {
    const newLvl = {
      ...defaultLevel,
      id: Date.now(),
      question: 'คำถามใหม่',
      title: 'ด่านใหม่'
    };
    setLevels([...levels, newLvl]);
    setActiveId(newLvl.id);
    setLevelForm(newLvl);
  };

  if (loading) {
    return (
      <div className={s.builderContainer}>
        <div style={{ padding: '2rem', color: 'var(--text-dim)' }}>
          กำลังโหลดชุดคำถาม...
        </div>
      </div>
    );
  }

  return (
    <div className={s.builderContainer}>
      <div className={s.sidebarPanel}>
         <h3>ชุดคำถามทั้งหมด</h3>
         <div className={s.levelList}>
           {levels.map((l, i) => (
             <button
               key={l.id}
               className={`${s.levelListItem} ${l.id === activeId ? s.levelListActive : ''}`}
               onClick={() => handleLevelSelect(l)}
             >
               <span className={s.levelNum}>#{i + 1}</span> {l.title || l.label || 'ไม่มีชื่อด่าน'}
             </button>
           ))}
         </div>
         <button className={s.addNewLevelBtn} onClick={addNewLevel}>
           <Plus size={16} /> เพิ่มด่านใหม่
         </button>
      </div>

      <div className={s.editorPanel}>
        <div className={s.header}>
          <h2><Layout size={20} strokeWidth={1.5} /> จัดการด่าน (ระดับ {levels.findIndex(l => l.id === activeId) + 1})</h2>
          <button className={s.saveBtn} onClick={handleSaveAll} disabled={saving}>
            {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} strokeWidth={1.5} />} 
            บันทึกลงระบบ
          </button>
        </div>

        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label>ชื่อด่าน (Title)</label>
            <input 
              type="text" 
              className={s.input} 
              value={levelForm.title || ''} 
              onChange={e => handleUpdate('title', e.target.value)} 
            />
          </div>

          <div className={s.formGroup}>
            <label>รายละเอียด (Description)</label>
            <textarea 
              className={s.input} 
              rows={2}
              value={levelForm.desc || ''} 
              onChange={e => handleUpdate('desc', e.target.value)} 
            />
          </div>
        </div>

        <div className={s.formGroup}>
          <label>รูปแบบคำถาม (Level Type)</label>
          <div className={s.typeSelector}>
            <button
              className={levelForm.type === 'choice-all-correct' ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'choice-all-correct')}
              title="ข้อใดก็ได้"
            >
              <CheckCircle2 size={16} /> แบบเลือกข้อเดียวผ่าน
            </button>
            <button
              className={levelForm.type === 'choice-standard' || !levelForm.type.includes('choice') ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'choice-standard')}
              title="มาตรฐาน (มีข้อถูก/ผิด)"
            >
              <Type size={16} /> มาตรฐาน
            </button>
            <button
              className={levelForm.type === 'choice-pin-unlock' ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'choice-pin-unlock')}
              title="ใส่รหัสผ่านก่อนเข้าชุดคำถาม"
            >
              <Layout size={16} /> ใส่รหัสผ่าน
            </button>
            <button
              className={levelForm.type === 'upload' ? s.typeActive : ''}
              onClick={() => handleUpdate('type', 'upload')}
              title="อัปโหลดรูปภาพเท่านั้น"
            >
              <ImageIcon size={16} /> อัปโหลดภาพ
            </button>
          </div>
        </div>

        <div className={s.formGroup}>
          <label>โจทย์ / คำถาม</label>
          <textarea
            className={s.input}
            rows={3}
            value={levelForm.question || ''}
            onChange={(e) => handleUpdate('question', e.target.value)}
            placeholder="โปรดระบุคำถามให้ชัดเจน"
          />
        </div>

        {levelForm.type !== 'upload' && (
          <div className={s.formGroup}>
            <label>ตัวเลือก (ระบุเฉลยด้วยการติ๊กถูก)</label>
            <div className={s.choiceList}>
              {(levelForm.choices || []).map((ch, i) => (
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
                  <button className={s.removeChoiceBtn} onClick={() => {
                    const nc = [...levelForm.choices];
                    nc.splice(i, 1);
                    handleUpdate('choices', nc);
                  }}>
                    ลบ
                  </button>
                </div>
              ))}
            </div>
            <button className={s.addBtn} onClick={addChoice}>
              <Plus size={16} /> เพิ่มตัวเลือก
            </button>
          </div>
        )}
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
