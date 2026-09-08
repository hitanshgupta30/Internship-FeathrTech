const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { initDb, closeDb } = require('./db');

async function run() {
  console.log('--- Initializing TaskFlow Database Schema ---');
  const result = await initDb();
  console.log('Result:', result);
  await closeDb();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
