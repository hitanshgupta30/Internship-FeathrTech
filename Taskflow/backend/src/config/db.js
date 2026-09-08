const path = require('path');
const dns = require('dns');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Prefer IPv4 for cloud database connectivity on Windows/Node
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore in older environments
}

// Load environment variables from backend directory or current directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let pool = null;
let isConnected = false;

const isDatabaseConfigured = () => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('replace_with_'));
};

if (isDatabaseConfigured()) {
  const connectionString = process.env.DATABASE_URL.trim();
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle Neon PostgreSQL client', err);
  });
}

/**
 * Execute a query with parameters
 * @param {string} text 
 * @param {Array} params 
 */
const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. DATABASE_URL is missing.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    // console.log('Executed query', { text: text.substring(0, 60), duration, rows: res.rowCount });
  }
  return res;
};

/**
 * Initialize PostgreSQL Schema Tables and Indexes for Neon
 */
const initDb = async () => {
  if (!isDatabaseConfigured() || !pool) {
    console.log('ℹ️  No DATABASE_URL configured. Running TaskFlow with In-Memory Storage.');
    return { status: 'in-memory', message: 'In-Memory data store active' };
  }

  try {
    const client = await pool.connect();
    try {
      console.log('🐘 Connecting to Neon PostgreSQL...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT DEFAULT '',
          owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS project_members (
          id VARCHAR(64) PRIMARY KEY,
          project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(64) PRIMARY KEY,
          project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT DEFAULT '',
          status VARCHAR(32) NOT NULL DEFAULT 'todo',
          priority VARCHAR(32) NOT NULL DEFAULT 'medium',
          due_date VARCHAR(64),
          assignee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS comments (
          id VARCHAR(64) PRIMARY KEY,
          task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE,
          author_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          author_name VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
        CREATE INDEX IF NOT EXISTS idx_proj_members_proj ON project_members(project_id);
        CREATE INDEX IF NOT EXISTS idx_proj_members_user ON project_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
        CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
      `);

      isConnected = true;
      console.log('✅ Neon PostgreSQL Connected and Schema Tables Initialized!');
      return { status: 'neon-postgres', message: 'Neon PostgreSQL connected and schemas synced' };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('⚠️  Failed to connect to Neon PostgreSQL:', error.message);
    console.log('ℹ️  Falling back to isolated in-memory store.');
    isConnected = false;
    return { status: 'in-memory-fallback', message: error.message };
  }
};

/**
 * Gracefully close database connection pool
 */
const closeDb = async () => {
  if (pool) {
    await pool.end();
    isConnected = false;
  }
};

module.exports = {
  get pool() {
    return pool;
  },
  query,
  initDb,
  closeDb,
  isDatabaseConfigured: () => isConnected
};
