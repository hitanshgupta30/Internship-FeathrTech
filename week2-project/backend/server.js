const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
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

    // 3. Insert sample notes
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

// --- API ROUTES FOR REACT DASHBOARD ---

app.get('/', (req, res) => {
  res.json({ message: 'Backend running! Neon DB connected.' });
});

// 1. GET ALL TASKS
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        content AS description, 
        created_at,
        user_id
      FROM notes 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch tasks error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE A NEW TASK
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    // Inserts note linked to the default user id (1)
    const result = await pool.query(
      `INSERT INTO notes (title, content, user_id) 
       VALUES ($1, $2, 1) 
       RETURNING id, title, content AS description, created_at, user_id`,
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE A TASK
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Deleted successfully', id });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE A TASK (Status or Title/Content)
app.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE notes 
       SET 
         title = COALESCE($1, title),
         content = COALESCE($2, content)
       WHERE id = $3
       RETURNING id, title, content AS description, created_at`,
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- LISTEN AT THE VERY BOTTOM ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});