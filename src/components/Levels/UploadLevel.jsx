import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiUploadPhoto } from '../../api';
import s from './Levels.module.css';

export default function UploadLevel({ level, playerCode, photoStatus, onRefresh }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(photoStatus || 'none');
  const inputRef = useRef(null);

  // Sync when parent photoStatus changes (e.g. after refresh)
  useEffect(() => {
    if (photoStatus) setStatus(photoStatus);
  }, [photoStatus]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const data = await apiUploadPhoto(playerCode, file);
      setStatus(data.status || 'pending');
      if (onRefresh) onRefresh();
    } catch {
      alert('อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setUploading(false);
    }
  };

  // Already pending or approved
  if (status === 'pending') {
    return (
      <div className={s.section}>
        <div className={s.uploadStatus}>
          <span className={s.uploadStatusIcon}>⏳</span>
          <p className={s.uploadStatusText}>อัปโหลดแล้ว — รอรุ่นพี่อนุมัติ</p>
          <p className={s.uploadStatusHint}>กลับมาเช็คทีหลังนะ!</p>
          <button className={s.refreshBtn} onClick={onRefresh}>🔄 เช็คสถานะ</button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className={s.section}>
        <div className={s.uploadStatus}>
          <span className={s.uploadStatusIcon}>❌</span>
          <p className={s.uploadStatusText}>รูปถูกปฏิเสธ — ลองถ่ายใหม่แล้วส่งอีกครั้ง</p>
          <button className={s.uploadBtn} onClick={() => { setStatus('none'); setFile(null); setPreview(null); }}>
            📸 ถ่ายใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p className={s.uploadDesc}>📷 ถ่ายรูปคู่กับรุ่นพี่ของคุณแล้วอัปโหลดมาเลย!</p>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="camera"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {preview ? (
        <motion.div
          className={s.previewWrap}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img src={preview} alt="preview" className={s.previewImg} />
          <div className={s.previewActions}>
            <button className={s.uploadBtnSecondary} onClick={() => inputRef.current?.click()}>
              🔄 เปลี่ยนรูป
            </button>
            <button className={s.uploadBtn} onClick={handleUpload} disabled={uploading}>
              {uploading ? '⏳ กำลังอัปโหลด...' : '✅ ส่งรูปนี้'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          className={s.uploadArea}
          onClick={() => inputRef.current?.click()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className={s.uploadAreaIcon}>📸</span>
          <span className={s.uploadAreaText}>แตะเพื่อเปิดกล้องถ่ายรูป</span>
        </motion.button>
      )}
    </div>
  );
}
