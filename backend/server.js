require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Database connection (Neon PostgreSQL)
const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // required for Neon SSL
  }
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to Neon PostgreSQL database');
});

// ─── USERS ───
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [req.params.email]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, name, email, password, darkMode, nickname, phone, avatar, createdAt, preferences, isDeveloper, verified, passkeyId } = req.body;
  try {
    await db.query(
      `INSERT INTO users (id, name, email, password, darkMode, nickname, phone, avatar, createdAt, preferences, isDeveloper, verified, passkeyId)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, name, email, password, darkMode, nickname, phone, avatar, createdAt, JSON.stringify(preferences), isDeveloper, verified, passkeyId]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { name, email, password, darkMode, nickname, phone, avatar, preferences, isDeveloper, passkeyId } = req.body;
  try {
    await db.query(
      `UPDATE users SET name=$1, email=$2, password=$3, darkMode=$4, nickname=$5, phone=$6, avatar=$7, preferences=$8, isDeveloper=$9, passkeyId=$10 WHERE id=$11`,
      [name, email, password, darkMode, nickname, phone, avatar, JSON.stringify(preferences), isDeveloper, passkeyId, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TRIPS ───
app.get('/api/trips', async (req, res) => {
  const userId = req.query.userId;
  try {
    const result = await db.query('SELECT * FROM trips WHERE userId = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  const { id, userId, destination, date, notes, status } = req.body;
  try {
    await db.query(
      'INSERT INTO trips (id, userId, destination, date, notes, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, userId, destination, date, notes, status]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CHATS ───
app.get('/api/chats', async (req, res) => {
  const userId = req.query.userId;
  try {
    const result = await db.query('SELECT * FROM chat_history WHERE userId = $1 ORDER BY timestamp ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', async (req, res) => {
  const { id, userId, role, text, timestamp } = req.body;
  try {
    await db.query(
      'INSERT INTO chat_history (id, userId, role, text, timestamp) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, role, text, timestamp]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM chat_history WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REQUESTS ───
app.get('/api/requests', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM requests');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests', async (req, res) => {
  const { id, firstName, lastName, email, service, message, date, userId, status } = req.body;
  try {
    await db.query(
      'INSERT INTO requests (id, firstName, lastName, email, service, message, date, userId, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, firstName, lastName, email, service, message, date, userId, status]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM requests WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATS ───
app.get('/api/stats/:key', async (req, res) => {
  try {
    const result = await db.query('SELECT value FROM stats WHERE key = $1', [req.params.key]);
    res.json(result.rows[0] ? result.rows[0].value : 0);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stats/:key/increment', async (req, res) => {
  try {
    await db.query(
      'INSERT INTO stats (key, value) VALUES ($1, 1) ON CONFLICT (key) DO UPDATE SET value = stats.value + 1',
      [req.params.key]
    );
    const result = await db.query('SELECT value FROM stats WHERE key = $1', [req.params.key]);
    res.json({ value: result.rows[0].value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
