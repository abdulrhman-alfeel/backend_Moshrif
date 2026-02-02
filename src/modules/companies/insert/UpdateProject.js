const {
  uploaddata,
  DeleteBucket,
  RenameBucket,
} = require("../../../../bucketClooud");
const {
  DeleteTablecompanySubProjectphase,
  DeleteTablecompanySubProjectarchives,
  DeleteTablecompanySubProjectall,
  DeleteTablecompanyStageSub,
  DeleteTablecompanyStageHome,
} = require("../../../../sql/delete");
const {
  SELECTTablecompanySubProjectStageCUST,
  SELECTProjectStartdate,
  SELECTTablecompanySubProjectStageCUSTONe,
  SELECTTablecompanySubProjectarchivesotherroad,
  SELECTTablecompanySubProjectexpenseObjectOne,
  SELECTTablecompanySubProjectREVENUEObjectOne,
  SELECTTablecompanySubProjectReturnedObjectOne,
  SELECTDataAndTaketDonefromTableRequests,
  SELECTTableFinance,
  SELECTTablecompanySubProjectLast_id,
  SELECTTablecompany,
  SELECTSUMAmountandBring,
  SELECTProjectid,
  SELECTStageid,
  SELECTTablecompanybrinshStagesSubAll,
  SELECTStageSubid,
  SELECTStageallid,
  SELECTTablecompanySubProjectStagesSubSingl,
  SELECTTablecompanySubProjectStagesSub,
} = require("../../../../sql/selected/selected");
const {
  UpdateTablecompanySubProject,
  UpdateProjectStartdateinProject,
  UPDATETablecompanySubProjectStageNotes,
  UPDATETablecompanySubProjectStageCUST,
  UPDATETablecompanySubProjectarchivesFolder,
  UPDATETablecompanySubProjectarchivesFolderinChildern,
  UPDATETablecompanySubProjectexpense,
  UPDATETablecompanySubProjectREVENUE,
  UPDATETablecompanySubProjectReturned,
  UPDATETableinRequests,
  UPDATETableinRequestsDone,
  UpdateProjectClosorOpen,
  UPDATETablecompanySubProjectStagesSub,
  Updaterateandcost,
  UpdaterateandcostStage,
  Updatesubscripationwhendeletproject,
} = require("../../../../sql/update");
const {
  Projectinsert,
  Stageinsert,
  RearrangeStageProject,
  Financeinsertnotification,
  StageSubinsert,
} = require("../../notifications/NotifcationProject");
const {
  deleteFileSingle,
  implmentOpreationSingle,
} = require("../../../../middleware/Fsfile");
const {
  PercentagecalculationforSTage,
} = require("../select/bringProject");

const {
  StageTempletXsl,
  Stage,
  AccountDays,
  Addusertraffic,
  parsePositiveInt,
  convertArabicToEnglish,
  parseNonNegativeFloat,
  isHttpUrl,
  isNonEmpty,
  lenBetween,
  esc,
  tryParseDateISO,
  parseNonNegativeInt,
  sanitizeFilename,
  sanitizeName,
  collectFiles,
  parseRatio,
} = require("../../../../middleware/Aid");

const moment = require('moment-timezone');
const UpdaterateCost = async (
  id,
  type = "rate",
  typeid = "id",
  IDCompany = 0
) => {
  let result = 0;
  if (type === "rate") {
    const rate = await PercentagecalculationforProject(id);
    result = rate;
  } else if (type === "cost") {
    const dataProject = await SELECTSUMAmountandBring(id);
    result = dataProject.RemainingBalance;
  }
  await Updaterateandcost(id, result, "companySubprojects", type, typeid);
};

const UpdaterateStage = async (id, StageID) => {
  const rate = await PercentagecalculationforSTage(StageID, id);
  await UpdaterateandcostStage(rate, StageID, id);
};

const addallcostandrate = async () => {
  const result = await SELECTProjectid();
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    // console.log(element.id);
    await UpdaterateCost(element.id);
    await UpdaterateCost(element.id, "cost");
  }
};

const addrateallinstage = async () => {
  const result = await SELECTStageid();
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    // console.log(element.ProjectID, element.StageID);
    await UpdaterateStage(element.ProjectID, element.StageID);
  }
};

const updatelastproject = async () => {
  await Updaterateandcost(149, 0, "companySubprojects", "rate", "id");
  const result = await SELECTStageallid(149);
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    await Updaterateandcost(
      element.StageCustID,
      0,
      "StagesCUST",
      "rate",
      "StageCustID"
    );
  }
};

// updatelastproject();
// addallcostandrate();
// addrateallinstage();

const PercentagecalculationforProject = async (id) => {
  try {
    //  نستدعي عدد كل المراحل الفرعية للمشروع
    const accountallStage = await SELECTTablecompanybrinshStagesSubAll(id);
    const countall = accountallStage["COUNT(StageSubName)"];
    const accountTrueStage = await SELECTTablecompanybrinshStagesSubAll(
      id,
      "true"
    );
    const countTrue = accountTrueStage["COUNT(StageSubName)"];
    let rate = (countTrue / countall) * 100;
    if (isNaN(rate)) {
      rate = 0;
    }

    return rate;
  } catch (error) {
    console.log(error);
  }
};

// وظيفة تقوم بتعديل بيانات الشمروع
const UpdataDataProject = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل حركة المستخدم (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdataDataProject");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      const {
        IDcompanySub,
        Nameproject,
        Note,
        TypeOFContract,
        GuardNumber,
        LocationProject,
        numberBuilding,
        Referencenumber,
        Cost_per_Square_Meter,
        Project_Space,
        ProjectID,
      } = req.body || {};

      const projectIdNum   = parsePositiveInt(ProjectID);
      const companySubId   = parsePositiveInt(IDcompanySub);
      const nameStr        = String(Nameproject ?? "").trim();
      const noteStr        = String(Note ?? "").trim();
      const contractStr    = String(TypeOFContract ?? "").trim(); // لا نفرض قيم محددة
      const guardNumStr    = convertArabicToEnglish(GuardNumber).replace(/[^\d\-+() ]/g, "").trim(); // إن كان رقم/وصف
      const buildingsNum   = parsePositiveInt(numberBuilding);
      const refNumStr      = String(Referencenumber ?? "").trim();
      const costPerM2Num   = parseNonNegativeFloat(Cost_per_Square_Meter);
      const spaceNum       = parseNonNegativeFloat(Project_Space);

      // رابط الموقع: نقبله فقط إن كان http/https وإلا نجعله null
      const locationStr    = isHttpUrl(LocationProject) ? String(LocationProject).trim().slice(0, 2048) : null;

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum))  errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!Number.isFinite(companySubId))  errors.IDcompanySub = "رقم الفرع/الشركة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 150)) errors.Nameproject = "اسم المشروع مطلوب (2 إلى 150 حرف)";
      if (isNonEmpty(noteStr) && !lenBetween(noteStr, 0, 2000)) errors.Note = "الملاحظة يجب ألا تتجاوز 2000 حرف";
      if (!isNonEmpty(contractStr) || !lenBetween(contractStr, 1, 50)) errors.TypeOFContract = "نوع التعاقد مطلوب (حتى 50 حرفاً)";
      if (!Number.isFinite(buildingsNum)) errors.numberBuilding = "عدد المباني يجب أن يكون عدداً صحيحاً موجباً";
      if (isNonEmpty(refNumStr) && !lenBetween(refNumStr, 1, 100)) errors.Referencenumber = "مرجع العقد يجب ألا يتجاوز 100 حرف";
      if (req.body.hasOwnProperty("Cost_per_Square_Meter") && !Number.isFinite(costPerM2Num)) errors.Cost_per_Square_Meter = "تكلفة المتر يجب أن تكون رقماً صفرياً أو موجباً";
      if (req.body.hasOwnProperty("Project_Space") && !Number.isFinite(spaceNum)) errors.Project_Space = "مساحة المشروع يجب أن تكون رقماً صفرياً أو موجباً";

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) جلب بيانات البداية للمقارنة (قد تُعيد null)
      const startRow = await SELECTProjectStartdate(projectIdNum);
      if(startRow.TypeOFContract !== contractStr)
        {
          errors.TypeOFContract = 'لايمكن تعديل نوع العقد';
        return res.status(200).json({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }
      // 6) تنفيذ التحديث
      const ok = await UpdateTablecompanySubProject([
        convertArabicToEnglish(esc(companySubId)),
        esc(nameStr),
        isNonEmpty(noteStr) ? esc(noteStr) : null,
        esc(contractStr),
        isNonEmpty(guardNumStr) ? esc(guardNumStr) : null,
        locationStr, // قد تكون null
        convertArabicToEnglish(esc(buildingsNum)),
        isNonEmpty(refNumStr) ? esc(refNumStr) : null,
        Number.isFinite(costPerM2Num) ? convertArabicToEnglish(esc(costPerM2Num)) : null,
        Number.isFinite(spaceNum) ? convertArabicToEnglish(esc(spaceNum)) : null,
        convertArabicToEnglish(esc(projectIdNum)),
      ]);


      // 7) إعادة ترتيب المراحل عند تغيير عدد المباني (لا تُسقط العملية عند الفشل)
      try {
        const prevBuildings = parsePositiveInt(startRow?.numberBuilding);
        if (Number.isFinite(prevBuildings) && prevBuildings !== buildingsNum) {
          await RearrangeStageID(
            projectIdNum,
            startRow,                 // كما في كودك الأصلي
            buildingsNum,
            userSession?.IDCompany
          );
        }
      } catch (e) {
        console.warn("RearrangeStageID failed:", e);
      }
      // 8) نجاح
      return res.status(200).json({ success:  true, message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("UpdataDataProject error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};




const CloseOROpenProject = (uploadQueue) => {
  return async (req, res) => {
    try {
      const idProject = req.query.idProject;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "CloseOROpenProject"
      );
      const project = await SELECTTablecompanySubProjectLast_id(
        convertArabicToEnglish(esc(idProject)),
        "party"
      );
      let Disabled = "true";
      if (project?.Disabled === "true") {
        Disabled = "false";
      }
      await UpdateProjectClosorOpen([Disabled, convertArabicToEnglish(esc(idProject))]);
      res.send({ success: "تمت العملية بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(401);
    }
  };
};

// وظيفة تقوم باعادة ترتيب المراحل وايامها
const RearrangeStageID = async (
  ProjectID,
  StartDate,
  numberBuilding,
  IDCompany
) => {
  try {
    const DataSTage = await SELECTTablecompanySubProjectStageCUST(ProjectID);

    let tables = [];
    for (let index = 0; index < DataSTage.length; index++) {
      const element = DataSTage[index];

      const dataSimble = await SELECTFROMTableStageTempletadays(
        element.StageID,
        element.Type,
        IDCompany
      );
      let Days = await AccountDays(numberBuilding, dataSimble.Days);

      tables.push({
        ...element,
        Days: Math.round(Days),
      });
    }
    let date = StartDate["Contractsigningdate"];
    if (StartDate["ProjectStartdate"] !== null) {
      date = StartDate["ProjectStartdate"];
    }

    await DeleteTablecompanySubProjectphase(ProjectID);
    await Stage(tables, date, "update");
  } catch (error) {
    console.log(error);
  }
};

// const count = 14 + 14 / 3;
// console.log(count);
//  وظيفة لحذف المشروع كامل مع توابعه
const DeletProjectwithDependencies = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeletProjectwithDependencies"
      );
      const id = req.query.idProject;
      await opreationDeletProject(id);
      await Updatesubscripationwhendeletproject(id);
      res.send({ success: "تمت عملية الحذف بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشلت عملية حذف الرسالة" }).status(200);
    }
  };
};

const opreationDeletProject = (id) => {
  [
    { name: "StagesCUST", type: "ProjectID" },
    { name: "StageNotes", type: "ProjectID" },
    { name: "StagesSub ", type: "projectID" },
    { name: "Expense ", type: "projectID" },
    { name: "Revenue ", type: "projectID" },
    { name: "Returns ", type: "projectID" },
    { name: "Savepdf ", type: "projectID" },
    { name: "Archives ", type: "ProjectID" },
    { name: "Requests ", type: "ProjectID" },
    { name: "Post ", type: "ProjectID" },
    { name: "ChatSTAGE ", type: "ProjectID" },
    { name: "Chat ", type: "ProjectID" },
    { name: "Navigation ", type: "ProjectID" },
    { name: "companySubprojects ", type: "id" },
  ].forEach(async (pic) => {
    await DeleteTablecompanySubProjectall(pic.name, pic.type, id);
  });
};

// وظيفة تقوم بإضافة تاريخ بدء تنفيذ المشروع واعادة ترتيب تواريخ المراحل
const UpdateStartdate = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const bodyData = req.body?.data || {};
      const projectIdNum = parsePositiveInt(bodyData?.ProjectID);
      const startISO     = moment.parseZone(bodyData?.ProjectStartdate);

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!startISO) errors.ProjectStartdate = "تاريخ البداية غير صالح (ادعم YYYY-MM-DD أو DD/MM/YYYY)";
      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) سجل حركة المستخدم (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateStartdate");
      } catch (_) {}

      // 5) جلب بيانات المراحل الحالية قبل أي حذف (للاستخدام في إعادة التوليد)
      const dataItem = await SELECTTablecompanySubProjectStageCUST(projectIdNum);
      if (!dataItem || (Array.isArray(dataItem) && dataItem.length === 0)) {
        return res.status(200).json({ success: "لا توجد مراحل حالية للمشروع لإعادة جدولتها", message: "لا توجد مراحل حالية للمشروع لإعادة جدولتها" });
      }

      // 6) تحديث تاريخ بدء المشروع
      await UpdateProjectStartdateinProject([
        esc(startISO),
        convertArabicToEnglish(esc(projectIdNum)),
      ]);

      // 7) حذف المراحل/الفترات الحالية ثم إعادة توليدها من dataItem
      await DeleteTablecompanySubProjectphase(projectIdNum);

      // ملاحظة: نفترض أن Stage تُعيد توليد السجلات وفق startISO والوضع "update"
      await Stage(dataItem, startISO, "update");

      // 8) نجاح
      return res.status(200).json({ success: "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("UpdateStartdate error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};

// وظيفة تقوم بإعادة ترتيب المراحل حسب رؤية المستخدم
const RearrangeStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "RearrangeStage");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      // نسمح بالحقل بأي من الاسمين: DataStage أو DataSTage
      const DataStage = Array.isArray(req.body?.DataStage)
        ? req.body.DataStage
        : (Array.isArray(req.body?.DataSTage) ? req.body.DataSTage : []);

      // تحقق أساسي
      if (!Array.isArray(DataStage) || DataStage.length === 0) {
        return res.status(200).json({ success: "قائمة المراحل (DataStage) مطلوبة وغير فارغة", message: "قائمة المراحل (DataStage) مطلوبة وغير فارغة" });
      }

      // جميع العناصر يجب أن تحتوي ProjectID نفسه وصحيح موجب
      const firstProjectId = parsePositiveInt(DataStage[0]?.ProjectID);
      if (!Number.isFinite(firstProjectId)) {
        return res.status(200).json({ success: "ProjectID غير صالح في عناصر DataStage", message: "ProjectID غير صالح في عناصر DataStage" });
      }
      for (let i = 0; i < DataStage.length; i++) {
        const pid = parsePositiveInt(DataStage[i]?.ProjectID);
        if (!Number.isFinite(pid) || pid !== firstProjectId) {
          return res.status(200).json({
            success:  `ProjectID غير متسق/صالح في العنصر رقم ${i + 1}`,
            message: `ProjectID غير متسق/صالح في العنصر رقم ${i + 1}`
          });
        }
      }

      // 4) جلب تاريخ البداية/التعاقد للمشروع
      const startRow = await SELECTProjectStartdate(firstProjectId);
      if (!startRow) {
        return res.status(404).json({ success: "لم يتم العثور على المشروع", message: "لم يتم العثور على المشروع" });
      }

      // نختار ProjectStartdate إن وُجد، وإلا Contractsigningdate
      let baseDate = startRow?.ProjectStartdate ?? startRow?.Contractsigningdate ?? null;
      const baseISO = tryParseDateISO(baseDate);
      if (!baseISO) {
        return res.status(200).json({ success: "تاريخ بداية/تعاقد المشروع غير صالح", message: "تاريخ بداية/تعاقد المشروع غير صالح" });
      }

      // 5) حذف المراحل الحالية ثم إعادة توليدها
      await DeleteTablecompanySubProjectphase(firstProjectId);

      // ملاحظة: نفترض أن دالة Stage تُعيد حساب التواريخ حسب baseISO مع الوضع "update"
      await Stage(DataStage, baseISO, "update");

      // 6) أي إجراءات لاحقة (إشعارات/سجل تغييرات) — لا تُسقط العملية عند الفشل
      try { await RearrangeStageProject(firstProjectId, userSession.userName); }
      catch (e) { console.warn("RearrangeStageProject failed:", e); }

      // 7) نجاح
      return res.status(200).json({ success: "تمت العملية بنجاح",  message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("RearrangeStage error:", error);
      return res.status(500).json({ success: "خطاء في تنفيذ العملية",  message: "خطاء في تنفيذ العملية" });
    }
  };
};

// وظيفة تعديل تاخيرات المرحلة الرئيسية
const UpdateNotesStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل حركة المستخدم (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateNotesStage");
      } catch(_) {}

      // 3) التقاط/تطبيع المدخلات
      const {
        StageNoteID,
        Type,
        Note,
        RecordedBy,
        countdayDelay,
        ImageAttachment: ImageAttachmentFromBody
      } = req.body || {};

      const stageNoteIdNum = parsePositiveInt(StageNoteID);
      const typeStr        = String(Type ?? "").trim();
      const noteStr        = String(Note ?? "").trim();
      const recordedByStr  = String(RecordedBy ?? userSession.userName ?? "").trim();
      const delayCount     = (countdayDelay === undefined || countdayDelay === null || String(countdayDelay) === "")
        ? 0 : parseNonNegativeInt(countdayDelay);

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(stageNoteIdNum)) errors.StageNoteID = "معرّف الملاحظة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(typeStr) || !lenBetween(typeStr, 1, 50)) errors.Type = "نوع الملاحظة مطلوب (حتى 50 حرفاً)";
      if (!isNonEmpty(noteStr) || !lenBetween(noteStr, 1, 2000)) errors.Note = "نص الملاحظة مطلوب (1 إلى 2000 حرف)";
      if (!isNonEmpty(recordedByStr) || !lenBetween(recordedByStr, 2, 100)) errors.RecordedBy = "اسم المُسجِّل مطلوب";
      if (!Number.isFinite(delayCount)) errors.countdayDelay = "عدد أيام التأخير يجب أن يكون عدداً صحيحاً صفرياً أو موجباً";

      // 5) المرفق (اختياري): إما ملف جديد أو قيمة body (قد تكون null لحذف القديم)
      const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf","image/gif"];
      const maxSize = 15 * 1024 * 1024; // 15MB
      let imageAttachmentFinal = null;

      if (req.file) {
        const mime = String(req.file.mimetype || "");
        const size = Number(req.file.size || 0);
        if (!allowed.includes(mime)) errors.ImageAttachment = "نوع الملف غير مدعوم (يُقبل صور/PDF)";
        if (size > maxSize) errors.ImageAttachment = "حجم الملف يتجاوز 15MB";
      } else {
        // إن لم يُرفع ملف جديد، نستعمل القيمة القادمة من body إن وُجدت
        // ملاحظة: لو كانت "null" أو "" سنعتبرها حذفاً للمرفق
        if (ImageAttachmentFromBody !== undefined && ImageAttachmentFromBody !== null) {
          const bodyName = String(ImageAttachmentFromBody).trim();
          imageAttachmentFinal = bodyName === "" || bodyName.toLowerCase() === "null" ? null : sanitizeFilename(bodyName);
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 6) رفع الملف (إن وُجد) قبل التحديث
      if (req.file) {
        try {
          await uploaddata(req.file); // نقل إلى التخزين الدائم
        } catch (upErr) {
          console.error("uploaddata failed:", upErr);
          return res.status(500).json({ success: "فشل رفع الملف", message: "فشل رفع الملف" });
        } finally {
          try { deleteFileSingle(req.file.filename, "upload"); } catch {}
        }
        imageAttachmentFinal = sanitizeFilename(req.file.filename || req.file.originalname);
        if (!isNonEmpty(imageAttachmentFinal)) {
          return res.status(200).json({ success: "اسم الملف غير صالح بعد التنظيف", message: "اسم الملف غير صالح بعد التنظيف" });
        }
      }

      // 7) التحديث في قاعدة البيانات
      await UPDATETablecompanySubProjectStageNotes([
        esc(typeStr),
        esc(noteStr),
        esc(recordedByStr),
        convertArabicToEnglish(esc(delayCount)),
        imageAttachmentFinal !== null ? esc(imageAttachmentFinal) : null,
        convertArabicToEnglish(esc(stageNoteIdNum)),
      ]);

      // 8) رد النجاح
      return res.status(200).json({ success: "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

      // (اختياري) إشعارات لاحقة
      // try { await Delayinsert(ProjectID, StagHOMID, userSession.userName); } catch {}

    } catch (err) {
      console.error("UpdateNotesStage error:", err);
      return res.status(500).json({ success: "فشل في تنفيذ العملية", message: "فشل في تنفيذ العملية" });
    }
  };
};



const UpdateDataStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).send("Invalid session");
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateDataStage");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      const { ProjectID, StageID, StageName, Days, Ratio } = req.body || {};
      let { attached } = req.body || {};

      const projectIdNum = parsePositiveInt(ProjectID);
      const stageIdNum   = StageID;
      const stageNameStr = String(StageName ?? "").trim();
      const daysNum      = parseNonNegativeInt(Days);
      const ratioNum     = parseRatio(Ratio) ;

      // ملف اختياري: نسمح برفعه عبر req.file أيضاً
      if (req.file) {
        const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf","image/gif"];
        const maxSize = 15 * 1024 * 1024;
        const mime = String(req.file.mimetype || "");
        const size = Number(req.file.size || 0);
        if (!allowed.includes(mime)) {
          return res.status(200).json({ success:"نوع المرفق غير مدعوم (صور/PDF)" , message:"نوع المرفق غير مدعوم (صور/PDF)" });
        }
        if (size > maxSize) {
          return res.status(200).json({ success:"حجم المرفق يتجاوز 15MB", message:"حجم المرفق يتجاوز 15MB" });
        }
        try {
          await uploaddata(req.file);
        } catch (upErr) {
          console.error("uploaddata failed:", upErr);
          return res.status(500).json({ success:"فشل رفع الملف", message:"فشل رفع الملف" });
        } finally {
          try { deleteFileSingle(req.file.filename, "upload"); } catch {}
        }
        attached = sanitizeFilename(req.file.filename || req.file.originalname);
      } else if (attached !== undefined) {
        // دعم مسح المرفق بإرسال "" أو "null"
        const s = String(attached).trim();
        attached = (s === "" || s.toLowerCase() === "null") ? null : sanitizeFilename(s);
      } else {
        attached = undefined; // لا تغيّر المرفق
      }

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع غير صالح";
      if (!isNonEmpty(stageIdNum))   errors.StageID   = "معرف المرحله غير موجود ";
      if (!isNonEmpty(stageNameStr) || !lenBetween(stageNameStr, 2, 150))
        errors.StageName = "اسم المرحلة مطلوب (2–150 حرف)";
      if (!Number.isFinite(daysNum)) errors.Days = "عدد الأيام يجب أن يكون عدداً صحيحاً صفرياً أو موجباً";
      if (!Number.isFinite(ratioNum) || ratioNum < 0 || ratioNum > 100)
        errors.Ratio = "النسبة يجب أن تكون بين 0 و 100";
      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });
      }

      // 5) جلب بيانات المرحلة الحالية (للتحقق من حالة الإغلاق/الأيام الحالية)
      const verify = await SELECTTablecompanySubProjectStageCUSTONe(projectIdNum, stageIdNum);
      if (!verify) {
        return res.status(404).json({ success:"لم يتم العثور على المرحلة", message:"لم يتم العثور على المرحلة" });
      }

      // 6) حساب النسبة الإجمالية الصحيحة (طرح نسبة المرحلة الحالية ثم إضافة الجديدة)
      const ObjectStage = await SELECTTablecompanySubProjectStageCUSTONe(
        projectIdNum,
        stageIdNum,
        "all",
        `,(SELECT SUM(Ratio) FROM StagesCUST WHERE ProjectID = cu.ProjectID) AS TotalRatio`
      );
      const currentTotal = Number(ObjectStage?.TotalRatio || 0);
      const currentSelf  = Number(ObjectStage?.Ratio || 0);
      const newTotal     = currentTotal - currentSelf + ratioNum;

      if (newTotal > 100) {
        return res.status(200).json({ error: "مجموع النسب لا يجب أن يتجاوز 100" });
      }
      if (newTotal < 0) {
        return res.status(200).json({ error: "مجموع النسب لا يجب أن يكون سالباً" });
      }

      // 7) عدم السماح بتغيير الأيام إذا كانت المرحلة مُغلَقة (أو مُنجَزة)
      let DaysValue = daysNum;
      let message   = "تمت العملية بنجاح";
      const isClosed = (String(verify?.Done).toLowerCase() === "true") || (verify?.CloseDate != null);
      if (isClosed && Number(daysNum) !== Number(verify?.Days)) {
        DaysValue = Number(verify?.Days);
        message = "تم التحديث دون تعديل أيام المرحلة لأنها مُغلَقة/مُنتهية";
      }

      // 8) تنظيف اسم المرحلة مع الحفاظ على رقمها الأصلي بين قوسين
      const originalName = String(ObjectStage?.StageName ?? stageNameStr);
      // إزالة الأرقام الموجودة في الاسم المُدخل (حتى لا تتراكم)
      let cleanedName = stageNameStr.replace(/\s*\(?\b\d{1,4}\b\)?\s*/g, "").trim();
      if (!cleanedName) cleanedName = stageNameStr.trim();
      // استخراج رقم المرحلة من الاسم الأصلي (إن وُجد)
      let indexStage = originalName.match(/\b\d{2,3}\b/);
      if (!indexStage) indexStage = originalName.match(/\b\d{1,4}\b/);
      const stageNumber = indexStage?.[0] || "";
      const finalStageName = stageNumber ? `${cleanedName} (${stageNumber})` : cleanedName;

      // 9) تنفيذ التحديث
      await UPDATETablecompanySubProjectStageCUST([
        esc(finalStageName),
        convertArabicToEnglish(esc(DaysValue)),
        convertArabicToEnglish(esc(ratioNum)),
        (attached === undefined ? ObjectStage?.attached : attached) ?? null,
        convertArabicToEnglish(esc(stageIdNum)),
        convertArabicToEnglish(esc(projectIdNum)),
      ]);

      // 10) إجراءات لاحقة (لا تُسقط العملية عند الفشل)
      try { await UpdaterateCost(projectIdNum); } catch {}
      try { await UpdaterateStage(projectIdNum, stageIdNum); } catch {}
      try { await Stageinsert(projectIdNum, stageIdNum, userSession.userName, "تعديل"); } catch {}

      // 11) الاستجابة
      return res.status(200).json({ success: message, message });

    } catch (error) {
      console.error("UpdateDataStage error:", error);
      return res.status(500).send({ success: "خطاء في تنفيذ العملية" });
    }
  };
};


// وظيفة حذف المرحلة الرئيسية
const DeleteStageHome = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeleteStageHome"
      );
      const { ProjectID, StageID } = req.query;
      await DeleteTablecompanyStageHome(ProjectID, StageID);
      await DeleteTablecompanyStageSub(ProjectID, StageID);
      const table = await SELECTTablecompanySubProjectStageCUST(ProjectID);
      let arraytable = [];
      table
        .filter(
          (item) => item.ProjectID !== ProjectID && item.StageID !== StageID
        )
        .forEach((pic) => {
          let split = pic?.StageName?.split("(");
          let b = split[0].trim();
          arraytable.push({
            ...pic,
            StageName: b,
          });
        });
      if (arraytable.length > 0) {
        await DeleteTablecompanySubProjectphase(ProjectID);
        const StartDate = await SELECTProjectStartdate(ProjectID);
        let date = StartDate["Contractsigningdate"];
        if (StartDate["ProjectStartdate"] !== null) {
          date = StartDate["ProjectStartdate"];
        }
        await Stage(arraytable, date);
      }
      res.send({ success: "نجح تنيفذ العملية" }).status(200);
      await UpdaterateCost(ProjectID);
      await UpdaterateStage(ProjectID, StageID);
    } catch (error) {
      console.log(error);
    }
  };
};

// وظيفة تعديل المرحلة الفرعية
const UpdateDataStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).send("Invalid session");
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateDataStageSub");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      const { StageSubName, StageSubID } = req.body || {};
      const stageSubIdNum = parsePositiveInt(StageSubID);
      const cleanedName   = sanitizeName(StageSubName);

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(stageSubIdNum)) errors.StageSubID = "رقم الخطوة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(cleanedName) || !lenBetween(cleanedName, 2, 150))
        errors.StageSubName = "اسم الخطوة مطلوب (2 إلى 150 حرف) وبمحارف مسموح بها فقط";
      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) جلب بيانات الخطوة الحالية لمعرفة (ProjectID, StagHOMID, الاسم الحالي)
      const current = await SELECTTablecompanySubProjectStagesSubSingl(stageSubIdNum);
      if (!current) {
        return res.status(404).json({ success:  "لم يتم العثور على الخطوة المطلوبة", message: "لم يتم العثور على الخطوة المطلوبة" });
      }

      // 6) منع التكرار داخل نفس المرحلة (نفس ProjectID + StagHOMID)
      try {
        const dup = await SELECTTablecompanySubProjectStagesSub(
          current.ProjectID,
          current.StagHOMID,
          cleanedName
        );
        // إن وُجدت خطوة بنفس الاسم ولكن بمعرّف مختلف → تعارض
        if (Array.isArray(dup) && dup.length > 0 && Number(dup[0]?.StageSubID) !== Number(stageSubIdNum)) {
          return res.status(409).json({ success:"اسم الخطوة موجود بالفعل في هذه المرحلة", message: "اسم الخطوة موجود بالفعل في هذه المرحلة" });
        }
      } catch (_) { /* إذا كانت الدالة تعيد undefined عند عدم الوجود فلا مشكلة */ }

      // 7) في حال الاسم لم يتغير فعلياً، نعيد نجاح مبكّر
      if (String(current.StageSubName || "").trim() === cleanedName) {
        return res.status(200).json({ success: true, message: "لا يوجد تغيير في اسم الخطوة" });
      }

      // 8) تنفيذ التحديث
      await UPDATETablecompanySubProjectStagesSub([
        esc(cleanedName),
        convertArabicToEnglish(esc(stageSubIdNum)),
      ]);

      // 9) (اختياري) سجلّ عملية/إشعار — لا تُسقط العملية عند الفشل
      try { await StageSubinsert(current.ProjectID, current.StagHOMID, userSession.userName); } catch {}

      // 10) نجاح
      return res.status(200).json({ success:  "تم تنفيذ العملية بنجاح", message: "تم تنفيذ العملية بنجاح" });

    } catch (error) {
      console.error("UpdateDataStageSub error:", error);
      return res.status(500).json({ success: "فشل تنفيذ العملية", message: "فشل تنفيذ العملية" });
    }
  };
};

const UpdateDataStageSubv2 = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).send("Invalid session");
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateDataStageSub");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      const { StageSubName, StageSubID } = req.body || {};
      const stageSubIdNum = parsePositiveInt(StageSubID);
      const cleanedName   = sanitizeName(StageSubName);

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(stageSubIdNum)) errors.StageSubID = "رقم الخطوة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(cleanedName) || !lenBetween(cleanedName, 2, 150))
        errors.StageSubName = "اسم الخطوة مطلوب (2 إلى 150 حرف) وبمحارف مسموح بها فقط";

      // تحقق المرفق (اختياري)
      let attachedFileName = null;
      if (req.file) {
        const allowed = ["image/png","image/jpeg","image/jpg","image/webp","image/gif","application/pdf"];
        const maxSize = 15 * 1024 * 1024; // 15MB
        const mime = String(req.file.mimetype || "");
        const size = Number(req.file.size || 0);
        if (!allowed.includes(mime)) errors.attached = "نوع المرفق غير مدعوم (صور/PDF)";
        if (size > maxSize) errors.attached = "حجم المرفق يتجاوز 15MB";
        attachedFileName = sanitizeFilename(req.file.filename || req.file.originalname);
        if (!isNonEmpty(attachedFileName)) errors.attached = "اسم الملف غير صالح بعد التنظيف";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) جلب بيانات الخطوة الحالية (للحصول على ProjectID و StagHOMID)
      const current = await SELECTTablecompanySubProjectStagesSubSingl(stageSubIdNum);
      if (!current) {
        return res.status(404).json({ success: false, message: "لم يتم العثور على الخطوة المطلوبة" });
      }

      // 6) منع التكرار داخل نفس المرحلة (نفس ProjectID + StagHOMID)
      try {
        const dup = await SELECTTablecompanySubProjectStagesSub(
          current.ProjectID,
          current.StagHOMID,
          cleanedName
        );
        if (Array.isArray(dup) && dup.length > 0 && Number(dup[0]?.StageSubID) !== Number(stageSubIdNum)) {
          return res.status(409).json({ success: false, message: "اسم الخطوة موجود بالفعل في هذه المرحلة" });
        }
      } catch (_) {}

      // 7) تنفيذ التحديث (مع/بدون مرفق)
      if (!req.file) {
        // تحديث الاسم فقط
        await UPDATETablecompanySubProjectStagesSub([
          esc(cleanedName),
          convertArabicToEnglish(esc(stageSubIdNum)),
        ]);
      } else {
        // تحديث الاسم + المرفق
        await UPDATETablecompanySubProjectStagesSub(
          [esc(cleanedName), esc(attachedFileName), convertArabicToEnglish(esc(stageSubIdNum))],
          "Name",
          "StageSubName=?,attached=?"
        );
        try {
          await uploaddata(req.file);                 // رفع الملف للتخزين الدائم
          implmentOpreationSingle("upload", attachedFileName); // منطقك الحالي
        } catch (upErr) {
          console.error("uploaddata/implmentOpreationSingle failed:", upErr);
          // ملاحظة: التحديث تم بالفعل؛ بإمكانك هنا إعادة المحاولة أو تسجيل فقط.
        }
      }

      // 8) (اختياري) سجلّ عملية/إشعار — لا تُسقط العملية عند الفشل
      // try { await StageSubinsert(current.ProjectID, current.StagHOMID, userSession.userName); } catch {}

      // 9) نجاح
      return res.status(200).json({ success: "تم تنفيذ العملية بنجاح", message: "تم تنفيذ العملية بنجاح" });

    } catch (error) {
      console.error("UpdateDataStageSubv2 error:", error);
      return res.status(500).json({ success: false, message: "فشل تنفيذ العملية" });
    }
  };
};

// وظيفة حذف المرحلة الفرعية
const DeleteStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeleteStageSub"
      );
      const StageSubID = req.query.StageSubID;
      await DeleteTablecompanySubProjectall(
        "StagesSub",
        "StageSubID",
        StageSubID
      );
      res.send({ success: "تم تنفيذ العملية بنجاح" }).status(200);
      const result = await SELECTStageSubid(
        "StagesSub",
        "ProjectID,StagHOMID",
        `StageSubID=${StageSubID}`
      );
      await UpdaterateCost(result?.ProjectID);
      await UpdaterateStage(result?.ProjectID, result?.StagHOMID);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(501);
    }
  };
};

// *********************************************************************************
// ****************تعديل اسم المجلد او حذفة في الارشيف ***************************

// وظيفة عملية تعديل اسم اي ملف في الارشيف
const ClassUpdataNmaeinArchive = async (
  ArchivesID,
  name,
  idsub,
  kidopreation
) => {
  let childrenNew;
  try {
    const children = await SELECTTablecompanySubProjectarchivesotherroad(
      ArchivesID
    );
    let Children =
      children.children !== null ? JSON.parse(children.children) : [];
    if (kidopreation === "update") {
      childrenNew = await updateChild(name, Children, idsub);
    } else {
      childrenNew = await deletChild(Children, idsub);
    }

    if (childrenNew !== undefined) {
      await UPDATETablecompanySubProjectarchivesFolderinChildern([
        JSON.stringify(childrenNew),
        ArchivesID,
      ]);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateChild = (name, children, idsub) => {
  return new Promise((resolve, reject) => {
    const fileIndex = children.findIndex(
      (file) => parseInt(file.id) === parseInt(idsub)
    );
    if (fileIndex > -1) {
      children[fileIndex].name = name;
      resolve(children);
    } else {
      const promises = [];
      children.forEach((child) => {
        if (child.children) {
          promises.push(updateChild(name, child.children, idsub));
        }
      });
      Promise.all(promises)
        .then((results) => {
          resolve(children);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};
const deletChild = (children, idsub) => {
  return new Promise((resolve, reject) => {
    const fileIndex = children.findIndex(
      (file) => file.id === idsub // Assuming ids are strings
    );

    if (fileIndex > -1) {
      // File found, filter it out
      const updatedChildren = children.filter((file) => file.id !== idsub);
      resolve(updatedChildren);
    } else {
      // File not found, check children recursively
      const promises = children.map((child) => {
        if (child.children) {
          return deletChild(child.children, idsub).then((updatedChildren) => {
            // Update child with new children if any were deleted
            if (updatedChildren.length !== child.children.length) {
              child.children = updatedChildren;
            }
            return child; // Return updated child
          });
        }
        return Promise.resolve(child); // Return child as is if no children
      });

      Promise.all(promises)
        .then((results) => {
          resolve(results); // Return all updated children
        })
        .catch((error) => {
          reject(`Error in processing children: ${error}`);
        });
    }
  });
};

// ===== Helpers: تطبيع/تحقق/تنظيف (بدون مكتبات) =====


function getExt(filename) {
  const s = String(filename || "");
  const i = s.lastIndexOf(".");
  return i > 0 ? s.slice(i + 1) : "";
}
function ensureFileNameHasExt(newName, oldName) {
  const cleanNew = String(newName || "").trim();
  const oldExt = getExt(oldName);
  if (!oldExt) return cleanNew; // لا امتداد قديم
  // لو الاسم الجديد لا ينتهي بنفس الامتداد، نُضيفه (سلوك صديق للمستخدم)
  if (!new RegExp(`\\.${oldExt}$`, "i").test(cleanNew)) {
    return `${cleanNew}.${oldExt}`;
  }
  return cleanNew;
}
// محركات مساعدة للبحث داخل children (إن كانت البنية قياسية: [{id, name, type, children:[]}, ...])
function safeParseChildren(jsonStr) {
  if (!jsonStr) return [];
  try { return JSON.parse(jsonStr) || []; } catch { return []; }
}
function findNodeById(list, idNum) {
  if (!Array.isArray(list)) return null;
  for (const n of list) {
    if (Number(n?.id) === idNum) return n;
    const child = findNodeById(n?.children || [], idNum);
    if (child) return child;
  }
  return null;
}
function findParentOfId(list, idNum, parent = null) {
  if (!Array.isArray(list)) return null;
  for (const n of list) {
    if (Number(n?.id) === idNum) return parent;
    const child = findParentOfId(n?.children || [], idNum, n);
    if (child) return child;
  }
  return null;
}
function hasSiblingNameConflict(siblings, targetId, targetType, newName) {
  if (!Array.isArray(siblings)) return false;
  const normNew = String(newName || "").trim().toLowerCase();
  return siblings.some(s =>
    String(s?.type || "").toLowerCase() === String(targetType || "").toLowerCase() &&
    Number(s?.id) !== Number(targetId) &&
    String(s?.name || "").trim().toLowerCase() === normNew
  );
}

const UpdateNameFolderOrfileinArchive = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateNameFolderOrfileinArchive");
      } catch (_) {}

      // 3) التقاط/تطبيع المدخلات
      const {
        ArchivesID,
        id,
        type,
        name,
        kidopreation,
        nameOld, // للملفات
      } = req.body || {};

      const archivesIdNum = parsePositiveInt(ArchivesID);
      const nodeIdNum     = parsePositiveInt(id);
      const typeStr       = String(type ?? "").trim().toLowerCase(); // "folder" أو "file"
      const opStrRaw      = String(kidopreation ?? "").trim().toLowerCase(); // "update" أو "delete"
      const cleanedNameIn = sanitizeName(name);
      const nameOldStr    = String(nameOld ?? "").trim();

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(archivesIdNum)) errors.ArchivesID = "رقم الأرشيف مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!Number.isFinite(nodeIdNum))     errors.id = "المعرّف مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!["folder", "file"].includes(typeStr)) errors.type = "النوع يجب أن يكون folder أو file";
      const allowedOps = ["update", "delete"];
      const opStr = allowedOps.includes(opStrRaw) ? opStrRaw : "update"; // افتراضي update
      if (opStr === "update") {
        if (!isNonEmpty(cleanedNameIn) || !lenBetween(cleanedNameIn, 1, 100)) {
          errors.name = "الاسم الجديد مطلوب (1 إلى 100 حرف) وبمحارف مسموح بها";
        }
      }
      if (typeStr === "file" && opStr === "update" && !isNonEmpty(nameOldStr)) {
        errors.nameOld = "الاسم القديم للملف مطلوب عند التحديث";
      }
      if (Object.keys(errors).length > 0) {
        return res.status(200).json({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) جلب شجرة الأرشيف للتأكد من عدم تعارض الاسم ضمن نفس الأب
      const row = await SELECTTablecompanySubProjectarchivesotherroad(archivesIdNum);
      if (!row) {
        return res.status(404).json({ success: "لم يتم العثور على سجل الأرشيف", message: "لم يتم العثور على سجل الأرشيف" });
      }
      const tree = safeParseChildren(row.children);
      const node = findNodeById(tree, nodeIdNum);
      if (!node) {
        return res.status(404).json({ success: false, message: "لم يتم العثور على العنصر المطلوب" });
      }

      // تحديد الأشقاء (نفس الأب) لفحص التعارض
      let siblings = [];
      if (Number(archivesIdNum) === Number(nodeIdNum)) {
        // جذر: ليس له أشقاء ضمن نفس المستوى — نتجاهل الفحص
        siblings = [];
      } else {
        const parent = findParentOfId(tree, nodeIdNum);
        siblings = parent ? (parent.children || []) : tree;
      }

      // 6) تجهيز الاسم النهائي
      let finalName = cleanedNameIn;
      if (typeStr === "file" && opStr === "update" && isNonEmpty(nameOldStr)) {
        finalName = ensureFileNameHasExt(cleanedNameIn, nameOldStr);
      }

      // 7) منع التعارض: اسم مطابق لنفس النوع عند نفس الأب
      if (opStr === "update" && hasSiblingNameConflict(siblings, nodeIdNum, typeStr, finalName)) {
        return res.status(409).json({ success: "هناك عنصر آخر بنفس الاسم في نفس المجلد", message: "هناك عنصر آخر بنفس الاسم في نفس المجلد" });
      }

      // 8) تنفيذ العملية
      if (typeStr === "folder") {
        // مجلد: جذر أم فرعي؟
        if (archivesIdNum === nodeIdNum) {
          await SwitchbetweendeleteorupdatefolderHome(finalName, nodeIdNum, opStr);
        } else {
          await ClassUpdataNmaeinArchive(archivesIdNum, finalName, nodeIdNum, opStr);
        }
      } else {
        // ملف
        const nameForOp = opStr === "delete" && !isNonEmpty(finalName) ? nameOldStr : finalName;
        await ClassUpdataNmaeinArchive(archivesIdNum, nameForOp, nodeIdNum, opStr);
        await Switchbetweendeleteorupdatefiles(nameOldStr, nameForOp, opStr);
      }

      // 9) نجاح
      return res.status(200).json({ success: "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("UpdateNameFolderOrfileinArchive error:", error);
      return res.status(500).json({ success: "خطاء في تنفيذ العملية", message: "خطاء في تنفيذ العملية" });
    }
  };
};


// وظيفة تعديل اوحذف من جوجل كلاود
const Switchbetweendeleteorupdatefiles = async (nameOld, name, type) => {
  try {
    switch (type) {
      case "update":
        await RenameBucket(nameOld, name);
        break;
      case "delete":
        await DeleteBucket(nameOld);
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

// تبديل بين حذف او تعديل المجلد الرئيسي
const SwitchbetweendeleteorupdatefolderHome = async (name, idsub, type) => {
  try {
    if (type === "update") {
      await UPDATETablecompanySubProjectarchivesFolder([name, idsub]);
    } else {
      await DeleteTablecompanySubProjectarchives(idsub);
    }
  } catch (error) {
    console.log(error);
  }
};

// ===== Helpers (بدون مكتبات): تطبيع/تحقق/تنظيف =====




const ALLOWED_MIMES = [
  "image/png","image/jpeg","image/jpg","image/webp","image/gif",
  "application/pdf","text/plain",
  "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv","application/zip","application/x-zip-compressed"
];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

// ========================= ExpenseUpdate =========================
const ExpenseUpdate = (uploadQueue) => {
  return async (req, res) => {
    try {
      // جلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "ExpenseUpdate"); } catch {}

      // مدخلات + تحقق
      const { Expenseid, Amount, Data, ClassificationName, Imageolddelete } = req.body || {};
      const expenseIdNum = parsePositiveInt(Expenseid);
      const amountNum    = parseNonNegativeFloat(Amount);
      const dataStr      = String(Data ?? "").trim();
      const classStr     = String(ClassificationName ?? "").trim();

      const errors = {};
      if (!Number.isFinite(expenseIdNum)) errors.Expenseid = "رقم المصروف غير صالح";
      if (!Number.isFinite(amountNum))    errors.Amount    = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStr) || !lenBetween(dataStr,1,2000)) errors.Data = "الوصف مطلوب (1–2000)";
      if (isNonEmpty(classStr) && !lenBetween(classStr,1,100)) errors.ClassificationName = "التصنيف حتى 100 حرف";
      if (Object.keys(errors).length) return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });

      // جلب السجل
      const elementUpdate = await SELECTTablecompanySubProjectexpenseObjectOne(expenseIdNum);
      if (!elementUpdate) return res.status(404).json({ success:"لم يتم العثور على المصروف المطلوب", message:"لم يتم العثور على المصروف المطلوب" });

      // صور قديمة
      const oldImages = elementUpdate.Image ? (JSON.parse(elementUpdate.Image || "[]") || []) : [];
      let arrayImage = Array.isArray(oldImages) ? [...oldImages] : [];

      // حذف صور قديمة مطلوبة
      if (isNonEmpty(Imageolddelete)) {
        const toDel = Imageolddelete.split(",").map(s => s.trim()).filter(Boolean);
        await Promise.all(toDel.map(async pic => {
          arrayImage = arrayImage.filter(x => x !== pic);
          try { await DeleteBucket(pic); } catch (e) { console.warn("DeleteBucket failed:", pic, e); }
        }));
      }

      // رفع ملفات جديدة
      const files = collectFiles(req);
      for (const f of files) {
        const mime = String(f.mimetype || ""); const size = Number(f.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ success:`نوع ملف غير مدعوم: ${mime}`, message:`نوع ملف غير مدعوم: ${mime}` });
        if (size > MAX_SIZE)               return res.status(200).json({ success:`حجم ملف يتجاوز 15MB`, message:`حجم ملف يتجاوز 15MB` });
      }
      for (const f of files) {
        try {
          await uploaddata(f);
          deleteFileSingle(f.filename, "upload");
          const safeName = sanitizeFilename(f.filename || f.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } catch (e) { console.error("upload failed:", f?.filename, e); }
      }
      // إزالة التكرار
      arrayImage = Array.from(new Set(arrayImage));

      // تحديث
      await UPDATETablecompanySubProjectexpense([
        convertArabicToEnglish(esc(amountNum)),
        esc(dataStr),
        isNonEmpty(classStr) ? esc(classStr) : null,
        arrayImage.length ? JSON.stringify(arrayImage) : null,
        convertArabicToEnglish(esc(expenseIdNum)),
      ]);

      // نجاح + تحديث التكلفة
      res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح" });
      try { await UpdaterateCost(elementUpdate?.projectID, "cost"); } catch {}
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل تنفيذ العملية" });
    }
  };
};

// ========================= RevenuesUpdate (العهد) =========================
const RevenuesUpdate = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "RevenuesUpdate"); } catch {}

      // فحص صلاحية المالية (مطابق لمنطقك)
      const companyRow = await SELECTTablecompany(userSession?.IDCompany);
      if (companyRow?.DisabledFinance !== "true") {
        return res.status(200).json({ success:"تم ايقاف الحذف اليدوي من قبل الادمن", message:"تم ايقاف الحذف اليدوي من قبل الادمن" });
      }

      const { RevenueId, Amount, Data, Bank, Imageolddelete } = req.body || {};
      const revenueIdNum = parsePositiveInt(RevenueId);
      const amountNum    = parseNonNegativeFloat(Amount);
      const dataStr      = String(Data ?? "").trim();
      const bankStr      = String(Bank ?? "").trim();

      const errors = {};
      if (!Number.isFinite(revenueIdNum)) errors.RevenueId = "رقم العهدة غير صالح";
      if (!Number.isFinite(amountNum))    errors.Amount    = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStr) || !lenBetween(dataStr,1,2000)) errors.Data = "الوصف مطلوب (1–2000)";
      if (isNonEmpty(bankStr) && !lenBetween(bankStr,1,100)) errors.Bank = "اسم البنك حتى 100 حرف";
      if (Object.keys(errors).length) return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });

      const elementUpdate = await SELECTTablecompanySubProjectREVENUEObjectOne(revenueIdNum);
      if (!elementUpdate) return res.status(404).json({ success:"لم يتم العثور على السجل المطلوب", message:"لم يتم العثور على السجل المطلوب" });

      const oldImages = elementUpdate.Image ? (JSON.parse(elementUpdate.Image || "[]") || []) : [];
      let arrayImage = Array.isArray(oldImages) ? [...oldImages] : [];

      if (isNonEmpty(Imageolddelete)) {
        const toDel = Imageolddelete.split(",").map(s => s.trim()).filter(Boolean);
        await Promise.all(toDel.map(async pic => {
          arrayImage = arrayImage.filter(x => x !== pic);
          try { await DeleteBucket(pic); } catch (e) { console.warn("DeleteBucket failed:", pic, e); }
        }));
      }

      const files = collectFiles(req);
      for (const f of files) {
        const mime = String(f.mimetype || ""); const size = Number(f.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ success:`نوع ملف غير مدعوم: ${mime}`, message:`نوع ملف غير مدعوم: ${mime}` });
        if (size > MAX_SIZE)               return res.status(200).json({ success:`حجم ملف يتجاوز 15MB`, message:`حجم ملف يتجاوز 15MB` });
      }
      for (const f of files) {
        try {
          await uploaddata(f);
          deleteFileSingle(f.filename, "upload");
          const safeName = sanitizeFilename(f.filename || f.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } catch (e) { console.error("upload failed:", f?.filename, e); }
      }
      arrayImage = Array.from(new Set(arrayImage));

      await UPDATETablecompanySubProjectREVENUE([
        convertArabicToEnglish(esc(amountNum)),
        esc(dataStr),
        isNonEmpty(bankStr) ? esc(bankStr) : null,
        arrayImage.length ? JSON.stringify(arrayImage) : null,
        convertArabicToEnglish(esc(revenueIdNum)),
      ]);

      res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح" });
      try { await UpdaterateCost(elementUpdate?.projectID, "cost"); } catch {}
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل في تنفيذ العملية" });
    }
  };
};

// ========================= ReturnsUpdate (المرتجع) =========================
const ReturnsUpdate = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "ReturnsUpdate"); } catch {}

      const { ReturnsId, Amount, Data, Imageolddelete } = req.body || {};
      const returnsIdNum = parsePositiveInt(ReturnsId);
      const amountNum    = parseNonNegativeFloat(Amount);
      const dataStr      = String(Data ?? "").trim();

      const errors = {};
      if (!Number.isFinite(returnsIdNum)) errors.ReturnsId = "رقم المرتجع غير صالح";
      if (!Number.isFinite(amountNum))    errors.Amount    = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStr) || !lenBetween(dataStr,1,2000)) errors.Data = "الوصف مطلوب (1–2000)";
      if (Object.keys(errors).length) return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });

      const elementUpdate = await SELECTTablecompanySubProjectReturnedObjectOne(returnsIdNum);
      if (!elementUpdate) return res.status(404).json({ success:"لم يتم العثور على السجل المطلوب", message:"لم يتم العثور على السجل المطلوب" });

      const oldImages = elementUpdate.Image ? (JSON.parse(elementUpdate.Image || "[]") || []) : [];
      let arrayImage = Array.isArray(oldImages) ? [...oldImages] : [];

      if (isNonEmpty(Imageolddelete)) {
        const toDel = Imageolddelete.split(",").map(s => s.trim()).filter(Boolean);
        await Promise.all(toDel.map(async pic => {
          arrayImage = arrayImage.filter(x => x !== pic);
          try { await DeleteBucket(pic); } catch (e) { console.warn("DeleteBucket failed:", pic, e); }
        }));
      }

      const files = collectFiles(req);
      for (const f of files) {
        const mime = String(f.mimetype || ""); const size = Number(f.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ success:`نوع ملف غير مدعوم: ${mime}`, message:`نوع ملف غير مدعوم: ${mime}` });
        if (size > MAX_SIZE)               return res.status(200).json({ success:`حجم ملف يتجاوز 15MB`, message:`حجم ملف يتجاوز 15MB` });
      }
      for (const f of files) {
        try {
          await uploaddata(f);
          deleteFileSingle(f.filename, "upload");
          const safeName = sanitizeFilename(f.filename || f.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } catch (e) { console.error("upload failed:", f?.filename, e); }
      }
      arrayImage = Array.from(new Set(arrayImage));

      await UPDATETablecompanySubProjectReturned([
        convertArabicToEnglish(esc(amountNum)),
        esc(dataStr),
        arrayImage.length ? JSON.stringify(arrayImage) : null,
        convertArabicToEnglish(esc(returnsIdNum)),
      ]);

      res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح" });
      try { await UpdaterateCost(elementUpdate?.projectID, "cost"); } catch {}
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل في تنفيذ العملية" });
    }
  };
};


const DeleteFinance = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeleteFinance"
      );
      const data = await SELECTTablecompany(userSession?.IDCompany);
      if (data.DisabledFinance === "true") {
        const { id, type } = req.query;
        let nametype;
        let typeid;
        if (type === "مصروفات") {
          nametype = "Expense";
          typeid = "Expenseid";
        } else if (type === "عهد") {
          nametype = "Revenue";
          typeid = "RevenueId";
        } else {
          nametype = "Returns";
          typeid = "ReturnsId";
        }
        const result = await SELECTTableFinance(id, nametype, typeid);
        let Images = Boolean(result.Image) ? JSON.parse(result.Image) : [];
        for (let index = 0; index < Images.length; index++) {
          const element = Images[index];
          await Switchbetweendeleteorupdatefiles(element, "", "delete");
        }
        await DeleteTablecompanySubProjectall(nametype, typeid, id);
        res.send({ success: "تم الحذف بنجاح" }).status(200);
        await UpdaterateCost(result?.projectID, "cost");
      } else {
        res
          .send({ success: "تم ايقاف الحذف اليدوي من قبل الادمن" })
          .status(200);
      }
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية" }).status(500);
      console.log(error);
    }
  };
};

// *******************************************************************
// ****************** تعديل بيانات الطلبيات ************************

// تعديل بيانات الطلبيات الرئيسية
// ========================= UPDATEdataRequests =========================
const UPDATEdataRequests = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UPDATEdataRequests"); } catch {}

      // 2) التقاط/تحقق المدخلات
      const { Type, Data, RequestsID, user, Imageolddelete } = req.body || {};
      const requestIdNum = parsePositiveInt(RequestsID);
      const typeStr = String(Type ?? "").trim();
      const dataStr = String(Data ?? "").trim();
      const userStr = String(user ?? userSession.userName ?? "").trim();

      const errors = {};
      if (!Number.isFinite(requestIdNum)) errors.RequestsID = "رقم الطلب غير صالح";
      if (!isNonEmpty(typeStr) || typeStr === "تصنيف الإضافة") errors.Type = "التصنيف غير صالح";
      if (!isNonEmpty(dataStr) || !lenBetween(dataStr, 1, 2000)) errors.Data = "نص الطلب مطلوب (1–2000)";
      if (!isNonEmpty(userStr) || !lenBetween(userStr, 2, 100)) errors.user = "اسم المستخدم (user) غير صالح";
      if (Object.keys(errors).length) {
        return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });
      }

      // 3) جلب السجل الحالي
      const elementUpdate = await SELECTDataAndTaketDonefromTableRequests(requestIdNum);
      if (!elementUpdate) {
        return res.status(404).json({ success:"لم يتم العثور على الطلب", message:"لم يتم العثور على الطلب" });
      }

      // 4) إدارة الصور القديمة/الجديدة
      const oldImages = elementUpdate.Image ? (JSON.parse(elementUpdate.Image || "[]") || []) : [];
      let arrayImage = Array.isArray(oldImages) ? [...oldImages] : [];

      if (isNonEmpty(Imageolddelete)) {
        const toDel = Imageolddelete.split(",").map(s => s.trim()).filter(Boolean);
        await Promise.all(toDel.map(async pic => {
          arrayImage = arrayImage.filter(x => x !== pic);
          try { await DeleteBucket(pic); } catch (e) { console.warn("DeleteBucket failed:", pic, e); }
        }));
      }

      const files = collectFiles(req);
      for (const f of files) {
        const mime = String(f.mimetype || ""); const size = Number(f.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ success:`نوع ملف غير مدعوم: ${mime}`, message:`نوع ملف غير مدعوم: ${mime}` });
        if (size > MAX_SIZE)               return res.status(200).json({ success:`حجم ملف يتجاوز 15MB`, message:`حجم ملف يتجاوز 15MB` });
      }
      for (const f of files) {
        try {
          await uploaddata(f);
          deleteFileSingle(f.filename, "upload");
          const safeName = sanitizeFilename(f.filename || f.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } catch (e) { console.error("upload failed:", f?.filename, e); }
      }
      arrayImage = Array.from(new Set(arrayImage)); // إزالة التكرار

      // 5) التحديث
      await UPDATETableinRequests([
        esc(typeStr),
        esc(dataStr),
        esc(userStr),
        arrayImage.length ? JSON.stringify(arrayImage) : null,
        convertArabicToEnglish(esc(requestIdNum)),
      ]);

      // 6) الرد + إشعار
      res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح" });
      try {
        await Financeinsertnotification(0, "طلب", "تعديل", userSession.userName, requestIdNum);
      } catch {}
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:"فشل في تنفيذ العملية", message:"فشل في تنفيذ العملية" });
    }
  };
};

// ========================= UPDATEImplementRquestsORCansle =========================
const UPDATEImplementRquestsORCansle = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UPDATEImplementRquestsORCansle"); } catch {}

      // 2) المدخلات
      const { user, RequestsID } = req.body || {};
      const userStr = String(user ?? userSession.userName ?? "").trim();
      const requestIdNum = parsePositiveInt(RequestsID);

      const errors = {};
      if (!Number.isFinite(requestIdNum)) errors.RequestsID = "رقم الطلب غير صالح";
      if (!isNonEmpty(userStr) || !lenBetween(userStr, 2, 100)) errors.user = "اسم المستخدم غير صالح";
      if (Object.keys(errors).length) {
        return res.status(200).json({ success:"أخطاء في التحقق من المدخلات", message:"أخطاء في التحقق من المدخلات", errors });
      }

      // 3) جلب السجل
      const row = await SELECTDataAndTaketDonefromTableRequests(requestIdNum);
      if (!row) return res.status(404).json({ success:"لم يتم العثور على الطلب", message:"لم يتم العثور على الطلب" });

      // 4) تبديل الحالة Done
      const currentDone = String(row.Done || "").toLowerCase() === "true";
      const toggled = currentDone ? "false" : "true";

      // 5) تحديث
      await UPDATETableinRequestsDone([
        esc(toggled),
        esc(userStr),
        convertArabicToEnglish(esc(requestIdNum))
      ]);

      return res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح", data: { Done: toggled } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:"فشل في تنفيذ العملية", message:"فشل في تنفيذ العملية" });
    }
  };
};

// ========================= Confirmarrivdrequest =========================
const Confirmarrivdrequest = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success:false, message:"Invalid session" });
      }
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "Confirmarrivdrequest"); } catch {}

      // 2) المدخلات (من query)
      const requestIdNum = parsePositiveInt(req.query?.RequestsID);
      if (!Number.isFinite(requestIdNum)) {
        return res.status(200).json({ success:"رقم الطلب غير صالح", message:"رقم الطلب غير صالح" });
      }

      // 3) جلب السجل
      const row = await SELECTDataAndTaketDonefromTableRequests(requestIdNum);
      if (!row) return res.status(404).json({ success:"لم يتم العثور على الطلب", message:"لم يتم العثور على الطلب" });

      // 4) تبديل checkorderout
      const current = String(row.checkorderout || "").toLowerCase() === "true";
      const toggled = current ? "false" : "true";

      // 5) تحديث (ملاحظة: تصحيح الوسيط الثاني، لا نستخدم تعبير إسناد داخل الاستدعاء)
      await UPDATETableinRequestsDone(
        [esc(toggled), convertArabicToEnglish(esc(requestIdNum))],
        "checkorderout=?"
      );

      return res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح", data: { checkorderout: toggled } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل في تنفيذ العملية" });
    }
  };
};


const DeleteRequests = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeleteRequests"
      );
      const RequestsID = req.query.RequestsID;
      await DeleteTablecompanySubProjectall(
        "Requests",
        "RequestsID",
        RequestsID
      );
      res.send({ success: "تم تنفيذ العملية بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(501);
    }
  };
};

module.exports = {
  UpdataDataProject,
  RearrangeStage,
  UpdateStartdate,
  UpdateNotesStage,
  UpdateDataStage,
  UpdateNameFolderOrfileinArchive,
  ExpenseUpdate,
  RevenuesUpdate,
  ReturnsUpdate,
  UPDATEdataRequests,
  UPDATEImplementRquestsORCansle,
  DeletProjectwithDependencies,
  DeleteFinance,
  CloseOROpenProject,
  DeleteStageHome,
  DeleteStageSub,
  UpdateDataStageSub,
  Confirmarrivdrequest,
  DeleteRequests,
  RearrangeStageID,
  Switchbetweendeleteorupdatefiles,
  opreationDeletProject,
  UpdaterateCost,
  UpdaterateStage,
  UpdateDataStageSubv2,
};
