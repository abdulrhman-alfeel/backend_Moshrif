const { DeleteTableChate } = require('../../../sql/delete');
const {
  insertTableChate,
  insertTableChateStage,
  insertTableViewsChate,
  insertTableChat_private,
  insertTableChat_project,
} = require('../../../sql/INsertteble');
const {
  SELECTTableChateStageOtherroad,
  SELECTTableViewChateStage,
  SELECTTableViewChate,
  SELECTLastTableChateStage,
  SELECTLastTableChate,
  SELECTLastTableChateStageDontEmpty,
  SELECTLastTableChateTypeDontEmpty,
  SELECTLastTableChateID,
  SELECTTableViewChateUser,
  SELECTfilterTableChate,
  SELECTLastTableChatDontEmpty,
  getChatRooms,
  get_ALL_ChatRooms,
  getChatRooms_project,
  get_ALL_ChatRooms_project,
} = require('../../../sql/selected/selected');
const { ChateNotficationdelete } = require('../notifications/NotifcationProject');
const { insertPostURL } = require('../posts/insertPost');
const { deleteFileSingle } = require('../../../middleware/Fsfile');
const { uploaddata, bucket } = require('../../../bucketClooud');
const { fFmpegFunction } = require('../../../middleware/ffmpeg');
const { io } = require('../../../importMIn');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleAuth } = require('google-auth-library');
const { Deleteposts } = require('../posts/updatPost');
const moment = require('moment');
const { parsePositiveInt, esc, toISO, View_type } = require('../../../middleware/Aid');
const { UpdateTableViewsChate } = require('../../../sql/update');

//   عمليات استقبال وارسال ومشاهدة شات المراحل

// عملية ارسال واستقبال لشات المراحل

// === Helpers خفيفة ===
function safeJsonParse(value, fallback = null) {
  try {
    if (value == null) return fallback;
    if (typeof value === 'object') return value; // already parsed
    const s = String(value).trim();
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
function isVideoFile(fileObj) {
  if (!fileObj || typeof fileObj !== 'object') return false;
  const t = String(fileObj.type || '').toLowerCase();
  return t.startsWith('video');
}
function shouldCreatePostForStage(stageId) {
  // استثناءات كما في منطقك
  const s = String(stageId ?? '').trim();
  return !['قرارات', 'استشارات', 'اعتمادات'].includes(s);
}

const OpreactionSend_message = async (data, type = 'chat', userID = null) => {
  let result = {
    ...data,

    arrived: true,
  };
  try {
 
    if (data?.kind === 'delete') {
      // ===== مسار الحذف =====
      const chackdata = await bringdatachate(data, 'delete', type);
      if (!chackdata) return null;

      // حذف من جداول الشات/المستخدمين
      result = await DeleteChatfromdatabaseanddatabaseuser(chackdata, type,userID);

      if (
        Object.entries(chackdata?.File).length > 0 &&
        String(JSON.parse(chackdata?.File).type).startsWith('video') &&
        type === 'chat'
      ) {
        await Deleteposts(JSON.parse(chackdata.File).name);
      }

      return result;
    }

    // ===== مسار الإدراج =====
    // منع التكرار إن توفر bringdatachate كتحقّق

    const chackdata = await bringdatachate(data, 'new', type);
    if (!chackdata) {
      // توزيع البيانات حسب بنية قواعدك
      let newData = [];

      if (type === 'Chat_private' || type === 'Chat_project') {
        newData = Datadistribution_Chat_private(data);
      } else {
        newData = Datadistribution(data);
      }

      // let chatID = null;
      // إدراج في جدول المرحلة أو العام
      if (type === 'chat') {
        if (Number(data?.StageID)) {
          result.chatID = await insertTableChateStage(newData);
        } else {
          result.chatID = await insertTableChate(newData);
        }
      } else if (type === 'Chat_private') {
        result.chatID = await insertTableChat_private(newData);
      } else if (type === 'Chat_project') {
        result.chatID = await insertTableChat_project(newData);
      }

      if (result) {
        // نشر بوست للفيديو فقط، وللمراحل المسموح بها
        if (shouldCreatePostForStage(data?.StageID) && type === 'chat') {
          // insertPostURL نفسها تتحقق من نوع "video" داخليًا، لكن هذا تقليل للنداء غير الضروري
          const fileObj = safeJsonParse(data?.File, null);
          if (isVideoFile(fileObj)) {
            try {
              await insertPostURL(data);
            } catch (_) {}
          }
        }

        result.File = safeJsonParse(result.File, {});
        result.Reply = safeJsonParse(result.Reply, {});
        result.kind = 'new';
      }
      console.log('OpreactionSend_message result:', result);

      return result;
    } else {
      // رسالة وصلت سابقًا (تكرار)
      return {
        ...chackdata,
        File: safeJsonParse(chackdata.File, {}),
        Reply: safeJsonParse(chackdata.Reply, {}),
        arrived: true,
        // الإبقاء على التسمية كما هي في مشروعك لتجنب كسر الواجهة
        kind: 'mssageEnd',
      };
    }
  } catch (e) {
    // console.log("OpreactionSend_message error:", e?.message || e);
    return null;
  }
};

const sendNote = async (ProjectID, messages, Files, user, Reply = {}) => {
  const generateID = () => Math.random().toString(36).substring(2, 10);
  // const datareply = {
  //   Data: item.Data,
  //   Date: item.Date,
  //   type:item.Type,
  //   Sender:item.InsertBy
  // };
  const idSender = `${user.PhoneNumber}${generateID()}`;
  const objectMasseg = {
    idSendr: idSender,
    ProjectID: ProjectID,
    StageID: 'طلبات',
    Sender: user.userName,
    message: messages,
    timeminet: moment().toISOString(),
    File: Files,
    Reply: Reply,
    arrived: true,
    kind: 'new',
  };

  const result = await OpreactionSend_message(objectMasseg, 'chat', user.userID);
  io.to(`${ProjectID}:طلبيات`).timeout(50).emit('received_message', result);
};

const bringdatachate = async (data, type = 'new', kind_opreation = 'chat') => {
  let sqltype =
    type === 'delete'
      ? 'chatID=? AND trim(Sender)=trim(?)'
      : 'trim(idSendr)=trim(?) AND trim(Sender)=trim(?)';
  let id = type === 'delete' ? data.chatID : data.idSendr;

  let chackdata = {};
  if (kind_opreation === 'chat') {
    chackdata = Number(data?.StageID)
      ? await SELECTTableChateStageOtherroad(id, data.Sender, sqltype)
      : await SELECTTableChateStageOtherroad(id, data.Sender, sqltype, 'Chat');
  } else {
    chackdata = await SELECTTableChateStageOtherroad(id, data.Sender, sqltype, kind_opreation);
  }

  return chackdata;
};



const Datadistribution = (data) => {
  try {
    let newData = [
      data.idSendr,
      data?.StageID,
      parsePositiveInt(data.ProjectID),
      esc(data.Sender),
      esc(data.message),
      `${new Date().toUTCString()}`,
      JSON.stringify(data.File),
      JSON.stringify(data.Reply),
    ];
    return newData;
  } catch (err) {
    // console.log(err.message);
  }
};
const Datadistribution_Chat_private = (data) => {
  try {
    let newData = [
      data.conversationId,
      data.companyId ?? data.ProjectID,
      data.idSendr,
      data.Sender,
      esc(data.message),
      `${new Date().toUTCString()}`,
      JSON.stringify(data.File),
      JSON.stringify(data.Reply),
    ];
    return newData;
  } catch (err) {
    // console.log(err.message);
  }
};

// عمليات حذف الرساله
const DeleteChatfromdatabaseanddatabaseuser = async (data, type,userID) => {
  try {
    const chatID = data.chatID;

    let dataopration = {
      kind: 'delete',
      chatID: chatID,
    };

    if (type === 'chat') {
      dataopration = {
        ProjectID: data.ProjectID,
        StageID: data.StageID || data.Type,
        ...dataopration,
      };

      if (Number(data.StageID)) {
        await DeleteTableChate('ChatSTAGE', chatID);
      } else {
        await DeleteTableChate('Chat', chatID);
      }
      await ChateNotficationdelete(
        data.ProjectID,
        data?.StageID || data.Type,
        data.message,
        userID,
        chatID,
      );
    } else {
      dataopration = {
        ...data,
        ...dataopration,
      };
      await DeleteTableChate(type, chatID);
    }

    return dataopration;
  } catch (error) {
    console.log(error);
  }
};

// **************
// const specialStages = ['قرارات', 'استشارات', 'اعتمادات'];

// جلب الرسائل الناقصة
const ClassChackTableChat = () => {
  return async (req, res) => {
    try {
      const { ProjectID, StageID, lengthChat, chate_type = 'Chat' } = req.query;

      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      // const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      // if (!chack_for_subscription && !specialStages.includes(StageID)) {
      //   return res
      //     .status(200)
      //     .send({ success: false, message: 'Subscription inactive', subScripation: false });
      // }

      let arrayResult = [];
      // جلب البيانات
      let result;
      if (chate_type === 'Chat_private' || chate_type === 'Chat_project') {
        result =
          lengthChat > 0
            ? await SELECTLastTableChatDontEmpty(ProjectID, StageID, lengthChat, chate_type)
            : await SELECTLastTableChate(ProjectID, StageID, 80, chate_type);
      } else {
        if (lengthChat > 0) {
          result = Number(StageID)
            ? await SELECTLastTableChateStageDontEmpty(ProjectID, StageID, lengthChat)
            : await SELECTLastTableChateTypeDontEmpty(ProjectID, StageID, lengthChat);
        } else {
          result = Number(StageID)
            ? await SELECTLastTableChateStage(ProjectID, StageID, 80)
            : await SELECTLastTableChate(ProjectID, StageID, 80);
        }
      }
      // فرز البيانات
      if (result?.length > 0 && result !== undefined) {
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          element.File = JSON.parse(element.File);
          element.Reply = JSON.parse(element.Reply);
          arrayResult.push(element);
        }
      }

      // ارسال البيانات
      res.send({ success: true, data: arrayResult, subScripation: true }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false, subScripation: true }).status(400);
    }
  };
};

const filterTableChat = () => {
  return async (req, res) => {
    try {
      const { userName, count, ProjectID, Type } = req.query;
      let array = [];
      const Count = Boolean(count) ? count : 0;
      if (Boolean(count)) {
        const result = await SELECTfilterTableChate(ProjectID, Type, userName, Count);
        for (const pic of result) {
          array.push({
            ...pic,
            File: JSON.parse(pic.File),
            Reply: JSON.parse(pic.Reply),
            arrived: true,
          });
        }
      }
      res.send({ success: 'تمت العملية بنجاح', data: array }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ المهمة', data: [] }).status(200);
    }
  };
};
// عملية مشاهدة لرسائل شات
const ClassChatOprationView = async (data, chate_type = 'Chat') => {
  return new Promise(async (resolve, reject) => {
    try {
      const view_type = View_type(chate_type);
      let result;
      if (chate_type !== 'Chat') {
        result = await SELECTTableViewChate(data.chatID, data.userName, view_type);
        if (result?.length <= 0) {
          await insertTableViewsChate([data.chatID, data.userName], view_type);
        }
      }
      if (Number(data.type)) {
        result = await SELECTTableViewChate(data.chatID, data.userName, 'ViewsCHATSTAGE');
      } else {
        result = await SELECTTableViewChate(data.chatID, data.userName);
      }

      if (result?.length <= 0) {
        if (Number(data.type)) {
          await insertTableViewsChate([data.chatID, data.userName], 'ViewsCHATSTAGE');
        } else {
          await insertTableViewsChate([data.chatID, data.userName]);
        }
      }
      resolve(true);
    } catch (err) {
      // console.log(err);
    }
  });
};
//  لطلب المشاهدات الناقسة للرسالة
const ClassViewChat = () => {
  return async (req, res) => {
    const { type, chatID, chate_type = 'Chat' } = req.query;

    const data = { chatID: chatID, type: type };

    const result = await verification(data, chate_type);
    res.send({ success: true, data: result }).status(200);
  };
};

function sanitizeType(t) {
  const s = String(t ?? '').trim();
  // نسمح بحروف عربية/إنجليزية/أرقام/فراغ/وصلات/شرطات سفلية
  const ok = /^[A-Za-z0-9\u0600-\u06FF _-]{1,50}$/.test(s);
  return ok ? s : 'عام';
}
//  لاستقبال مشاهدات الرسائل
const ClassreceiveMessageViews = () => {
  return async (req, res) => {
    try {
      // ✅ التحقق من الجلسة (اختياري لكنه أنسب للتتبّع)
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      // ✅ التقاط/تحقق المدخلات
      const rawUserName = req.body?.userName ?? userSession.userName;
      const userName = String(rawUserName ?? '').trim();
      const ProjectID = parsePositiveInt(req.body?.ProjectID);
      const type = sanitizeType(req.body?.type);
      const chate_type = req.body?.chate_type;

      // ✅ جلب رسائل آخر ID بحسب المشروع والنوع والمستخدم
      const list = await SELECTLastTableChateID(ProjectID, type, userName, chate_type);

      const items = Array.isArray(list) ? list : [];

      if (items.length === 0) {
        // لا يوجد شيء للتحديث
        return res.status(200).json({ success: true, updated: 0 });
      }

      // ✅ إزالة التكرار حسب chatID
      const chatIDs = Array.from(new Set(items.map((e) => e?.chatID).filter(Boolean)));

      // ✅ فحص ووسم "تمت مشاهدته" لكل رسالة لم تُوسم
      let updated = 0;
      for (const chatID of chatIDs) {
        try {
          const exists = await SELECTTableViewChateUser(chatID, userName, type);
          if (!exists || exists.length === 0) {
            const viewSend = {
              chatID,
              userName,
              Date: toISO(), // وقت UTC ISO
              type,
            };

            await ClassChatOprationView(viewSend, chate_type);
            updated++;
          }
        } catch (e) {
          // لا تُسقط العملية كلها بسبب عنصر واحد
          console.warn('mark-view failed for chatID:', chatID, e);
        }
      }

      return res.status(200).json({ success: true, updated });
    } catch (error) {
      console.error('Error updating message views:', error);
      return res.status(500).json({ error: 'Failed to update message views' });
    }
  };
};

const verification = async (data, chate_type = 'Chat') => {
  let result;
  try {
    const view_type = View_type(chate_type);

    if (view_type !== null) {
      result = await SELECTTableViewChateStage(data.chatID, view_type);
    } else {
      if (Number(data.type)) {
        result = await SELECTTableViewChateStage(data.chatID);
      } else {
        result = await SELECTTableViewChateStage(data.chatID, 'Views');
      }
    }

    return result;
  } catch (err) {
    // console.log(err);
  }
};

const initializeUpload = () => {
  return async (req, res) => {
    // قراءة بيانات الاعتماد من ملف JSON
    const auth = new GoogleAuth({
      keyFile: 'backendMoshrif.json', // استبدل هذا بمسار ملف JSON الخاص بحساب الخدمة
      scopes: ['https://www.googleapis.com/auth/cloud-platform'], // نطاقات الوصول المطلوبة
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const { fileName } = req.query;

    const uniqueFileName = `${uuidv4()}-${fileName}`;

    res.send({ token: accessToken.token, nameFile: uniqueFileName }).status(200);
  };
};

const generateResumableUrl = () => {
  return async (req, res) => {
    try {
      const { fileName, fileType } = req.body;

      const uniqueFileName = `${uuidv4()}-${fileName}`;
      const file = bucket.file(uniqueFileName);

      // Generate resumable upload URL
      const [uri] = await file.createResumableUpload({
        origin: '*',
        metadata: {
          contentType: fileType,
        },
      });

      // قراءة بيانات الاعتماد من ملف JSON
      const auth = new GoogleAuth({
        keyFile: 'backendMoshrif.json', // استبدل هذا بمسار ملف JSON الخاص بحساب الخدمة
        scopes: ['https://www.googleapis.com/auth/cloud-platform'], // نطاقات الوصول المطلوبة
      });

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      res.status(200).json({
        fileId: file.id,
        nameFile: uniqueFileName,
        token: accessToken.token,
        uri,
      });
    } catch (error) {
      console.error('Error generating resumable upload URL:', error);
      res.status(500).json({ error: 'Failed to generate resumable upload URL' });
    }
  };
};

const insertdatafile = () => {
  return async (req, res) => {
    try {
      const { chate_type = 'Chat' } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      let result = req.body ?? {};
      let chat = chate_type === 'Chat';
      const conversationId = chat
        ? `${result.ProjectID}:${result?.StageID}`
        : result?.conversationId;

      console.log('conversationId:', chate_type);
      if (chat) {
        result = await OpreactionSend_message(req.body,'chat', userSession.userID);
        io.to(conversationId).timeout(50).emit('received_message', result);
      } else {
        result = await OpreactionSend_message(req.body, chate_type,userSession.userID);
        const nap = io.of(`/${chate_type}`);
        nap.to(`dm:${conversationId}`).timeout(50).emit('received_message', result);
      }

      res.send({ chatID: result?.chatID }).status(200);
    } catch (err) {
      res.send({ success: 'فشل تنفيذ المهمة' }).status(401);
    }
  };
};

const Bring_chat_room = () => {
  return async (req, res) => {
    try {
      const { lastChatId = 0, ProjectID = 0 } = req.query;
      const userSession = req.session.user;

      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      let result;
      if (ProjectID > 0) {
        result = await getChatRooms_project(
          userSession.userID,
          userSession?.userName,
          userSession?.PhoneNumber,
          ProjectID,
          lastChatId,
        );
      } else {
        result = await getChatRooms(
          userSession.userID,
          userSession?.userName,
          userSession?.PhoneNumber,
          lastChatId,
        );
      }

      res.send(result).status(200);
    } catch (err) {
      res.send({ success: 'فشل تنفيذ المهمة' }).status(401);
    }
  };
};

const Bring_All_ChatRooms = () => {
  return async (req, res) => {
    try {
      const { lastChatId = 0, ProjectID = 0 } = req.query;

      const userSession = req.session.user;

      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      if (userSession.job !== 'Admin') {
        res.status(403).send('Forbidden: Access is denied');
        console.log('Forbidden: Access is denied');
      }
      try {
        let result;
        if (ProjectID > 0) {
          result = await get_ALL_ChatRooms_project(ProjectID, lastChatId);
        } else {
          result = await get_ALL_ChatRooms(userSession.IDCompany, lastChatId);
        }
        res.send(result).status(200);
      } catch (err) {
        console.log('Error fetching chat rooms:', err);
        res.status(500).send({ success: 'Failed to fetch chat rooms' });
      }
    } catch (err) {
      console.log('Error in Bring_All_ChatRooms:', err);
      res.status(500).send({ success: 'Failed to fetch chat rooms' });
    }
  };
};

module.exports = {
  ClassChatOprationView,
  ClassChackTableChat,
  ClassViewChat,
  ClassreceiveMessageViews,
  OpreactionSend_message,
  initializeUpload,
  insertdatafile,
  generateResumableUrl,
  filterTableChat,
  sendNote,
  Bring_chat_room,
  Bring_All_ChatRooms,
};
