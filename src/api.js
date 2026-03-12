// API helper — all backend calls

const BASE = import.meta.env.VITE_API_URL || 'https://aieiei.onrender.com';

const json = (r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

/** Login or create player */
export async function apiLogin(code) {
  return fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).then(json);
}

/** Accept terms */
export async function apiAcceptTerms(code) {
  return fetch(`${BASE}/api/accept-terms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).then(json);
}

/** Get player progress */
export async function apiProgress(code) {
  return fetch(`${BASE}/api/progress/${encodeURIComponent(code)}`).then(json);
}

/** Mark a level as solved */
export async function apiSolve(code, levelIdx) {
  return fetch(`${BASE}/api/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, levelIdx }),
  }).then(json);
}

/** Upload photo for Level 5 */
export async function apiUploadPhoto(code, file) {
  const fd = new FormData();
  fd.append('code', code);
  fd.append('photo', file);
  return fetch(`${BASE}/api/upload`, { method: 'POST', body: fd }).then(json);
}

// ── Admin ──

/** Verify admin password */
export async function apiAdminAuth(password) {
  return fetch(`${BASE}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(json);
}

/** Get all players (admin) */
export async function apiAdminPlayers(password) {
  return fetch(`${BASE}/api/admin/players`, {
    headers: { 'x-admin-password': password },
  }).then(json);
}

/** Get photo URL for player */
export function adminPhotoUrl(code, password) {
  return `${BASE}/api/admin/photo/${encodeURIComponent(code)}?p=${encodeURIComponent(password)}`;
}

/** Approve/reject photo */
export async function apiAdminApprove(password, code, approved) {
  return fetch(`${BASE}/api/admin/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
    },
    body: JSON.stringify({ code, approved }),
  }).then(json);
}
