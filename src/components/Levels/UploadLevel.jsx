/* ── UploadLevel.jsx ── */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, XCircle, Camera, RotateCw, CheckCircle, UploadCloud } from 'lucide-react';
import { apiUploadPhoto } from '../../api';
import s from './Levels.module.css';
import { Toast } from '../SharedModals';

export default function UploadLevel({ level, playerCode, photoStatus, onRefresh }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(photoStatus || 'none');
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const inputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
      showToast('อัปโหลดข้อมูลเสร็จสิ้น', 'success');
    } catch {
      showToast('การอัปโหลดล้มเหลว โปรดดำเนินการใหม่อีกครั้ง', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Already pending or approved
  if (status === 'pending') {
    return (
      <div className={s.section}>
        <div className={s.uploadStatus}>
          <span className={s.uploadStatusIcon}>
             <Clock size={32} strokeWidth={1.5} color="var(--primary)" />
          </span>
          <p className={s.uploadStatusText}>อัปโหลดเรียบร้อย — รอการอนุมัติสิทธิ์เข้าถึง</p>
          <p className={s.uploadStatusHint}>ระบบกำลังประมวลผล กรุณาตรวจสอบสถานะในภายหลัง</p>
          <button className={s.refreshBtn} onClick={onRefresh}>
             <RotateCw size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
             ตรวจสอบสถานะ
          </button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className={s.section}>
        <div className={s.uploadStatus}>
          <span className={s.uploadStatusIcon}>
            <XCircle size={32} strokeWidth={1.5} color="var(--red)" />
          </span>
          <p className={s.uploadStatusText}>การตรวจสอบล้มเหลว — โปรดดำเนินการอัปโหลดภาพที่ถูกต้องอีกครั้ง</p>
          <button className={s.uploadBtn} onClick={() => { setStatus('none'); setFile(null); setPreview(null); }}>
            <Camera size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} /> บันทึกภาพใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.section}>
      <p className={s.question}>{level.question}</p>
      <p className={s.uploadDesc}>
        <Camera size={16} strokeWidth={1.5} style={{ display: 'inline', marginRight: '6px' }} />
        บันทึกภาพหลักฐานการเข้าถึงตามที่ระบุในภารกิจ
      </p>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
              <RotateCw size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} /> ปรับเปลี่ยนข้อมูลภาพ
            </button>
            <button className={s.uploadBtn} onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Clock size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} /> กำลังถ่ายโอนข้อมูล...
                </>
              ) : (
                <>
                  <CheckCircle size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} /> ยืนยันการส่งข้อมูล
                </>
              )}
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
          <span className={s.uploadAreaIcon}>
            <UploadCloud size={32} strokeWidth={1.5} color="var(--text-3)" />
          </span>
          <span className={s.uploadAreaText}>ดำเนินการอัปโหลดภาพหลักฐานการยืนยัน</span>
        </motion.button>
      )}
      
      <Toast 
        message={toastMsg} 
        type={toastType} 
        onClose={() => setToastMsg(null)} 
      />
    </div>
  );
}
