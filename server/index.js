import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';

const { Pool } = pg;

// ─── Config ───
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/eoi';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'boss1234';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ─── Auto-create table ───
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      accepted_terms BOOLEAN DEFAULT false,
      solved JSONB DEFAULT '[]',
      photo BYTEA,
      photo_mime VARCHAR(50),
      photo_status VARCHAR(20) DEFAULT 'none',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Database ready');
}

// ─── Routes ───

// POST /api/login — create or get player
app.post('/api/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || code.trim().length < 2) {
      return res.status(400).json({ error: 'รหัสต้องมีอย่างน้อย 2 ตัวอักษร' });
    }
    const trimmed = code.trim();

    // Try to find existing player
    let result = await pool.query('SELECT * FROM players WHERE code = $1', [trimmed]);

    if (result.rows.length === 0) {
      // Create new player with empty solved array for 5 levels
      result = await pool.query(
        'INSERT INTO players (code, solved) VALUES ($1, $2) RETURNING *',
        [trimmed, JSON.stringify([false, false, false, false, false])]
      );
    }

    const player = result.rows[0];
    res.json({
      code: player.code,
      accepted_terms: player.accepted_terms,
      solved: player.solved,
      photo_status: player.photo_status,
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/accept-terms
app.post('/api/accept-terms', async (req, res) => {
  try {
    const { code } = req.body;
    await pool.query(
      'UPDATE players SET accepted_terms = true, updated_at = NOW() WHERE code = $1',
      [code]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('accept-terms error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/progress/:code — get player progress
app.get('/api/progress/:code', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT solved, photo_status FROM players WHERE code = $1',
      [req.params.code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้เล่น' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/solve — mark a level as solved
app.post('/api/solve', async (req, res) => {
  try {
    const { code, levelIdx } = req.body;
    const result = await pool.query('SELECT solved FROM players WHERE code = $1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้เล่น' });
    }

    const solved = result.rows[0].solved;
    if (levelIdx >= 0 && levelIdx < solved.length) {
      solved[levelIdx] = true;
      await pool.query(
        'UPDATE players SET solved = $1, updated_at = NOW() WHERE code = $2',
        [JSON.stringify(solved), code]
      );
    }
    res.json({ solved });
  } catch (err) {
    console.error('solve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/upload — upload photo for Level 5
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const { code } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'ไม่มีไฟล์' });
    }

    await pool.query(
      `UPDATE players SET photo = $1, photo_mime = $2, photo_status = 'pending', updated_at = NOW() WHERE code = $3`,
      [req.file.buffer, req.file.mimetype, code]
    );
    res.json({ ok: true, status: 'pending' });
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin Routes ───

// POST /api/admin/auth — verify admin password
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
});

// GET /api/admin/players — list all players (requires password header)
app.get('/api/admin/players', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      'SELECT code, accepted_terms, solved, photo_status, photo_mime, created_at, updated_at FROM players ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('admin players error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/photo/:code — get player photo
app.get('/api/admin/photo/:code', async (req, res) => {
  const pw = req.headers['x-admin-password'] || req.query.p;
  if (pw !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      'SELECT photo, photo_mime FROM players WHERE code = $1',
      [req.params.code]
    );
    if (result.rows.length === 0 || !result.rows[0].photo) {
      return res.status(404).json({ error: 'No photo' });
    }
    const { photo, photo_mime } = result.rows[0];
    res.set('Content-Type', photo_mime);
    res.send(photo);
  } catch (err) {
    console.error('admin photo error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/approve — approve or reject a player's photo
app.post('/api/admin/approve', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { code, approved } = req.body;
    const status = approved ? 'approved' : 'rejected';

    // If approved, also mark level 5 (index 4) as solved
    if (approved) {
      const result = await pool.query('SELECT solved FROM players WHERE code = $1', [code]);
      if (result.rows.length > 0) {
        const solved = result.rows[0].solved;
        solved[4] = true;
        await pool.query(
          'UPDATE players SET solved = $1, photo_status = $2, updated_at = NOW() WHERE code = $3',
          [JSON.stringify(solved), status, code]
        );
      }
    } else {
      await pool.query(
        'UPDATE players SET photo_status = $1, updated_at = NOW() WHERE code = $2',
        [status, code]
      );
    }

    res.json({ ok: true, status });
  } catch (err) {
    console.error('admin approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Start ───
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
