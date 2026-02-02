const { DeleteTableChate } = require("../../../sql/delete");
const {
  insertTableChate,
  insertTableChateStage,
  insertTableViewsChateStage,
  insertTableViewsChate,
} = require("../../../sql/INsertteble");
const {
  SELECTTableChateStageOtherroad,
  SELECTTableViewChateStage,
  SELECTTableChateotherroad,
  SELECTTableViewChate,
  SELECTLastTableChateStage,
  SELECTLastTableChate,
  SELECTLastTableChateStageDontEmpty,
  SELECTLastTableChateTypeDontEmpty,
  SELECTLastTableChateID,
  SELECTTableViewChateUser,
  SELECTLastmassgeuserinchat,
  SELECTfilterTableChate,
  select_table_company_subscriptions,
} = require("../../../sql/selected/selected");
const {
  ChateNotfication,
  ChateNotficationdelete,
} = require("../notifications/NotifcationProject");
const { insertPostURL } = require("../posts/insertPost");
const { deleteFileSingle } = require("../../../middleware/Fsfile");
const { uploaddata, bucket } = require("../../../bucketClooud");
const { fFmpegFunction } = require("../../../middleware/ffmpeg");
const { io } = require("../../../importMIn");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const IORedis = require('ioredis');
const { GoogleAuth } = require("google-auth-library");
const { Deleteposts } = require("../posts/updatPost");
const moment = require("moment");
const { parsePositiveInt,esc, isNonEmpty, lenBetween, toISO } = require("../../../middleware/Aid");
const config = require("../../../config");



const redis = new IORedis(config.redis);



//   عمليات استقبال وارسال ومشاهدة شات المراحل

// عملية ارسال واستقبال لشات المراحل
const ClassChatOpration = async (Socket, io) => {
  try {
    Socket.on("send_message", async (data) => {
    const result = await OpreactionSend_message(data);

      io.to(`${data.ProjectID}:${data?.StageID}`)
        .timeout(50)
        .emit("received_message", result);
    });
  } catch (err) {
    // console.log(err.message);
  }
};

// === Helpers خفيفة ===
function safeJsonParse(value, fallback = null) {
  try {
    if (value == null) return fallback;
    if (typeof value === "object") return value; // already parsed
    const s = String(value).trim();
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
function isVideoFile(fileObj) {
  if (!fileObj || typeof fileObj !== "object") return false;
  const t = String(fileObj.type || "").toLowerCase();
  return t.startsWith("video");
}
function shouldCreatePostForStage(stageId) {
  // استثناءات كما في منطقك
  const s = String(stageId ?? "").trim();
  return !["قرارات", "استشارات", "اعتمادات"].includes(s);
}

const OpreactionSend_message = async (data) => {
  let result = null;

  try {
    if (data?.kind === "delete") {
      // ===== مسار الحذف =====
      const chackdata = await bringdatachate(data, "delete");
      if (!chackdata) return null;

      // حذف من جداول الشات/المستخدمين
      result = await DeleteChatfromdatabaseanddatabaseuser(chackdata);
    if (Object.entries(chackdata?.File).length > 0 && String(JSON.parse(chackdata?.File).type).startsWith("video")) {
        await Deleteposts(JSON.parse(chackdata.File).name);
      }
      // // إن كان مرفق فيديو: احذف البوست المرتبط
      // const fileObj = safeJsonParse(chackdata?.File, null);
      // if (isVideoFile(fileObj) && fileObj?.name) {
      //   try { await Deleteposts(fileObj.name); } catch (e) { /* لا تُسقط العملية */ }
      // }

      return result;
    }

    // ===== مسار الإدراج =====
    // منع التكرار إن توفر bringdatachate كتحقّق
    const chackdata = await bringdatachate(data);
    if (!chackdata) {
      // توزيع البيانات حسب بنية قواعدك
      const newData = Datadistribution(data);

      // إدراج في جدول المرحلة أو العام
      if (Number(data?.StageID)) {
        await insertTableChateStage(newData);
        result = await SELECTTableChateStageOtherroad(data.idSendr);
      } else {
        await insertTableChate(newData);
        result = await SELECTTableChateotherroad(data.idSendr);
      }

      if (result) {
        // نشر بوست للفيديو فقط، وللمراحل المسموح بها
        if (shouldCreatePostForStage(data?.StageID)) {
          // insertPostURL نفسها تتحقق من نوع "video" داخليًا، لكن هذا تقليل للنداء غير الضروري
          const fileObj = safeJsonParse(data?.File, null);
          if (isVideoFile(fileObj)) {
            try { await insertPostURL(data); } catch (_) {}
          }
        }

        result.File = safeJsonParse(result.File, {});
        result.Reply = safeJsonParse(result.Reply, {});
        result.arrived = true;
        result.kind = "new";


        await ChateNotfication(
            data.ProjectID,
            data?.StageID,
            data.message,
            data.Sender,
            data.Reply,
            data.File
          );
      }

      return result;
    } else {
      // رسالة وصلت سابقًا (تكرار)
      return {
        ...chackdata,
        File: safeJsonParse(chackdata.File, {}),
        Reply: safeJsonParse(chackdata.Reply, {}),
        arrived: true,
        // الإبقاء على التسمية كما هي في مشروعك لتجنب كسر الواجهة
        kind: "mssageEnd",
      };
    }
  } catch (e) {
    // console.log("OpreactionSend_message error:", e?.message || e);
    return null;
  }
};




const sendNote = async (ProjectID,messages,Files,user,Reply={})=>{
  const generateID = () => Math.random().toString(36).substring(2,10);
  // const datareply = {
  //   Data: item.Data,
  //   Date: item.Date,
  //   type:item.Type,
  //   Sender:item.InsertBy
  // };
  const idSender = `${user.PhoneNumber}${generateID()}`;
  const objectMasseg = {
    idSendr:idSender,
    ProjectID:ProjectID,
    StageID:'طلبات',
    Sender :user.userName,
    message:messages,
    timeminet: moment().toISOString(),
    File:Files,
    Reply:Reply,
    arrived:true,
    kind:'new'
  };

   const result = await OpreactionSend_message(objectMasseg);
  io.to(`${ProjectID}:طلبيات`)
        .timeout(50)
        .emit("received_message", result);

}

const bringdatachate = async (data, type = "new") => {
  let sqltype =
    type === "delete"
      ? "chatID=? AND trim(Sender)=trim(?)"
      : "trim(idSendr)=trim(?) AND trim(Sender)=trim(?)";
  let id = type === "delete" ? data.chatID : data.idSendr;
  const chackdata = Number(data?.StageID)
    ? await SELECTTableChateStageOtherroad(id, data.Sender, sqltype)
    : await SELECTTableChateStageOtherroad(id, data.Sender, sqltype, "Chat");
  return chackdata;
};
const Chackarrivedmassage = () => {
  return async (req, res) => {
    const userSession = req.session.user;
    const { StageID, idSendr } = req.query;
    if (!userSession) {
      res.status(401).send("Invalid session");
      console.log("Invalid session");
    }

    const chackdata = Number(StageID)
      ? await SELECTTableChateStageOtherroad(
          idSendr,
          userSession.userName,
          "idSendr=? AND Sender=?"
        )
      : await SELECTTableChateStageOtherroad(
          idSendr,
          userSession.userName,
          "idSendr=? AND Sender=?",
          "Chat"
        );

    res.send({ success: chackdata }).status(200);
  };
};

const PostFilemassage = () => {
  return async (req, res) => {
    try {
      const videofile = req.file;

      if (!videofile) {
        return res.status(400).send("No video file uploaded");
      }

      const data = JSON.parse(req.body.data);
      const result = await OpreactionSend_message(data);

      res.status(200).send({ success: "Full request", chatID: result.chatID });

      io.to(`${parseInt(data.ProjectID)}:${data?.StageID}`)
        .timeout(50)
        .emit("received_message", result);

      await uploaddata(videofile);
      // Check if the uploaded file is a video
      if (
        videofile.mimetype === "video/mp4" ||
        videofile.mimetype === "video/quicktime"
      ) {
        const timePosition = "00:00:00.100";
        let matchvideo = videofile.filename.match(/\.([^.]+)$/)[1];
        let filename = String(videofile.filename).replace(matchvideo, "png");

        const pathdir = path.dirname(videofile.path);
        const tempFilePathtimp = `${pathdir}/${filename}`;

        await fFmpegFunction(tempFilePathtimp, videofile.path, timePosition);
        await bucket.upload(tempFilePathtimp);
      }
      // حذف الملف
      await deleteFileSingle(data.File.name, "upload", data.File.type);
    } catch (error) {
      res.status(402).send({ success: "فشلة عملية رفع الملف" });
    }
  };
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

// عمليات حذف الرساله
const DeleteChatfromdatabaseanddatabaseuser = async (data) => {
  try {
    const chatID = data.chatID;
    let dataopration = {
      ProjectID: data.ProjectID,
      StageID: data.StageID || data.Type,
      kind: "delete",
      chatID: chatID,
    };

    if (Number(data.StageID)) {
      await DeleteTableChate("ChatSTAGE", chatID);
    } else {
      await DeleteTableChate("Chat", chatID);
    }
    await ChateNotficationdelete(
      data.ProjectID,
      data?.StageID || data.Type,
      data.message,
      data.Sender,
      chatID
    );
    return dataopration;
  } catch (error) {
    console.log(error);
  }
};

// **************
const specialStages = ["قرارات", "استشارات", "اعتمادات"];


// جلب الرسائل الناقصة
const ClassChackTableChat = () => {
  return async (req, res) => {
    try {
      const { ProjectID, StageID, lengthChat } = req.query;

      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      
      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription && !specialStages.includes(StageID)) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive",subScripation:false });
      }


      let arrayResult = [];
      //  جلب طول البيانات
      const Listchat = Number(StageID)
        ? await SELECTLastmassgeuserinchat(
            ProjectID,
            StageID,
            userSession.userName
          )
        : await SELECTLastmassgeuserinchat(
            ProjectID,
            StageID,
            userSession.userName,
            "Chat"
          );
      // جلب البيانات
      let result;
      if (Listchat.last_id !== null && lengthChat > 0) {
        result = Number(StageID)
          ? await SELECTLastTableChateStageDontEmpty(
              ProjectID,
              StageID,
              Listchat?.last_id
            )
          : await SELECTLastTableChateTypeDontEmpty(
              ProjectID,
              StageID,
              Listchat?.last_id
            );
      } else {
        result = Number(StageID)
          ? await SELECTLastTableChateStage(ProjectID, StageID, 80)
          : await SELECTLastTableChate(ProjectID, StageID, 80);
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
      res.send({ success: true, data: arrayResult,subScripation:true }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false,subScripation:true }).status(400);
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
        const result = await SELECTfilterTableChate(
          ProjectID,
          Type,
          userName,
          Count
        );
        for (const pic of result) {
          array.push({
            ...pic,
            File: JSON.parse(pic.File),
            Reply: JSON.parse(pic.Reply),
            arrived: true,
          });
        }
      }
      res.send({ success: "تمت العملية بنجاح", data: array }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ المهمة", data: [] }).status(200);
    }
  };
};
// عملية مشاهدة لرسائل شات
const ClassChatOprationView = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result;
      if (Number(data.type)) {
        result = await SELECTTableViewChateStage(data.chatID);
      } else {
        result = await SELECTTableViewChate(data.chatID);
      }
      const view = result?.find(
        (item) => item.userName === data.userName && item.chatID === data.chatID
      );
      if (!view) {
        if (Number(data.type)) {
          await insertTableViewsChateStage([data.chatID, data.userName]);
        } else {
          await insertTableViewsChate([data.chatID, data.userName]);
        }
        result = await verification(data);
        resolve(result);
      }
    } catch (err) {
      // console.log(err);
    }
  });
};
//  لطلب المشاهدات الناقسة للرسالة
const ClassViewChat = () => {
  return async (req, res) => {
    const { type, chatID } = req.query;
    const data = { chatID: chatID, type: type };

    const result = await verification(data);

    res.send({ success: true, data: result }).status(200);
  };
};


function sanitizeType(t){
  const s = String(t ?? "").trim();
  // نسمح بحروف عربية/إنجليزية/أرقام/فراغ/وصلات/شرطات سفلية
  const ok = /^[A-Za-z0-9\u0600-\u06FF _-]{1,50}$/.test(s);
  return ok ? s : "عام";
}
//  لاستقبال مشاهدات الرسائل
const ClassreceiveMessageViews = () => {
  return async (req, res) => {
    try {
      // ✅ التحقق من الجلسة (اختياري لكنه أنسب للتتبّع)
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(401).json({ error: "Invalid session" });
      }

      // ✅ التقاط/تحقق المدخلات
      const rawUserName = req.body?.userName ?? userSession.userName;
      const userName = String(rawUserName ?? "").trim();
      const ProjectID = parsePositiveInt(req.body?.ProjectID);
      const type = sanitizeType(req.body?.type);

      const errors = {};
      if (!isNonEmpty(userName) || !lenBetween(userName, 2, 100)) errors.userName = "اسم المستخدم غير صالح";
      if (!Number.isFinite(ProjectID)) errors.ProjectID = "رقم المشروع غير صالح";
      if (!isNonEmpty(type)) errors.type = "نوع القناة/المرحلة غير صالح";
      if (Object.keys(errors).length) {
        return res.status(400).json({ error: "أخطاء في التحقق من المدخلات", details: errors });
      }

      // ✅ جلب رسائل آخر ID بحسب المشروع والنوع والمستخدم
      const list = await SELECTLastTableChateID(ProjectID, type, userName);
      const items = Array.isArray(list) ? list : [];

      if (items.length === 0) {
        // لا يوجد شيء للتحديث
        return res.status(200).json({ success: true, updated: 0 });
      }

      // ✅ إزالة التكرار حسب chatID
      const chatIDs = Array.from(new Set(items.map(e => e?.chatID).filter(Boolean)));

      // ✅ فحص ووسم "تمت مشاهدته" لكل رسالة لم تُوسم
      let updated = 0;
      for (const chatID of chatIDs) {
        try {
          const exists = await SELECTTableViewChateUser(chatID, userName, type);
          if (!exists || exists.length === 0) {
            const viewSend = {
              ProjectID,
              chatID,
              userName,
              Date: toISO(),   // وقت UTC ISO
              type
            };

            await ClassChatOprationView(viewSend);
            updated++;
          }
        } catch (e) {
          // لا تُسقط العملية كلها بسبب عنصر واحد
          console.warn("mark-view failed for chatID:", chatID, e);
        }
      }

      return res.status(200).json({ success: true, updated });
    } catch (error) {
      console.error("Error updating message views:", error);
      return res.status(500).json({ error: "Failed to update message views" });
    }
  };
};


const verification = async (data) => {
  let result;
  try {
    if (Number(data.type)) {
      result = await SELECTTableViewChateStage(data.chatID);
    } else {
      result = await SELECTTableViewChate(data.chatID);
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
      keyFile: "backendMoshrif.json", // استبدل هذا بمسار ملف JSON الخاص بحساب الخدمة
      scopes: ["https://www.googleapis.com/auth/cloud-platform"], // نطاقات الوصول المطلوبة
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const { fileName } = req.query;

    const uniqueFileName = `${uuidv4()}-${fileName}`;

    res
      .send({ token: accessToken.token, nameFile: uniqueFileName })
      .status(200);
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
        origin: "*",
        metadata: {
          contentType: fileType,
        },
      });

      // قراءة بيانات الاعتماد من ملف JSON
      const auth = new GoogleAuth({
        keyFile: "backendMoshrif.json", // استبدل هذا بمسار ملف JSON الخاص بحساب الخدمة
        scopes: ["https://www.googleapis.com/auth/cloud-platform"], // نطاقات الوصول المطلوبة
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
      console.error("Error generating resumable upload URL:", error);
      res
        .status(500)
        .json({ error: "Failed to generate resumable upload URL" });
    }
  };
};

const insertdatafile = () => {
  return async (req, res) => {
    try {
      const {chate_type = 'Chat'} = req.query;

      let chat = chate_type === "Chat";
      const conversationId = chat ? `${result.ProjectID}:${result?.StageID}` : req.body?.conversationId;
      let result = req.body ??  {}; 

      if(chat){

        result = await OpreactionSend_message(req.body);
        io.to(conversationId)
        .timeout(50)
        .emit("received_message", result);
      }else{
      const messageId = await redis.incr("chat:global:id");

      result = {
      chatID: messageId,
      conversationId:result.conversationId,
      companyId:result.companyId,
      idSendr:result.idSendr,
      Sender :result.Sender,
      message:result.message,
      timeminet: moment().toISOString(),
      File:result.File,
      Reply:result.Reply,
      arrived:true,
      kind:'new'
    };
      const nap = io.of(`/${chate_type}`)
    
    console.log(conversationId,messageId);
      nap.to(`dm:${conversationId}`)
            .timeout(50)
            .emit("received_message", result);

      }

      res.send({ chatID: result?.chatID }).status(200);

   
    } catch (err) {
      res.send({ success: "فشل تنفيذ المهمة" }).status(401);

      // console.log(err.message);
    }
  };
};

module.exports = {
  ClassChatOpration,
  ClassChatOprationView,
  ClassChackTableChat,
  ClassViewChat,
  ClassreceiveMessageViews,
  PostFilemassage,
  Chackarrivedmassage,
  OpreactionSend_message,
  initializeUpload,
  insertdatafile,
  generateResumableUrl,
  filterTableChat,
  sendNote
};
