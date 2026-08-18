const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so your React frontend can call this backend
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const dbConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!dbConnectionString) {
  console.error('ERROR: Database connection string is missing in .env (NEON_DATABASE_URL or DATABASE_URL).');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbConnectionString,
  ssl: { rejectUnauthorized: false }
});

// Test initial connection on boot
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Neon PostgreSQL connection error:', err.message);
    return;
  }
  console.log('✅ Successfully connected to Neon PostgreSQL!');
  release();
});

// --- RECTIFIED SEED ROUTE ---
app.get('/auto-seed', async (req, res) => {
  try {
    // 1. Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Insert test user
    const testEmail = `hitansh_${Date.now()}@example.com`;
    const userRes = await pool.query(
      `INSERT INTO users (name, email) 
       VALUES ('Hitansh Gupta', $1) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id, name, email`,
      [testEmail]
    );
    const userId = userRes.rows[0].id;

    // 3. Insert sample notes (sequential parameter placeholders)
    await pool.query(
      `INSERT INTO notes (title, content, user_id) VALUES 
        ($1, $2, $3),
        ($4, $5, $6)`,
      [
        'First Test Note', 
        'Verifying row insertion in Neon Postgres console.', 
        userId,
        'Second Test Note', 
        'Testing explicit relational JOIN query.', 
        userId
      ]
    );

    // 4. Fetch the newly populated rows
    const notesResult = await pool.query('SELECT * FROM notes WHERE user_id = $1', [userId]);

    res.json({
      message: 'SUCCESS! Tables verified and dummy data inserted into Neon database.',
      userCreated: userRes.rows[0],
      notesInserted: notesResult.rows
    });
  } catch (err) {
    console.error('Seeding Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- API ROUTES FOR REACT ---

app.get('/', (req, res) => {
  res.json({ message: 'Backend running! Hit /auto-seed to initialize and test the database.' });
});

// GET all notes with user details
app.get('/notes-with-users', async (req, res) => {
  const query = `
    SELECT 
      notes.id AS note_id,
      notes.title,
      notes.content,
      notes.created_at,
      users.id AS user_id,
      users.name AS user_name,
      users.email AS user_email
    FROM notes
    INNER JOIN users ON notes.user_id = users.id
    ORDER BY notes.created_at DESC;
  `;
  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all notes
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new note (ready for React form submissions)
app.post('/notes', async (req, res) => {
  const { title, content, user_id } = req.body;
  if (!title || !content || !user_id) {
    return res.status(400).json({ error: 'title, content, and user_id are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});