/**
 * BullMQ worker (background jobs)
 *
 * Run: npm run worker
 */

require('dotenv').config();

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const config = require('./config');
const { insertTableChat_private } = require('./sql/INsertteble');

const connection = new IORedis(config.redis);

const worker = new Worker(
  'chat_persist',
  async (job) => {
    await insertTableChat_private(job.data);
    // TODO: implement actual job handlers.
    // For now we log and acknowledge jobs so the queue is functional.
    // console.log(`🧵 Processing job: ${job.name} (${job.id})`);
    return { ok: true, name: job.name, data: job.data };
  },
  {
    connection,
    concurrency: 50,
  }
);
// const worker = new Worker(
//   'project-requests',
//   async (job) => {
//     // TODO: implement actual job handlers.
//     // For now we log and acknowledge jobs so the queue is functional.
//     // console.log(`🧵 Processing job: ${job.name} (${job.id})`);
//     return { ok: true, name: job.name, data: job.data };
//   },
//   {
//     connection,
//     concurrency: config.worker.concurrency,
//   }
// );

worker.on('completed', (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

process.on('SIGINT', async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
