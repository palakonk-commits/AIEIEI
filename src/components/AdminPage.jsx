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
          <h1 className={s.authTitle}>ระบบจัดการส่วนกลาง</h1>
          <input
            className={s.authInput}
            type="password"
            placeholder="ระบุรหัสผ่านผู้ดูแลระบบ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {authError && <p className={s.authError}>{authError}</p>}
          <button className={s.authBtn} type="submit">ยืนยันการเข้าถึง</button>
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
                จัดการผู้เล่น
              </h1>
              <p className={s.sub}>ผู้เล่นทั้งหมด {players.length} บัญชี · รอตรวจสอบ {pendingCount} รายการ</p>
              <div className={s.tabs}>
                <button className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`} onClick={() => setTab('all')}>
                  ทั้งหมด ({players.length})
                </button>
                <button className={`${s.tab} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => setTab('pending')}>
                  รอตรวจสอบ ({pendingCount})
                </button>
                <button className={s.refreshBtn} onClick={loadPlayers} disabled={loading}>
                  <RefreshCw size={16} strokeWidth={1.5} className={loading ? s.spin : ''} />
                  {loading ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล'}
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
                              <span className={s.metaIconOk}><CheckCircle2 size={12} strokeWidth={1.5} /> ยอมรับเงื่อนไข</span>
                            ) : (
                              <span className={s.metaIconPending}><Clock size={12} strokeWidth={1.5} /> รอยืนยัน</span>
                            )}
                            {' · '}
                            ผ่านด่าน {(p.solved || []).filter(Boolean).length}/5
                          </p>
                        </div>
                      </div>
                      <div className={s.cardHeadRight}>
                        <span className={`${s.statusBadge} ${s['status_' + p.photo_status]}`}>
                          {p.photo_status === 'none' && '—'}
                          {p.photo_status === 'pending' && <><Clock size={14} strokeWidth={1.5} /> รอตรวจสอบ</>}
                          {p.photo_status === 'approved' && <><CheckCircle2 size={14} strokeWidth={1.5} /> อนุมัติแล้ว</>}
                          {p.photo_status === 'rejected' && <><XCircle size={14} strokeWidth={1.5} /> ปฏิเสธ</>}
                        </span>
                        <button className={s.deleteBtn} onClick={(e) => { e.stopPropagation(); requestDelete(p.code); }} title="ลบข้อมูล">
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Level progress bar & answers */}
                    {expandedId === p.code ? (
                      <div className={s.expandedAnswers} onClick={(e) => e.stopPropagation()}>
                        <p className={s.answersTitle}>บันทึกการทำรายการ:</p>
                        {(p.solved || []).map((done, i) => (
                          <div key={i} className={s.answerRow}>
                            <span className={`${s.answerLabel} ${done ? s.answerLabelDone : ''}`}>
                              {done ? <CheckCircle2 size={14} strokeWidth={1.5} /> : <Clock size={14} strokeWidth={1.5} />} ด่าน {i + 1}:
                            </span>
                            {p.answers && p.answers[i] ? (
                              <span className={s.answerText}>{p.answers[i]}</span>
                            ) : done && i === 4 ? (
                              <span className={s.answerText}>ลงข้อมูลภาพแล้ว</span>
                            ) : done ? (
                              <span className={s.answerMissing}>ไม่มีข้อมูล</span>
                            ) : (
                              <span className={s.answerNotPassed}>ยังไม่ผ่าน</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={s.progressRow}>
                        <div className={s.clickToExpand}>แสดงรายละเอียดเพิ่มเติม <ChevronDown size={14} strokeWidth={1.5} /></div>
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
                              <CheckCircle2 size={14} strokeWidth={1.5} /> อนุมัติ
                            </button>
                            <button className={s.rejectBtn} onClick={(e) => { e.stopPropagation(); handleApprove(p.code, false); }}>
                              <XCircle size={14} strokeWidth={1.5} /> ปฏิเสธ
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
                  {tab === 'pending' ? 'ไม่มีรายการรอตรวจสอบ' : 'ไม่พบข้อมูลผู้เล่น'}
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
              ปิด
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
        title="ยืนยันการลบข้อมูล"
        message={`ต้องการลบข้อมูลผู้เล่น "${confirmData.code}" ใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmData({ isOpen: false, code: null })}
      />
    </div>
  );
}