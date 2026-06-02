const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());                  // Allow frontend to call API
app.use(express.json());

// Database connection (use environment variable)
const db = mysql.createConnection(process.env.DATABASE_URL);

// Example endpoints
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/trips', (req, res) => {
  const { userId, destination, date, notes } = req.body;
  db.query('INSERT INTO trips (userId, destination, date, notes) VALUES (?, ?, ?, ?)',
    [userId, destination, date, notes], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, ...req.body });
    });
});

// Add all other endpoints from your original CloudDatabase class...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
