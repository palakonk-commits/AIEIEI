import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, ShieldCheck, Camera, RefreshCw, ArrowRight } from 'lucide-react';
import s from './TermsModal.module.css';

export default function TermsModal({ playerCode, onAccept }) {
  const [checked, setChecked] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleStart = async () => {
    if (!checked || !file || loading) return;
    setLoading(true);
    try {
      await onAccept(file);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={s.root}>
        <motion.div
          className={s.loadingCard}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.spinner}></div>
          <p className={s.loadingText}>Processing clearance...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className={s.icon}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ShieldAlert size={28} strokeWidth={1.5} />
        </motion.div>

        <motion.h2 
          className={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          CLEARANCE REQUIRED
        </motion.h2>

        <motion.p 
          className={s.hello}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Operative: <strong className={s.playerCodeAccent}>{playerCode}</strong>
        </motion.p>

        <motion.div 
          className={s.rules}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <p className={s.rulesTitle}>
            <BookOpen size={16} strokeWidth={2} className={s.inlineIcon} /> Protocol Directives
          </p>
          <ul className={s.rulesList}>
            <li>This sequence is strictly for orientation.</li>
            <li>Submissions are final. Revision is disabled.</li>
            <li>Maintain integrity. Do not share solutions.</li>
            <li>Execute with precision, but remain composed.</li>
            <li>Contact a senior operative for clearance issues.</li>
          </ul>
        </motion.div>

        <motion.div 
          className={s.warning}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p className={s.warningTitle}>
            <ShieldCheck size={16} strokeWidth={2} className={s.inlineIcon} /> Secure Protocol
          </p>
          <p className={s.warningText}>
            Progress logs and visual data are securely encrypted on the central frame. Re-authenticate with your alias to resume at any time.
          </p>
        </motion.div>

        <motion.div 
          className={s.photoRequirement}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <p className={`${s.warningTitle} ${s.photoTitle}`}>
            <Camera size={16} strokeWidth={2} className={s.inlineIcon} /> Biometric Submission
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="camera"
            onChange={handleFile}
            className={s.hiddenInput}
          />
          {preview ? (
            <div className={s.previewWrap}>
              <img src={preview} alt="preview" className={s.previewImage} />
              <button
                onClick={() => inputRef.current?.click()}
                className={s.retakeBtn}
              >
                <RefreshCw size={12} strokeWidth={2} style={{ marginRight: 6 }} /> Recalibrate
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className={s.cameraBtn}
            >
              Provide Scan
            </button>
          )}
        </motion.div>

        <motion.label 
          className={s.checkRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className={s.checkbox}
          />
          <span className={s.checkLabel}>
            Protocol acknowledged.
          </span>
        </motion.label>

        <motion.button
          className={`${s.btn} ${(!checked || !file) ? s.btnDisabled : ''}`}
          disabled={!checked || !file}
          onClick={handleStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          whileHover={checked && file ? { scale: 1.02 } : {}}
          whileTap={checked && file ? { scale: 0.98 } : {}}
        >
          Proceed <ArrowRight size={16} strokeWidth={2} style={{ marginLeft: 6}} />
        </motion.button>
      </motion.div>
    </div>
  );
}
