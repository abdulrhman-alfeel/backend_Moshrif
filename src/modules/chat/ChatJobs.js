const {
  SELECTTablecompanySubProjectStageCUST,
  selecttablecompanySubProjectall,
} = require('../../../sql/selected/selected');
const { SELECTTableusersCompanyonObject } = require('../../../sql/selected/selectuser');
const { ChateNotfication } = require('../notifications/NotifcationProject');
const {
  ClassChatOprationView,
  OpreactionSend_message,
} = require('./ChatJobsClass');

//   عمليات استقبال وارسال ومشاهدة شات المراحل

// عملية ارسال واستقبال لشات المراحل
const ChatOpration = async (io,redis, persistQueue) => {
  const nsp = io.of('/Chat');
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
      console.log('❌ DM disconnected - invalid auth',userId,companyId);
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

    socket.on('view_message', async (payload, cb) => {
      await ClassChatOprationView(payload);
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
        }

        const result = await OpreactionSend_message(payload, 'chat', userId);

        
    

        // 🔥 بث فوري للطرفين
        nsp.to(roomDM(`${payload.ProjectID}:${payload?.StageID}`)).timeout(50).emit('received_message', result);
            
        
        await ChateNotfication(
            payload.ProjectID,
            payload?.StageID,
            payload.message,
            userId,
            payload.Reply,
            payload.File
          );


        // 💾 حفظ Async
        // await persistQueue.add("persist", result);

        cb?.({ ok: true, id: `${payload.ProjectID}:${payload?.StageID}` });
      } catch (e) {
        cb?.({ ok: false, err: 'server_error' });
      }
    });

    socket.on('view_message', async (payload, cb) => {
      if (!(await rateLimit(userId))) {
        return cb?.({ ok: false, err: 'rate_limited' });
      }

      await ClassChatOprationView(payload);
    });

    socket.on('disconnect', () => {
      clearInterval(hb);
      console.log('❌ DM disconnected', userId);
    });
  });

  return nsp;
};

// عمليات جلب بيانات المشاريع والمراحل

const BringDataprojectAndStages = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      const PhoneNumber = userSession.PhoneNumber;
      const numberData = req.query.numberData;

      const arrayData = await filterProjectforaddinsertArray(PhoneNumber, parseInt(numberData));
      // طلب بيانات المشاريع والمراحل
      const ListData = await BringStageforfilterProject(arrayData);
      res.send({ success: 'تمت العملية بنجاح', data: ListData }).status(200);
      // جلب بيانات المشاريع
      // جلب بيانات المراحل الخاص بكل مشروع
      // ادخال المراحل في مصفوفة داخل المشروع
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ العملية' }).status(200);
    }
  };
};
// فلترة بيانات المشاريع حسب المستخدم وضمها داخل مصفوفة
const filterProjectforaddinsertArray = (PhoneNumber, IDfinlty = 0) => {
  try {
    return new Promise(async (resolve, reject) => {
      const Datausere = await SELECTTableusersCompanyonObject(PhoneNumber);
      const result = await selecttablecompanySubProjectall(
        0,
        IDfinlty,
        Datausere.id,
        'true',
        'LIMIT 3',
        'forchatAdmin',
      );

      resolve(result);
    });
  } catch (error) {
    console.log(error);
  }
};

//  جلب بيانات المراحل حسب المشروع المطلوب للدردشة
const BringStageforfilterProject = (dataPorject) => {
  let ListData = [];

  return new Promise(async (resolve, reject) => {
    await Promise.all(
      dataPorject?.map(async (pic) => {
        const dataStage = await SELECTTablecompanySubProjectStageCUST(
          pic.ProjectID,
          'all',
          'StageID,StageName',
        );

        ListData.push({
          id: pic.ProjectID,
          ProjectID: pic.ProjectID,
          Nameproject: pic.Nameproject,
          arrayStage: dataStage,
        });
        // await DeleteTableProjectdataforchat(pic.id ,"id=?");
      }),
    );

    resolve(ListData);
  });
};

module.exports = {
  ChatOpration,

  BringDataprojectAndStages,
  filterProjectforaddinsertArray,
  BringStageforfilterProject,
};
