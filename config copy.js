require('dotenv').config();

const toBool = (v, d = false) => {
  if (v === undefined) return d;
  return String(v).toLowerCase() === 'true';
};

const config = {
  port: Number(process.env.PORT || 8080),
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],

  // Redis used for Socket.IO scaling + BullMQ
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',

  // DB
  dbClient: (process.env.DB_CLIENT || 'postgres').toLowerCase(),
  databaseUrl: process.env.DATABASE_URL || 'postgres://moshrif:moshrif@postgres:5432/moshrif',
  pgSsl: toBool(process.env.PGSSL, false),
  pgPoolMax: Number(process.env.PG_POOL_MAX || 20),

  worker: {
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  },
  storage: { path: process.env.UPLOAD_DIR || 'upload' },
  cleanupTempFiles: toBool(process.env.CLEANUP_TEMP_FILES, true),

  runCron: toBool(process.env.RUN_CRON, true)
};

module.exports = config;
