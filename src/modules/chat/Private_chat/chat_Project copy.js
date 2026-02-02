// chat-gateway/src/server.js
import Fastify from 'fastify';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';

const app = Fastify();
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const persistQueue = new Queue('chat_persist', { connection: redis });

const io = new Server(app.server, {
  cors: { origin: '*' },
  transports: ['websocket'],
});

const GW_ID = process.env.GW_ID || `gw-${process.pid}`;

function presenceKey(userId) {
  return `presence:u:${userId}`;
}

async function setOnline(userId) {
  await redis.set(presenceKey(userId), JSON.stringify({ gw: GW_ID, ts: Date.now() }), { EX: 90 });
}

async function rateLimit(userId) {
  const sec = Math.floor(Date.now() / 1000);
  const key = `rl:chat:u:${userId}:${sec}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 3);
  return n <= 20; // مثال: 20 event/sec
}

io.on('connection', (socket) => {
  // TODO: authenticate token -> userId/companyId/branchId
  const userId = Number(socket.handshake.auth?.userId);
  const companyId = Number(socket.handshake.auth?.companyId);
  if (!userId || !companyId) {
    socket.disconnect(true);
    return;
  }

  setOnline(userId);

  const hb = setInterval(() => setOnline(userId), 25000);

  socket.on('join', async ({ conversationId }) => {
    if (!(await rateLimit(userId))) return;
    socket.join(`conv:${conversationId}`);
  });

  socket.on('leave', async ({ conversationId }) => {
    if (!(await rateLimit(userId))) return;
    socket.leave(`conv:${conversationId}`);
  });

  socket.on('sendMessage', async (payload, cb) => {
    if (!(await rateLimit(userId))) return cb?.({ ok: false, err: 'rate_limited' });

    const messageId = randomUUID();
    const now = new Date().toISOString();

    const msg = {
      id: messageId,
      companyId,
      conversationId: payload.conversationId,
      projectId: payload.projectId ?? null,
      senderId: userId,
      body: payload.body ?? null,
      msgType: payload.msgType ?? 'text',
      meta: payload.meta ?? null,
      createdAt: now,
    };

    // 1) Fanout فوري (latency ممتاز)
    io.to(`conv:${msg.conversationId}`).emit('message', msg);

    // 2) Persist async
    await persistQueue.add('persist', msg, {
      attempts: 10,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: true,
      removeOnFail: 1000,
    });

    cb?.({ ok: true, id: messageId, createdAt: now });
  });

  socket.on('disconnect', async () => {
    clearInterval(hb);
    // لا تحذف presence فورًا—خلي TTL يحدد (لتجنب flapping)
  });
});

app.listen({ port: Number(process.env.PORT || 3002), host: '0.0.0.0' });
