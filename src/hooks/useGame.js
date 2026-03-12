import { useState, useCallback, useEffect } from 'react';
import { LEVELS } from '../data/levels';
import { apiProgress, apiSolve } from '../api';

export default function useGame(playerCode) {
  const [solved, setSolved] = useState(() => Array(LEVELS.length).fill(false));
  const [photoStatus, setPhotoStatus] = useState('none'); // none | pending | approved | rejected
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Exclude locked & upload from "playable" count (upload solved by admin approval)
  const playable = LEVELS.filter(l => l.type !== 'locked');
  const allDone = playable.every((_, i) => {
    const realIdx = LEVELS.indexOf(playable[i]);
    return solved[realIdx];
  });
  const doneCount = solved.filter(Boolean).length;
  const playableCount = playable.length;

  // Load progress from backend on mount / playerCode change
  useEffect(() => {
    if (!playerCode) return;
    apiProgress(playerCode)
      .then((data) => {
        if (Array.isArray(data.solved)) setSolved(data.solved);
        if (data.photo_status) setPhotoStatus(data.photo_status);
      })
      .catch(() => {}); // silently fail — fresh state
  }, [playerCode]);

  const open = useCallback((id) => setActiveId(id), []);
  const close = useCallback(() => setActiveId(null), []);

  const solve = useCallback((idx) => {
    setSolved((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    // Fire-and-forget save to backend
    if (playerCode) apiSolve(playerCode, idx).catch(() => {});
  }, [playerCode]);

  const checkChoice = useCallback((idx, isCorrect, cb) => {
    if (!isCorrect) { cb('wrong'); return; }
    setBusy(true);
    setTimeout(() => {
      solve(idx);
      cb('ok');
      setBusy(false);
    }, 1200);
  }, [solve]);

  const refreshProgress = useCallback(() => {
    if (!playerCode) return;
    apiProgress(playerCode)
      .then((data) => {
        if (Array.isArray(data.solved)) setSolved(data.solved);
        if (data.photo_status) setPhotoStatus(data.photo_status);
      })
      .catch(() => {});
  }, [playerCode]);

  return {
    solved, activeId, busy, allDone, doneCount, playableCount,
    photoStatus, setPhotoStatus,
    open, close, checkChoice, refreshProgress,
  };
}
