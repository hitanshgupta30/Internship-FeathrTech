// Note model removed for Neon/Postgres migration.
// Previously used mongoose. Replace with Neon/pg-based data-access functions.
// Example (to implement in future):
// const { Pool } = require('pg');
// const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
// async function getAllNotes() { return (await pool.query('SELECT * FROM notes')).rows; }
// module.exports = { getAllNotes };

module.exports = {};
