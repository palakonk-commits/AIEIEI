import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Settings, RefreshCw, User, CheckCircle2, Clock, XCircle, Trash2, ChevronDown } from 'lucide-react';
import { apiAdminAuth, apiAdminPlayers, apiAdminApprove, apiAdminDelete } from '../api';
import { Toast, ConfirmModal } from './SharedModals';
import s from './AdminPage.module.css';
import AdminSidebar from './AdminSidebar';
import AdminLevelEditor from './AdminLevelEditor';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'pending'
  const [expandedId, setExpandedId] = useState(null); // Keep track of which card is expanded
  
  // New Admin UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('players'); // 'players' | 'questions' | 'settings'
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '' });

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
      showToast('à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ');
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
      setAuthError('à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡');
    }
  };

  useEffect(() => {
    if (authed) loadPlayers();
  }, [authed, loadPlayers]);

  const handleApprove = async (code, approved) => {
    try {
      await apiAdminApprove(password, code, approved);
      showToast(approved ? 'à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢' : 'à¸›à¸à¸´à¹€à¸ªà¸˜à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢', 'success');
      loadPlayers();
    } catch {
      showToast('à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ');
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
      showToast(`à¸¥à¸šà¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™ "${code}" à¸ªà¸³à¹€à¸£à¹‡à¸ˆ`, 'success');
      loadPlayers();
    } catch {
      showToast('à¸¥à¸šà¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ');
    }
  };

  const photoUrl = (code) =>
    `${BASE}/api/admin/photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;

  const regPhotoUrl = (code) =>
    `${BASE}/api/admin/reg-photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;

  const openImageModal = (src) => {
    setImageModal({ isOpen: true, src });
  };

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
          <h1 className={s.authTitle}>à¸£à¸°à¸šà¸šà¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¹ˆà¸§à¸™à¸à¸¥à¸²à¸‡</h1>
          <input
            className={s.authInput}
            type="password"
            placeholder="à¸£à¸°à¸šà¸¸à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¸œà¸¹à¹‰à¸”à¸¹à¹à¸¥à¸£à¸°à¸šà¸š"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {authError && <p className={s.authError}>{authError}</p>}
          <button className={s.authBtn} type="submit">à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¹€à¸‚à¹‰à¸²à¸–à¸¶à¸‡</button>
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
      <AdminSidebar
        isOpen={sidebarOpen}
        toggleMenu={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        setView={setCurrentView}
      />

      <main className={sidebarOpen ? s.mainShifted : s.mainContent}>
        {currentView === 'players' && (
          <>
            <header className={s.header}>
              <h1 className={s.title}>
                <Settings size={28} strokeWidth={1.5} className={s.titleIcon} />
                à¸ˆà¸±à¸”à¸à¸²à¸£à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™
              </h1>
              <p className={s.sub}>à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” {players.length} à¸šà¸±à¸à¸Šà¸µ Â· à¸£à¸­à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š {pendingCount} à¸£à¸²à¸¢à¸à¸²à¸£</p>
              <div className={s.tabs}>
                <button className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`} onClick={() => setTab('all')}>
                  à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” ({players.length})
                </button>
                <button className={`${s.tab} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => setTab('pending')}>
                  à¸£à¸­à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š ({pendingCount})
                </button>
                <button className={s.refreshBtn} onClick={loadPlayers} disabled={loading}>
                  <RefreshCw size={16} strokeWidth={1.5} className={loading ? s.spin : ''} />
                  {loading ? 'à¸à¸³à¸¥à¸±à¸‡à¸‹à¸´à¸‡à¸„à¹Œ...' : 'à¸‹à¸´à¸‡à¸„à¹Œà¸‚à¹‰à¸­à¸¡à¸¹à¸¥'}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(regPhotoUrl(p.code));
                            }}
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
                              <span className={s.metaIconOk}><CheckCircle2 size={12} strokeWidth={1.5} /> à¸¢à¸­à¸¡à¸£à¸±à¸šà¹€à¸‡à¸·à¹ˆà¸­à¸™à¹„à¸‚</span>
                            ) : (
                              <span className={s.metaIconPending}><Clock size={12} strokeWidth={1.5} /> à¸£à¸­à¸¢à¸·à¸™à¸¢à¸±à¸™</span>
                            )}
                            {' Â· '}
                            à¸œà¹ˆà¸²à¸™à¸”à¹ˆà¸²à¸™ {(p.solved || []).filter(Boolean).length}/5
                          </p>
                        </div>
                      </div>
                      <div className={s.cardHeadRight}>
                        <span className={`${s.statusBadge} ${s['status_' + p.photo_status]}`}>
                          {p.photo_status === 'none' && 'â€”'}
                          {p.photo_status === 'pending' && <><Clock size={14} strokeWidth={1.5} /> à¸£à¸­à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š</>}
                          {p.photo_status === 'approved' && <><CheckCircle2 size={14} strokeWidth={1.5} /> à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹à¸¥à¹‰à¸§</>}
                          {p.photo_status === 'rejected' && <><XCircle size={14} strokeWidth={1.5} /> à¸›à¸à¸´à¹€à¸ªà¸˜</>}
                        </span>
                        <button className={s.deleteBtn} onClick={(e) => { e.stopPropagation(); requestDelete(p.code); }} title="à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥">
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Level progress bar & answers */}
                    {expandedId === p.code ? (
                      <div className={s.expandedAnswers} onClick={(e) => e.stopPropagation()}>
                        <p className={s.answersTitle}>à¸šà¸±à¸™à¸—à¸¶à¸à¸à¸²à¸£à¸—à¸³à¸£à¸²à¸¢à¸à¸²à¸£:</p>
                        {(p.solved || []).map((done, i) => (
                          <div key={i} className={s.answerRow}>
                            <span className={`${s.answerLabel} ${done ? s.answerLabelDone : ''}`}>
                              {done ? <CheckCircle2 size={14} strokeWidth={1.5} /> : <Clock size={14} strokeWidth={1.5} />} à¸”à¹ˆà¸²à¸™ {i + 1}:
                            </span>
                            {p.answers && p.answers[i] ? (
                              <span className={s.answerText}>{p.answers[i]}</span>
                            ) : done && i === 4 ? (
                              <span className={s.answerText}>à¸¥à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ à¸²à¸žà¹à¸¥à¹‰à¸§</span>
                            ) : done ? (
                              <span className={s.answerMissing}>à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥</span>
                            ) : (
                              <span className={s.answerNotPassed}>à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸œà¹ˆà¸²à¸™</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={s.progressRow}>
                        <div className={s.clickToExpand}>à¹à¸ªà¸”à¸‡à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡ <ChevronDown size={14} strokeWidth={1.5} /></div>
                      </div>
                    )}

                    {/* Photo section if uploaded */}
                    {expandedId === p.code && p.photo_status !== 'none' && p.photo_mime && (
                      <div className={s.photoSection} onClick={(e) => e.stopPropagation()}>
                        <img
                          src={photoUrl(p.code)}
                          alt="uploaded"
                          className={s.photoImg}
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageModal(photoUrl(p.code));
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {p.photo_status === 'pending' && (
                          <div className={s.photoActions}>
                            <button className={s.approveBtn} onClick={(e) => { e.stopPropagation(); handleApprove(p.code, true); }}>
                              <CheckCircle2 size={14} strokeWidth={1.5} /> à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´
                            </button>
                            <button className={s.rejectBtn} onClick={(e) => { e.stopPropagation(); handleApprove(p.code, false); }}>
                              <XCircle size={14} strokeWidth={1.5} /> à¸›à¸à¸´à¹€à¸ªà¸˜
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
                  {tab === 'pending' ? 'à¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£à¸£à¸­à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š' : 'à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™'}
                </p>
              )}
            </div>
          </>
        )}

        {currentView === 'levels' && <AdminLevelEditor />}

        {currentView === 'settings' && (
          <div className={s.settingsPlaceholder}>
            <h2>ตั้งค่าระบบ (อยู่ในระหว่างการพัฒนา)</h2>
          </div>
        )}
      </main>

      {/* Image Modal (Framer Motion) */}
      <AnimatePresence>
        {imageModal.isOpen && (
          <motion.div
            className={s.imageModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageModal({ isOpen: false, src: '' })}
          >
            <motion.img
              src={imageModal.src}
              className={s.imageModalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()} /* Prevent closing when clicking the image */
            />
            <button
              className={s.imageModalClose}
              onClick={() => setImageModal({ isOpen: false, src: '' })}
            >
              à¸›à¸´à¸”
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg('')}
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title="à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥"
        message={`à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™ "${confirmData.code}" à¹ƒà¸Šà¹ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ? à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸°à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸à¸¹à¹‰à¸„à¸·à¸™à¹„à¸”à¹‰`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmData({ isOpen: false, code: null })}
      />
    </div>
  );
}
