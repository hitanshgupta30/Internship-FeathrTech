const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = require('./app');
const { initDb, closeDb, isDatabaseConfigured } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  // Initialize database schemas if Neon PostgreSQL connection is present
  const dbStatus = await initDb();

  server = app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 TaskFlow Backend Server running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Storage: ${dbStatus.status === 'neon-postgres' ? '🐘 Neon PostgreSQL (Live Cloud DB)' : 'Isolated In-Memory (Fallback)'}`);
    console.log(`🔌 Health check: http://localhost:${PORT}/api/health`);
    console.log(`========================================`);
  });
}

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`${signal} signal received. Closing HTTP server and DB connections...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await closeDb();
      process.exit(0);
    });
  } else {
    await closeDb();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = server;
