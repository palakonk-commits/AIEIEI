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
      answers JSONB DEFAULT '[]',
      photo BYTEA,
      photo_mime VARCHAR(50),
      photo_status VARCHAR(20) DEFAULT 'none',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_config (
      key VARCHAR(50) PRIMARY KEY,
      value JSONB
    )
  `);

  // Migration: Add answers column if it doesn't exist
  try {
    await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS reg_photo BYTEA`);
    await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS reg_photo_mime VARCHAR(50)`);
  } catch (e) {
    console.log('Migration answers column already exists or error:', e.message);
  }

  // Initialize default levels config if missing
  const res = await pool.query(`SELECT value FROM system_config WHERE key = 'levels'`);
  if (res.rows.length === 0) {
    const defaultLevels = [
      {
        id: 1, icon: 'ShieldQuestion', label: 'ขั้นที่ 1',
        title: 'การประเมินเบื้องต้น',
        type: 'choice-all-correct',
        desc: 'เลือกระเบียบวิธีเพื่อดำเนินการต่อ ระบบจะยอมรับการตัดสินใจของคุณ',
        question: 'คุณพร้อมที่จะเริ่มต้นกระบวนการหรือไม่?',
        choices: [
          { text: 'ยืนยันและดำเนินการ', ok: true },
          { text: 'ข้ามขั้นและดำเนินการต่อ', ok: true },
          { text: 'รับทราบข้อตกลง', ok: true },
          { text: 'อนุมัติการเข้าถึง', ok: true },
        ],
        clue: 'หมู',
      },
      {
        id: 2, icon: 'Hash', label: 'ขั้นที่ 2',
        title: 'ตรรกะเชิงคณิตศาสตร์',
        type: 'choice-hidden-5th',
        desc: 'วิเคราะห์โครงสร้างข้อมูลอย่างละเอียด บางตัวแปรอาจถูกซ่อนไว้ในระบบ',
        question: 'หาก 5 + 5 = 10\nจงประเมินค่า: 20 + 20',
        choices: [
          { text: '30', ok: false },
          { text: '50', ok: false },
          { text: '100', ok: false },
          { text: '20', ok: false },
        ],
        hiddenChoice: { text: '40', ok: true },
        clue: 'พาหนะเฉพาะตัว',
      },
      {
        id: 3, icon: 'Terminal', label: 'ขั้นที่ 3',
        title: 'ชุดคำสั่งที่ถูกเข้ารหัส',
        type: 'choice-pin-unlock',
        desc: 'ตรวจพบการเข้ารหัสลับ ระบุรหัสผ่าน PIN 6 หลักเพื่อปลดล็อกตัวเลือก',
        pinLength: 6,
        question: 'วิเคราะห์ชุดคำสั่ง: print("Code")\nจงระบุภาษาและผลลัพธ์ที่ได้',
        choices: [
          { text: 'Python — ผลลัพธ์: "Code"', ok: true },
          { text: 'C++ — ผลลัพธ์: "Code"', ok: false },
          { text: 'HTML — ผลลัพธ์: "Code"', ok: false },
        ],
        clue: '15',
      },
      {
        id: 4, icon: 'Database', label: 'ขั้นที่ 4',
        title: 'การแยกตัวแปรข้อมูล',
        type: 'choice-image-reveal',
        desc: 'ประมวลผลข้อมูลจำลองด้านล่าง และระบุตำแหน่งของตัวแปร',
        codeSnippet: 'name = "Code"\nprint(name)',
        question: 'องค์ประกอบใดทำหน้าที่เป็นตัวแปรในระบบนี้?',
        choices: [
          { text: 'Code', ok: false },
          { text: 'name', ok: true },
          { text: 'print', ok: false },
        ],
        revealImage: '/level4.jpg',
        clue: 'บุคคลสำคัญ',
      },
      {
        id: 5, icon: 'Camera', label: 'ขั้นที่ 5',
        title: 'การยืนยันทางกายภาพ',
        type: 'upload',
        desc: 'ส่งมอบหลักฐานทางภาพถ่ายที่เกี่ยวข้องกับเป้าหมายเพื่ออนุมัติขั้นสุดท้าย',
        question: 'อัปโหลดภาพถ่ายเพื่อประมวลผลการยืนยัน',
        choices: [],
        revealImages: ['/level5-1.jpg', '/level5-2.png', '/level5-3.jpg'],
        clue: 'เรื่องราว',
      }
    ];
    await pool.query(`INSERT INTO system_config (key, value) VALUES ('levels', $1)`, [JSON.stringify(defaultLevels)]);
  }

  console.log('✅ Database ready');
}

// ─── Routes ───

// GET /api/levels — get all levels for players
app.get('/api/levels', async (req, res) => {
  try {
    const result = await pool.query(`SELECT value FROM system_config WHERE key = 'levels'`);
    if (result.rows.length > 0) {
      res.json(result.rows[0].value);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('get levels error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

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
app.post('/api/accept-terms', upload.single('photo'), async (req, res) => {
  try {
    const code = req.body.code;
    const file = req.file;

    if (file) {
      await pool.query(
        'UPDATE players SET accepted_terms = true, reg_photo = $1, reg_photo_mime = $2, updated_at = NOW() WHERE code = $3',
        [file.buffer, file.mimetype, code]
      );
    } else {
      await pool.query(
        'UPDATE players SET accepted_terms = true, updated_at = NOW() WHERE code = $1',
        [code]
      );
    }
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
    const { code, levelIdx, answer } = req.body;
    const result = await pool.query('SELECT solved, answers FROM players WHERE code = $1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้เล่น' });
    }

    const solved = result.rows[0].solved;
    const answers = result.rows[0].answers || [null, null, null, null, null];
    
    if (levelIdx >= 0 && levelIdx < solved.length) {
      solved[levelIdx] = true;
      if (answer !== undefined) {
        while (answers.length <= levelIdx) answers.push(null);
        answers[levelIdx] = answer;
      }
      
      await pool.query(
        'UPDATE players SET solved = $1, answers = $2, updated_at = NOW() WHERE code = $3',
        [JSON.stringify(solved), JSON.stringify(answers), code]
      );
    }
    res.json({ solved, answers });
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

// ▬▬▬ Admin Routes ▬▬▬

// GET /api/admin/levels — get levels for editing
app.get('/api/admin/levels', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(`SELECT value FROM system_config WHERE key = 'levels'`);
    res.json(result.rows.length > 0 ? result.rows[0].value : []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/levels — update levels configuration
app.put('/api/admin/levels', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const levels = req.body;
    await pool.query(`
      INSERT INTO system_config (key, value)
      VALUES ('levels', $1)
      ON CONFLICT (key) DO UPDATE SET value = $1
    `, [JSON.stringify(levels)]);
    res.json({ ok: true });
  } catch (err) {
    console.error('update levels error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

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
      'SELECT code, accepted_terms, solved, answers, photo_status, photo_mime, reg_photo_mime, created_at, updated_at FROM players ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('admin players error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/reg-photo/:code — get player registration photo
app.get('/api/admin/reg-photo/:code', async (req, res) => {
  const pw = req.headers['x-admin-password'] || req.query.p;
  if (pw !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const code = req.params.code;
    const result = await pool.query('SELECT reg_photo, reg_photo_mime FROM players WHERE code = $1', [code]);
    if (result.rows.length === 0 || !result.rows[0].reg_photo) {
      return res.status(404).send('Not found');
    }
    const { reg_photo, reg_photo_mime } = result.rows[0];
    res.set('Content-Type', reg_photo_mime);
    res.send(reg_photo);
  } catch (err) {
    console.error('admin reg photo error:', err);
    res.status(500).send('Server error');
  }
});

// GET /api/admin/photo/:code — get player level 5 photo
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

// DELETE /api/admin/player/:code — delete a player
app.delete('/api/admin/player/:code', async (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await pool.query('DELETE FROM players WHERE code = $1', [req.params.code]);
    res.json({ ok: true });
  } catch (err) {
    console.error('admin delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Start ───
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
