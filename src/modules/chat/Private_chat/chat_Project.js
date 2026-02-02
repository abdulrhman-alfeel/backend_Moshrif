// chat-gateway/src/server.js
const { Queue } = require('bullmq');
const  { randomUUID } = require('crypto');
const IORedis = require('ioredis');
const config = require('../../../../config');




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

const chat_Project = (io, socket) => {
 const type =socket.handshake.auth?.type;
 if(type !=='project'){
  return;
 }


 const userId = Number(socket.handshake.auth?.userId);
//   const companyId = Number(socket.handshake.auth?.companyId);
  if (!userId) {
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
      senderId: userId,
      ProjectID:payload.ProjectID,
      Sender :payload.userName,
      message:payload.messages,
      timeminet: moment().toISOString(),
      File:payload.Files,
      Reply:payload.Reply,
      arrived:true,
      kind:'new'
    }

    // 1) Fanout فوري (latency ممتاز)
    io.to(`conv:${msg.ProjectID}`).emit('message', msg);

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
}
