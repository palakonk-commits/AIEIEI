import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Settings, RefreshCw, User, CheckCircle2, Clock, XCircle, Trash2, ChevronDown } from 'lucide-react';
import { apiAdminAuth, apiAdminPlayers, apiAdminApprove, apiAdminDelete } from '../api';
import { Toast, ConfirmModal } from './SharedModals';
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
  
  // Custom Modal States
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('error');
  const [confirmData, setConfirmData] = useState({ isOpen: false, code: null });

  const showToast = (msg, type = 'error') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const loadPlayers = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const data = await apiAdminPlayers(password);
      setPlayers(data);
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ');
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
      showToast(approved ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย', 'success');
      loadPlayers();
    } catch {
      showToast('ดำเนินการไม่สำเร็จ');
    }
  };

  const requestDelete = (code) => {
    setConfirmData({ isOpen: true, code });
  };

  const executeDelete = async () => {
    const code = confirmData.code;
    setConfirmData({ isOpen: false, code: null });
    if (!code) return;
    try {
      await apiAdminDelete(password, code);
      showToast(`ลบผู้เล่น "${code}" สำเร็จ`, 'success');
      loadPlayers();
    } catch {
      showToast('ลบไม่สำเร็จ');
    }
  };

  const photoUrl = (code) =>
    `${BASE}/api/admin/photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;

  const regPhotoUrl = (code) =>
    `${BASE}/api/admin/reg-photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;

  if (!authed) {
    return (
      <div className={s.root}>
        <motion.form
          className={s.authCard}
          onSubmit={handleAuth}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={s.authIcon}><Lock size={32} strokeWidth={1.5} /></span>
          <h1 className={s.authTitle}>System Administration</h1>
          <input
            className={s.authInput}
            type="password"
            placeholder="Passcode required"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {authError && <p className={s.authError}>{authError}</p>}
          <button className={s.authBtn} type="submit">Authenticate</button>
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
        <h1 className={s.title}>
          <Settings size={28} strokeWidth={1.5} className={s.titleIcon} /> 
          Overview
        </h1>
        <p className={s.sub}>{players.length} Total Ops · {pendingCount} Pending</p>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`} onClick={() => setTab('all')}>
            All ({players.length})
          </button>
          <button className={`${s.tab} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => setTab('pending')}>
            Pending ({pendingCount})
          </button>
          <button className={s.refreshBtn} onClick={loadPlayers} disabled={loading}>
            <RefreshCw size={16} strokeWidth={1.5} className={loading ? s.spin : ''} />
            {loading ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </header>

      <div className={s.list}>
        <AnimatePresence>
          {filtered.map((p) => (
            <motion.div
              key={p.code}
              className={`${s.card} ${s.clickable}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(expandedId === p.code ? null : p.code)}
            >
              <div className={s.cardHead}>
                <div className={s.profileWrap}>
                  {p.reg_photo_mime ? (
                    <img
                      src={regPhotoUrl(p.code)}
                      alt="profile"
                      className={s.profileAvatar}
                    />
                  ) : (
                    <div className={s.profilePlaceholder}>
                      <User size={20} strokeWidth={1.5} />
                    </div>
                  )}
                  <div>
                    <p className={s.playerCode}>{p.code}</p>
                    <p className={s.playerMeta}>
                      {p.accepted_terms ? (
                        <span className={s.metaIconOk}><CheckCircle2 size={12} strokeWidth={1.5} /> Ack.</span>
                      ) : (
                        <span className={s.metaIconPending}><Clock size={12} strokeWidth={1.5} /> Pending</span>
                      )}
                      {' · '}
                      Sector {(p.solved || []).filter(Boolean).length}/5
                    </p>
                  </div>
                </div>
                <div className={s.cardHeadRight}>
                  <span className={`${s.statusBadge} ${s['status_' + p.photo_status]}`}>
                    {p.photo_status === 'none' && '—'}
                    {p.photo_status === 'pending' && <><Clock size={14} strokeWidth={1.5} /> Awaiting</>}
                    {p.photo_status === 'approved' && <><CheckCircle2 size={14} strokeWidth={1.5} /> Cleared</>}
                    {p.photo_status === 'rejected' && <><XCircle size={14} strokeWidth={1.5} /> Denied</>}
                  </span>
                  <button className={s.deleteBtn} onClick={(e) => { e.stopPropagation(); requestDelete(p.code); }} title="Purge Record">
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Level progress bar & answers */}
              {expandedId === p.code ? (
                <div className={s.expandedAnswers} onClick={(e) => e.stopPropagation()}>
                  <p className={s.answersTitle}>Log Trace:</p>
                  {(p.solved || []).map((done, i) => (
                    <div key={i} className={s.answerRow}>
                      <span className={`${s.answerLabel} ${done ? s.answerLabelDone : ''}`}>
                        {done ? <CheckCircle2 size={14} strokeWidth={1.5} /> : <Clock size={14} strokeWidth={1.5} />} L{i + 1}:
                      </span>
                      {p.answers && p.answers[i] ? (
                        <span className={s.answerText}>{p.answers[i]}</span>
                      ) : done && i === 4 ? (
                        <span className={s.answerText}>Visual Logged.</span>
                      ) : done ? (
                        <span className={s.answerMissing}>N/A</span>
                      ) : (
                        <span className={s.answerNotPassed}>Incomplete</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={s.progressRow}>
                  <div className={s.clickToExpand}>Expand Details <ChevronDown size={14} strokeWidth={1.5} /></div>
                </div>
              )}

              {/* Photo section if uploaded */}
              {expandedId === p.code && p.photo_status !== 'none' && p.photo_mime && (
                <div className={s.photoSection} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={photoUrl(p.code)}
                    alt="uploaded"
                    className={s.photoImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {p.photo_status === 'pending' && (
                    <div className={s.photoActions}>
                      <button className={s.approveBtn} onClick={(e) => { e.stopPropagation(); handleApprove(p.code, true); }}>
                        <CheckCircle2 size={14} strokeWidth={1.5} /> Approve
                      </button>
                      <button className={s.rejectBtn} onClick={(e) => { e.stopPropagation(); handleApprove(p.code, false); }}>
                        <XCircle size={14} strokeWidth={1.5} /> Reject
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
            {tab === 'pending' ? 'No pending visual logs.' : 'Database empty.'}
          </p>
        )}
      </div>

      <Toast
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg('')}
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title="Confirm Purge"
        message={`Authorize termination of operative "${confirmData.code}" records?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmData({ isOpen: false, code: null })}
      />
    </div>
  );
}