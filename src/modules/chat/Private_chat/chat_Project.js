// src/ws/chat-private.js
const { ChateNotfication_private } = require('../../notifications/NotifcationProject');
const { OpreactionSend_message, ClassChatOprationView } = require('../ChatJobsClass');
function initChatProjectNamespace(io, redis, persistQueue) {
  const nsp = io.of('/Chat_project');
  const GW_ID = process.env.GW_ID || `gw-${process.pid}`;
  const PRESENCE_TTL = 90;
  // ---------- helpers ----------
  const kPresence = (userId) => `presence:u:${userId}`;
  const roomDM = (conversationId) => `dm:${conversationId}`;

  async function setOnline(userId) {
    const key = kPresence(userId);
    const val = JSON.stringify({ gw: GW_ID, ts: Date.now() });

    // Node-redis v4 يدعم options object غالبًا
    try {
      await redis.set(key, val, { EX: PRESENCE_TTL });
    } catch (e) {
      // ioredis / wrappers: استخدم الصيغة النصية
      await redis.set(key, val, 'EX', PRESENCE_TTL);
    }
  }

  async function rateLimit(userId, max = 20) {
    const sec = Math.floor(Date.now() / 1000);
    const key = `rl:dm:${userId}:${sec}`;
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, 3);
    return n <= max;
  }

  // 🔐 اربطها لاحقاً بجدولك الحقيقي
  async function canJoinDM({ userId, conversationId }) {
    // TODO:
    // SELECT 1 FROM conversation_members WHERE ...
    return true;
  }

  // ---------- namespace ----------
  nsp.on('connection', (socket) => {
    
    const userId = Number(socket.handshake.auth?.userId);
    const companyId = Number(socket.handshake.auth?.companyId);


    if (!userId || !companyId) {
      socket.disconnect(true);
      return;
    }

    socket.data.userId = userId;
    socket.data.companyId = companyId;

    // presence heartbeat
    setOnline(userId);
    const hb = setInterval(() => setOnline(userId), 25000);

    // -------- join DM room --------
    socket.on('newRome', async (conversationId, cb) => {
      try {

        if (!(await rateLimit(userId))) {
          return cb?.({ ok: false, err: 'rate_limited' });
        }

        const allowed = await canJoinDM({ userId, conversationId });
        if (!allowed) {
          return cb?.({ ok: false, err: 'forbidden' });
        }

        const room = roomDM(conversationId);
        socket.join(room);

        cb?.({ ok: true, room });
      } catch (e) {
        cb?.({ ok: false, err: 'server_error' });
      }
    });

    // -------- leave DM room --------
    socket.on('leaveDM', ({ conversationId }) => {
      socket.leave(roomDM(conversationId));
    });

    // -------- send message --------
    socket.on('send_message', async (payload, cb) => {
      try {

        if (!(await rateLimit(userId))) {
          return cb?.({ ok: false, err: 'rate_limited' });
        }

        const allowed = await canJoinDM({ userId, conversationId: payload.conversationId });
        if (!allowed) {
          return cb?.({ ok: false, err: 'forbidden' });
        };

        // const messageId = await redis.incr("chat:global:id");
        const result = await OpreactionSend_message(payload, 'Chat_project', userId);
       console.log('🚀 Chat_project namespace initialized',result);

        // 🔥 بث فوري للطرفين
        nsp.to(roomDM(payload.conversationId)).emit('received_message', result);
        ChateNotfication_private(payload,userId,"Chat_project")

        // 💾 حفظ Async
        // await persistQueue.add("persist", result);

        cb?.({ ok: true, id: payload.conversationId });
      } catch (e) {
        cb?.({ ok: false, err: 'server_error' });
      }
    });

    socket.on('view_message', async (payload, cb) => {
      if (!(await rateLimit(userId))) {
        return cb?.({ ok: false, err: 'rate_limited' });
      };

      await ClassChatOprationView(payload,'Chat_project');


    });

    socket.on('disconnect', () => {
      clearInterval(hb);
      console.log('❌ DM disconnected', userId);
    });
  });

  return nsp;
}

module.exports = { initChatProjectNamespace };
