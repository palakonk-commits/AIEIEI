import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiAdminAuth, apiAdminPlayers, apiAdminApprove, apiAdminDelete } from '../api';
import s from './AdminPage.module.css';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'pending'
  const [expandedId, setExpandedId] = useState(null); // Keep track of which card is expanded

  const loadPlayers = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const data = await apiAdminPlayers(password);
      setPlayers(data);
    } catch {
      alert('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await apiAdminAuth(password);
      setAuthed(true);
    } catch {
      setAuthError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  useEffect(() => {
    if (authed) loadPlayers();
  }, [authed, loadPlayers]);

  const handleApprove = async (code, approved) => {
    try {
      await apiAdminApprove(password, code, approved);
      loadPlayers();
    } catch {
      alert('ดำเนินการไม่สำเร็จ');
    }
  };

  const handleDelete = async (code) => {
    if (!confirm(`ลบผู้เล่น "${code}" จริงหรือไม่?`)) return;
    try {
      await apiAdminDelete(password, code);
      loadPlayers();
    } catch {
      alert('ลบไม่สำเร็จ');
    }
  };

  const photoUrl = (code) =>
    `${BASE}/api/admin/photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;

  if (!authed) {
    return (
      <div className={s.root}>
        <motion.form
          className={s.authCard}
          onSubmit={handleAuth}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={s.authIcon}>🔐</span>
          <h1 className={s.authTitle}>Admin Panel</h1>
          <input
            className={s.authInput}
            type="password"
            placeholder="รหัสผ่าน Admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {authError && <p className={s.authError}>{authError}</p>}
          <button className={s.authBtn} type="submit">เข้าสู่ระบบ</button>
        </motion.form>
      </div>
    );
  }

  const filtered = tab === 'pending'
    ? players.filter(p => p.photo_status === 'pending')
    : players;

  const pendingCount = players.filter(p => p.photo_status === 'pending').length;

  return (
    <div className={s.root}>
      <header className={s.header}>
        <h1 className={s.title}>🛠 Admin Panel</h1>
        <p className={s.sub}>{players.length} ผู้เล่นทั้งหมด · {pendingCount} รอตรวจ</p>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`} onClick={() => setTab('all')}>
            ทั้งหมด ({players.length})
          </button>
          <button className={`${s.tab} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => setTab('pending')}>
            รอตรวจ ({pendingCount})
          </button>
          <button className={s.refreshBtn} onClick={loadPlayers} disabled={loading}>
            🔄 {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        </div>
      </header>

      <div className={s.list}>
        <AnimatePresence>
          {filtered.map((p) => (
            <motion.div
              key={p.code}
              className={s.card}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className={s.cardHead} onClick={() => setExpandedId(expandedId === p.code ? null : p.code)} style={{ cursor: 'pointer' }}>
                <div>
                  <p className={s.playerCode}>{p.code}</p>
                  <p className={s.playerMeta}>
                    {p.accepted_terms ? '✅ ยอมรับเงื่อนไข' : '⏳ ยังไม่ยอมรับ'}
                    {' · '}
                    ผ่าน {(p.solved || []).filter(Boolean).length}/5
                  </p>
                </div>
                <div className={s.cardHeadRight}>
                  <span className={`${s.statusBadge} ${s['status_' + p.photo_status]}`}>
                    {p.photo_status === 'none' && '—'}
                    {p.photo_status === 'pending' && '⏳ รอตรวจ'}
                    {p.photo_status === 'approved' && '✅ อนุมัติ'}
                    {p.photo_status === 'rejected' && '❌ ปฏิเสธ'}
                  </span>
                  <button className={s.deleteBtn} onClick={() => handleDelete(p.code)} title="ลบผู้เล่น">
                    🗑
                  </button>
                </div>
              </div>

              {/* Level progress bar & answers */}
              {expandedId === p.code ? (
                <div className={s.expandedAnswers}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>รายการคำตอบ:</p>
                  {(p.solved || []).map((done, i) => (
                    <div key={i} style={{ marginBottom: '6px', fontSize: '0.9rem', color: '#ccc' }}>
                      <span style={{ color: done ? '#4ade80' : '#888', marginRight: '8px' }}>
                        {done ? '✅' : '⏳'} Level {i + 1}:
                      </span>
                      {p.answers && p.answers[i] ? (
                        <span style={{ color: '#fff' }}>{p.answers[i]}</span>
                      ) : done && i === 4 ? (
                        <span style={{ color: '#fff' }}>อัปโหลดรูปภาพแล้ว</span>
                      ) : done ? (
                        <span style={{ color: '#ffb86c', fontStyle: 'italic' }}>ไม่มีข้อมูลคำตอบ</span>
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>ยังไม่ผ่าน</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={s.progressRow}>
                  {(p.solved || []).map((done, i) => (
                    <div key={i} className={s.levelBox}>
                      <div className={`${s.dot} ${done ? s.dotDone : ''}`}>
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#888' }}>{'คลิกเพื่อดูคำตอบ ⬇️'}</div>
                </div>
              )}

              {/* Photo section if uploaded */}
              {p.photo_status !== 'none' && p.photo_mime && (
                <div className={s.photoSection}>
                  <img
                    src={photoUrl(p.code)}
                    alt="uploaded"
                    className={s.photoImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    // Pass password via fetch if needed — for now direct URL
                  />
                  {p.photo_status === 'pending' && (
                    <div className={s.photoActions}>
                      <button className={s.approveBtn} onClick={() => handleApprove(p.code, true)}>
                        ✅ อนุมัติ
                      </button>
                      <button className={s.rejectBtn} onClick={() => handleApprove(p.code, false)}>
                        ❌ ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className={s.empty}>
            {tab === 'pending' ? 'ไม่มีรูปที่รอตรวจ' : 'ยังไม่มีผู้เล่น'}
          </p>
        )}
      </div>
    </div>
  );
}
