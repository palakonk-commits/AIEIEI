import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, Edit, Undo2, Smartphone, Monitor, Minimize2, Maximize2,
  Gamepad2, Users, FileText, Database, Plus
} from 'lucide-react';
import s from './AdminLevelEditor.module.css';
import { LEVELS as initialLevels } from '../data/levels';
import { List } from 'react-window';

const MOCK_LEVELS = Array.from({ length: 1000 }).map((_, i) => ({
  id: i + 1011,
  title: `คำถามจำลองที่ ${i + 1011}`,
  type: 'choice-all-correct',
  desc: 'นี่คือข้อมูลที่สร้างขึ้นเพื่อทดสอบ List Virtualization',
  question: `ระบบสามารถรองรับข้อมูลที่ ${i + 1011} ได้อย่างลื่นไหลหรือไม่?`,
  category: 'จำลอง'
}));

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearInterval(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminLevelEditor() {
  const [levels, setLevels] = useState(() => {
    return initialLevels.map(l => ({
      ...l,
      category: l.id <= 5 ? 'มาตรฐาน' : l.id === 10 ? 'บอส' : 'มินิเกม'
    }));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  // Undo system
  const [deletedQueue, setDeletedQueue] = useState([]);
  const deleteTimers = useRef({});

  // Zen Mode Editor
  const [editingId, setEditingId] = useState(null);
  const [previewMode, setPreviewMode] = useState('mobile');

  // Generator 1000 items
  const generateMockData = () => {
    if (levels.length > 50) return; // Prevent double gen
    const mock = [];
    for (let i = 11; i <= 1010; i++) {
        mock.push({
            id: i,
            title: `คำถามจำลองที่ ${i}`,
            type: 'choice-all-correct',
            desc: 'นี่คือข้อมูลที่สร้างขึ้นเพื่อทดสอบ List Virtualization',
            question: `ระบบสามารถรองรับข้อมูลที่ ${i} ได้อย่างลื่นไหลหรือไม่?`,
            category: 'จำลอง'
        });
    }
    setLevels(prev => [...prev, ...mock]);
  };

  const filteredLevels = useMemo(() => {
    return levels.filter(l => {
      const matchSearch = l.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          l.question?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = activeCategory === 'ทั้งหมด' || l.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [levels, debouncedSearch, activeCategory]);

  const handleDelete = (id) => {
    const itemToDelete = levels.find(l => l.id === id);
    if (!itemToDelete) return;

    // 1. Remove from list immediately
    setLevels(prev => prev.filter(l => l.id !== id));

    // 2. Add to deleted queue
    const deleteId = Date.now();
    setDeletedQueue(prev => [...prev, { tempId: deleteId, item: itemToDelete }]);

    // 3. Set timer to permanently remove from queue
    deleteTimers.current[deleteId] = setTimeout(() => {
      setDeletedQueue(prev => prev.filter(q => q.tempId !== deleteId));
      delete deleteTimers.current[deleteId];
      // Here usually you call backend API to permanently delete
    }, 5000);
  };

  const handleUndo = (tempId) => {
    // 1. Find item
    const queueItem = deletedQueue.find(q => q.tempId === tempId);
    if (!queueItem) return;

    // 2. Clear timer
    if (deleteTimers.current[tempId]) {
      clearTimeout(deleteTimers.current[tempId]);
      delete deleteTimers.current[tempId];
    }

    // 3. Restore to original index (sorted by ID)
    setLevels(prev => {
      const next = [...prev, queueItem.item];
      return next.sort((a, b) => a.id - b.id);
    });

    // 4. Remove from queue
    setDeletedQueue(prev => prev.filter(q => q.tempId !== tempId));
  };

  const activeItem = editingId ? levels.find(l => l.id === editingId) : null;

  const Row = ({ index, style }) => {
    const item = filteredLevels[index];
    if (!item) return null;
    return (
      <div style={style} className={s.row} onClick={() => setEditingId(item.id)}>
        <div className={s.colId}>{item.id}</div>
        <div className={s.colTitle}>{item.title} <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{item.question ? item.question.substring(0, 30) + '...' : ''}</span></div>
        <div className={s.colType}><span className={s.badge}>{item.type}</span></div>
        <div className={s.colCat}>{item.category}</div>
        <div className={s.colActions} onClick={e => e.stopPropagation()}>
          <button className={s.actionBtn} onClick={() => setEditingId(item.id)}>
            <Edit size={16} />
          </button>
          <button className={`${s.actionBtn} ${s.deleteHover}`} onClick={() => handleDelete(item.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={s.editorWrap}>
      <header className={s.header}>
        <div className={s.titleArea}>
          <h2><Database size={24} /> จัดการเนื้อหาด่าน (Level Editor)</h2>
          <p className={s.subTitle}>สร้าง แก้ไข และจัดการคำถามทั้งหมดได้อย่างอิสระ</p>
        </div>

        <div className={s.controls}>
          <button className={s.generateBtn} onClick={generateMockData}>
            <Plus size={16} /> สร้างข้อมูลจำลอง (1,000 ข้อ)
          </button>

          <div className={s.tabs}>
            {['ทั้งหมด', 'มาตรฐาน', 'มินิเกม', 'บอส', 'จำลอง'].map(cat => (
              <button
                key={cat}
                className={`${s.tab} ${activeCategory === cat ? s.tabActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={s.searchBox}>
            <Search size={18} className={s.searchIcon} />
            <input
              type="text"
              placeholder="ค้นหาชื่อด่านหรือคำถาม..."
              className={s.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className={s.listContainer}>
        <div className={s.listHeader}>
          <div className={s.colId}>ID</div>
          <div className={s.colTitle}>หัวข้อ (Title / Question)</div>
          <div className={s.colType}>รูปแบบเกม (Type)</div>
          <div className={s.colCat}>หมวดหมู่</div>
          <div className={s.colActions}>จัดการ</div>
        </div>

        {filteredLevels.length > 0 ? (
          <List
            height={600}
            itemCount={filteredLevels.length}
            itemSize={64}
            width={'100%'}
          >
            {Row}
          </List>
        ) : (
          <div className={s.emptyState}>ไม่พบข้อมูลในหมวดหมู่หรือคำค้นหานี้</div>
        )}
      </div>

      {/* Undo Snackbar Overlay */}
      <div className={s.snackbarWrapper}>
         <AnimatePresence>
          {deletedQueue.length > 0 && (
            <motion.div
              className={s.snackbar}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <span>ลบ "{deletedQueue[deletedQueue.length - 1]?.item?.title}" ออกแล้ว</span>
              <button className={s.undoBtn} onClick={() => handleUndo(deletedQueue[deletedQueue.length - 1].tempId)}>
                <Undo2 size={16} /> เลิกทำ (Undo)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zen Mode Editor Overlay */}
      <AnimatePresence>
        {editingId && activeItem && (
          <motion.div
            className={s.zenOverlay}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          >
            <div className={s.zenHeader}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Maximize2 size={20} /> Zen Mode: กำลังแก้ไข {activeItem.id}
              </h3>

              <div className={s.zenControls}>
                <div className={s.tabs} style={{ marginRight: '2rem' }}>
                  <button
                    className={`${s.zenBtn} ${previewMode === 'mobile' ? s.zenBtnActive : ''}`}
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone size={16} /> มือถือ
                  </button>
                  <button
                    className={`${s.zenBtn} ${previewMode === 'desktop' ? s.zenBtnActive : ''}`}
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor size={16} /> เดสก์ท็อป
                  </button>
                </div>

                <button className={s.actionBtn} style={{ background: 'var(--neon-primary)', color: '#000', padding: '0.5rem 1.5rem', fontWeight: 'bold' }} onClick={() => setEditingId(null)}>
                  บันทึกแบบร่าง (Save)
                </button>
                <button className={s.actionBtn} onClick={() => setEditingId(null)}>
                  <Minimize2 size={20} /> ปิดโหมด
                </button>
              </div>
            </div>

            <div className={s.zenContent}>
              <div className={s.zenForm}>
                <h4 style={{ marginBottom: '2rem', color: 'var(--text-dim)' }}>รายละเอียดคำถาม</h4>

                <div className={s.formGroup}>
                  <label>หัวข้อด่าน (Title)</label>
                  <input type="text" defaultValue={activeItem.title} />
                </div>

                <div className={s.formGroup}>
                  <label>คำอธิบาย (Description)</label>
                  <textarea defaultValue={activeItem.desc} />
                </div>

                <div className={s.formGroup}>
                  <label>คำถามหลัก (Question)</label>
                  <input type="text" defaultValue={activeItem.question} />
                </div>

                <div className={s.formGroup}>
                  <label>คำใบ้สำหรับผู้เล่น (Clue)</label>
                  <input type="text" defaultValue={activeItem.clue} />
                </div>
              </div>

              <div className={s.zenPreview}>
                <div className={previewMode === 'mobile' ? s.phoneMockup : s.desktopMockup}>
                  <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <p style={{ color: 'var(--neon-primary)', fontSize: '0.8rem', letterSpacing: '2px' }}>{activeItem.label}</p>
                      <h2 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{activeItem.title}</h2>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{activeItem.desc}</p>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: 'auto', marginBottom: 'auto' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center' }}>{activeItem.question}</h3>
                      {activeItem.type.includes('choice') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button style={{ padding: '1rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>ตัวเลือกที่ 1</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}