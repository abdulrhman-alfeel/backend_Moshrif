const {
  insertTablecompanySubProjectStageCUST,
  insertTablecompanySubProjectStagesSub,
  insertTablecompanySubProjectStageNotes,
  insertTablecompanySubProjectexpense,
  insertTablecompanySubProjectREVENUE,
  insertTablecompanySubProjectReturned,
  insertTablecompanySubProjectarchivesFolder,
  insertTablecompanySubProjectarchivesFolderforcreatproject,
  insertTablecompanySubProjectRequestsForcreatOrder,
  insertTablecompanySubProjectv2,
  insertTablecompanySubProjectStagesSubv2,
  insertTableStageCUST_IMAGE,
} = require("../../../../sql/INsertteble");
const {
  SELECTTablecompanySubProjectarchivesotherroad,
  SELECTTablecompanySubProjectStageCUSTAccordingEndDateandStageIDandStartDate,
  SELECTTablecompanySubProjectStageCUST,
  SELECTTablecompanySubProjectStagesSub,
  SELECTTablecompanySubProjectStagesSubSingl,
  SELECTTablecompanySubProjectStageCUSTONe,
  SELECTTablecompanySubProjectexpenseObjectOne,
  SELECTFROMTablecompanysubprojectStageTemplet,
  SELECTFROMTablecompanysubprojectStagesubTeplet,
} = require("../../../../sql/selected/selected");
const { uploaddata, bucket } = require("../../../../bucketClooud");

const {
  UPDATETablecompanySubProjectStagesSub,
  UPDATEStopeProjectStageCUST,
  UPDATETablecompanySubProjectarchivesFolderinChildern,
} = require("../../../../sql/update");

const {
  PercentagecalculationforSTage,
} = require("../select/bringProject");
const {
  Delayinsert,
  Stageinsert,
  StageSubinsert,
  AchievmentStageSubNote,
  CloseOROpenStagenotifcation,
  Financeinsertnotification,
  StageSubNote,
} = require("../../notifications/NotifcationProject");
const {
  deleteFileSingle,
  implmentOpreationSingle,
} = require("../../../../middleware/Fsfile");
const { UpdaterateCost, UpdaterateStage } = require("./UpdateProject");
const { Stage, AccountDays, isNonEmpty, convertArabicToEnglish, isValidUrl, parsePositiveInt,  parseRatio,
  onlyDateISO, 
  esc,
  sanitizeFilename,
  lenBetween,
  isMeaningfulNote,
  normalizeIds,
  collectFiles,
  tryParseDateISO,
  parseAmount,
  sanitizeFolderName,
  sanitizeName,
  collectSingleFile,
  parseNonNegativeFloat,
  parseNonNegativeInt
} = require("../../../../middleware/Aid");

const { sendNote } = require("../../chat/ChatJobsClass");
const { chack_company_subscription, project_subscription } = require("../../subscriptions/opreationSubscripation");






// ========= Helpers: تطبيع/تحقق (بدون مكتبات) =========



// ========= منطق الإدخال للمشروع (كما في كودك) مع تحسينات =========
const OpreationProjectInsertv2 = async (
  IDcompanySub,
  Nameproject,
  Note,
  TypeOFContract,
  GuardNumber,
  LocationProject,
  numberBuilding,
  Referencenumber,
  Contractsigningdate,
  Cost_per_Square_Meter,
  Project_Space,
  IDCompany
) => {
  // 1) تطبيع/تحقق المعطيات
  const errors = {};
  const subId   = parsePositiveInt(IDcompanySub);
  const bCount  = parsePositiveInt(numberBuilding);
  const guards  = GuardNumber === undefined || GuardNumber === null || String(GuardNumber) === ""
                  ? null : parsePositiveInt(GuardNumber);
  const costSqm = parseNonNegativeFloat(Cost_per_Square_Meter);
  const space   = parseNonNegativeFloat(Project_Space);

  const name    = String(Nameproject ?? "").trim();
  const type    = String(TypeOFContract ?? "").trim();
  const note    = String(Note ?? "").trim();
  const refNo   = String(Referencenumber ?? "").trim();
  const locUrl  = isNonEmpty(LocationProject) && isValidUrl(LocationProject) ? String(LocationProject).trim() : null;
  const signAt  = Contractsigningdate instanceof Date && !isNaN(+Contractsigningdate)
                  ? Contractsigningdate : new Date();

  if (!Number.isFinite(subId)) errors.IDcompanySub = "معرّف الفرع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
  if (!isNonEmpty(name) || name.length < 2) errors.Nameproject = "اسم المشروع مطلوب (حد أدنى حرفان)";
  if (!isNonEmpty(type)) errors.TypeOFContract = "نوع العقد مطلوب";
  if (!Number.isFinite(bCount)) errors.numberBuilding = "عدد المباني يجب أن يكون رقماً صحيحاً موجباً";
  if (!Number.isFinite(costSqm)) errors.Cost_per_Square_Meter = "سعر المتر يجب أن يكون رقماً ≥ 0";
  if (!Number.isFinite(space)) errors.Project_Space = "مساحة المشروع يجب أن تكون رقماً ≥ 0";
  if (locUrl === null && isNonEmpty(LocationProject)) errors.LocationProject = "الرابط غير صالح (يُقبل http/https)";
  // if (guards !== null && !Number.isFinite(guards)) errors.GuardNumber = "عدد الحرّاس (إن وُجد) يجب أن يكون رقماً صحيحاً موجباً";

  if (Object.keys(errors).length > 0) {
    const err = new Error("VALIDATION_ERROR");
    err.details = errors;
    throw err;
  }

  // 2) الإدخال في جدول المشاريع
  const idProject = await insertTablecompanySubProjectv2([
    convertArabicToEnglish(esc(subId)),
    esc(name),
    isNonEmpty(note) ? esc(note) : null,
    esc(type),
    guards !== null ? convertArabicToEnglish(esc(guards)) : null,
    locUrl ? esc(locUrl) : null,
    convertArabicToEnglish(esc(bCount)),
    isNonEmpty(refNo) ? esc(refNo) : null,
    costSqm,         // رقم
    space,           // رقم
  ]);

  if (!idProject) {
    const err = new Error("INSERT_FAILED");
    err.details = { message: "فشل إنشاء المشروع" };
    throw err;
  }

  // 3) تجهيز المراحل والقوالب إذا كان العقد ليس "حر"
  if (type !== "حر") {
    let dataStages = await SELECTFROMTablecompanysubprojectStageTemplet(type, IDCompany) || [];
    const visity   = await SELECTFROMTablecompanysubprojectStageTemplet("عام", IDCompany) || [];

    if (Array.isArray(visity) && visity.length > 0) {
      dataStages = [visity[0], ...dataStages];
    }

    const table = [];
    const tablesub = [];

    for (let i = 0; i < dataStages.length; i++) {
      const element = dataStages[i] || {};
      const daysRaw = Number(element.Days);
      const daysCalc = await AccountDays(bCount, Number.isFinite(daysRaw) ? daysRaw : 0);
      table.push({
        ...element,
        // Days: Math.round(daysCalc || 0),
        Days: daysCalc ,
        ProjectID: idProject,
        StartDate: null,
        EndDate: null,
        CloseDate: null,
        rate: 0,
        Referencenumber: element.StageIDtemplet, // كما في كودك
      });

      const resultSubTablet =
        await SELECTFROMTablecompanysubprojectStagesubTeplet(
          element.StageID,
          element.Stagestype_id,
          IDCompany
        ) || [];

      resultSubTablet.forEach((pic) => {
        tablesub.push({
          StageID: pic.StageID,
          ProjectID: idProject,
          StageSubName: pic.StageSubName,
          attached: pic.attached || null,
          Referencenumber: pic.StageSubID,
        });
      });
    }

    // إنشاء المراحل
    await Stage(table, signAt);
    await StageSub(tablesub);
  }

  // 4) إنشاء المجلدات الثابتة للأرشيف
  await AddFoldersStatcforprojectinsectionArchive(idProject);

  return idProject;
};

// ========= معالج HTTP: إنشاء مشروع للفرع مع التحقق =========
const projectBrinshv2 = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 0) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 1) التقاط القيم
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
        company_subscriptions_id = 0
      } = req.body || {};
      // const chack_company = await chack_company_subscription(company_subscriptions_id);

      // if (!chack_company) {
      //   return res.status(200).send({
      //     success:  "الاشتراك غير صالح",
      //     message: "الاشتراك غير صالح",
      //   });
      // }

      // 2) تحقق أولي سريع (حتى لا نرمي على الدالة الداخلية مباشرة)
      const prelimErrors = {};
      if (!isNonEmpty(Nameproject)) prelimErrors.Nameproject = "اسم المشروع مطلوب";
      if (!isNonEmpty(TypeOFContract)) prelimErrors.TypeOFContract = "نوع العقد مطلوب";
      if (!isNonEmpty(IDcompanySub)) prelimErrors.IDcompanySub = "معرّف الفرع مطلوب";
      if (!isNonEmpty(numberBuilding)) prelimErrors.numberBuilding = "عدد المباني مطلوب";
      if (!isNonEmpty(Cost_per_Square_Meter)) prelimErrors.Cost_per_Square_Meter = "سعر المتر مطلوب";
      if (!isNonEmpty(Project_Space)) prelimErrors.Project_Space = "مساحة المشروع مطلوبة";

      if (Object.keys(prelimErrors).length > 0) {
        return res.status(200).send({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors: prelimErrors,
        });
      }

      const Contractsigningdate = new Date();

      // 3) استدعاء العملية الأساسية بعد أن نمرر كل شيء كما هو (ستتحقق داخلياً بشكل صارم)
      const idProject = await OpreationProjectInsertv2(
        IDcompanySub,
        Nameproject,
        Note,
        TypeOFContract,
        GuardNumber,
        LocationProject,
        numberBuilding,
        Referencenumber,
        Contractsigningdate,
        Cost_per_Square_Meter,
        Project_Space,
        userSession.IDCompany
      );
      // await project_subscription(idProject, company_subscriptions_id);

      // 5) رد النجاح
      return res.status(200).send({
        success: true,
        message: "تم إنشاء مشروع بنجاح",
        idProject,
      });

    } catch (err) {
      console.log(err.message);
      if (err && err.message === "VALIDATION_ERROR") {
        return res.status(200).send({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors: err.details || {},
        });
      }
      console.error("projectBrinshv2 error:", err);
      return res.status(500).send({
        success:  "فشل تنفيذ العملية",
        message: "فشل تنفيذ العملية",
      });
    }
  };
};


// وظيفة انشاء ملفات ثابته للمشروع في قسم الارشيف
const AddFoldersStatcforprojectinsectionArchive = (idproject) => {
  try {
    const arrayfolder = [
      {
        name: "العقود والضمانات",
        ActivationHome: "false",
        Activationchildren: "true",
      },
      {
        name: "الفواتير والسندات",
        ActivationHome: "false",
        Activationchildren: "false",
      },
      {
        name: "المخططات",
        ActivationHome: "false",
        Activationchildren: "true",
      },
      {
        name: "المراحل",
        ActivationHome: "false",
        Activationchildren: "false",
      },
      {
        name: "العهد",
        ActivationHome: "false",
        Activationchildren: "false",
      },
      {
        name: "المرتجعات",
        ActivationHome: "false",
        Activationchildren: "false",
      },
    ];
    arrayfolder.forEach(async (pic) => {
      await insertTablecompanySubProjectarchivesFolderforcreatproject([
        idproject,
        pic.name,
        pic.ActivationHome,
        pic.Activationchildren,
      ]);
    });
  } catch (error) {
    console.log(error);
  }
};

// وظيفة ادخال البيانات في جدوول المراحل  الرئيسي

// وظيف ادخال بييانات المراحلة الفرعية
const StageSub = async (teble) => {
  try {
    for (let index = 0; index < teble.length; index++) {
      const item = teble[index];

      await insertTablecompanySubProjectStagesSubv2([
        item.StageID,
        item.ProjectID,
        item.StageSubName,
        item.attached || null,
        item.Referencenumber,
      ]);
    }
  } catch (err) {
    console.log(err);
  }
};
// إضافة مرحلة جديدة إلى المشروع
const InsertStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // ✅ التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, error: "Invalid session" });
      }

      const { StageName, ProjectID, TypeOFContract, Days, Ratio, attached } = req.body || {};

      // ========== التحقق اليدوي للمدخلات ==========
      const errors = {};
      const projectIdNum = parsePositiveInt(ProjectID);
      const stageNameStr = String(StageName ?? "").trim();
      const daysNum      = Days === undefined || Days === null || Days === "" ? 0 : parseNonNegativeInt(Days);
      const ratioNum     = parseRatio(Ratio);

      if (!Number.isFinite(projectIdNum)) {
        errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      }
      if (!isNonEmpty(stageNameStr) || stageNameStr.length < 2) {
        errors.StageName = "اسم المرحلة مطلوب (حد أدنى حرفان)";
      }
      if (!Number.isFinite(daysNum)) {
        errors.Days = "عدد الأيام يجب أن يكون عدداً صحيحاً صفرياً أو موجباً";
      }
      if (!Number.isFinite(ratioNum) || ratioNum < 0) {
        errors.Ratio = "النسبة يجب أن تكون رقماً صفرياً أو موجباً";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors,
        });
      }

      // ✅ التحقق إذا كان الاسم موجود مسبقًا (حسّاس لحالة الأحرف؟ حسب دالتك)
      const existingStage = await SELECTTablecompanySubProjectStageCUST(
        projectIdNum,
        stageNameStr
      );
      if (Array.isArray(existingStage) && existingStage.length > 0) {
        return res.status(200).send({ success:  "اسم المرحلة موجود بالفعل" , error: "اسم المرحلة موجود بالفعل" });
      }

      // ✅ جلب بيانات آخر مرحلة/ملخص للمشروع
      // المتوقع: كائن يحتوي TotalRatio, EndDate, OrderBy, StageID (قد تكون null عند أول مرحلة)
      const summary =
        await SELECTTablecompanySubProjectStageCUSTAccordingEndDateandStageIDandStartDate(
          projectIdNum
        ) || {};

      const currentRatio = Number(summary.TotalRatio) || 0;
      const totalRatio   = currentRatio + ratioNum;
      if (totalRatio > 100) {
        return res.status(200).send({
          success:  "مجموع النسب لا يجب أن يتجاوز 100",
          error: "مجموع النسب لا يجب أن يتجاوز 100",
          details: { currentRatio, adding: ratioNum, totalRatio }
        });
      }

      // ✅ تجهيز التواريخ والترتيب
      const lastEnd = summary.EndDate ? new Date(summary.EndDate) : new Date(); // عند عدم وجود مراحل سابقة
      const startDate = onlyDateISO(lastEnd) || onlyDateISO(new Date());
      const endCalc = new Date(lastEnd);
      endCalc.setDate(endCalc.getDate() + daysNum);
      const endDate = onlyDateISO(endCalc) || startDate;

      const orderBy = summary.OrderBy == null ? 1 : (parseInt(summary.OrderBy, 10) + 1);
      const nextStageId = summary.StageID == null ? 1 : (Number(summary.StageID) + 1);

      // ✅ إدخال المرحلة الجديدة
      await insertTablecompanySubProjectStageCUST([
        nextStageId,
        projectIdNum,
        String(TypeOFContract ?? "").trim() || null,
        `${stageNameStr} (${orderBy})`,   // الاحتفاظ بمنطقك بإضافة رقم الترتيب
        daysNum,
        startDate,
        endDate,
        orderBy,
        ratioNum,
        attached ?? null,
        0, // rate
      ]);

      // ✅ تحديث التكلفة وإشعار (لا نفشل العملية لو أخفق الإشعار)
      try {
        await UpdaterateCost(projectIdNum);
      } catch (e) {
        console.warn("UpdaterateCost failed:", e);
      }
      try {
        await Stageinsert(projectIdNum, 0, userSession.userName);
      } catch (e) {
        console.warn("Stageinsert failed:", e);
      }

      return res.status(200).send({ success: "تمت إضافة المرحلة بنجاح" , message: "تمت إضافة المرحلة بنجاح" });
    } catch (error) {
      console.error("InsertStage error:", error);
      return res.status(500).json({ success:  "حدث خطأ أثناء إضافة المرحلة", error: "حدث خطأ أثناء إضافة المرحلة" });
    }
  };
};

//  إضافة مرحلة فرعية جديدة

const insertStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط وتطبيع المدخلات
      const { StageID, ProjectID, StageSubName } = req.body || {};
      const stageIdNum   = StageID;
      const projectIdNum = parsePositiveInt(ProjectID);
      const subNameStr   = String(StageSubName ?? "").trim();

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(stageIdNum))   errors.StageID   = "رقم المرحلة مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(subNameStr) || subNameStr.length < 2 || subNameStr.length > 120) {
        errors.StageSubName = "اسم الخطوة مطلوب (2 إلى 120 حرف)";
      }
      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) تحقق من عدم تكرار اسم الخطوة داخل نفس المشروع/المرحلة
      const existing = await SELECTTablecompanySubProjectStagesSub(
        projectIdNum,
        stageIdNum,
        subNameStr
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(200).send({ success:  "اسم الخطوة موجود بالفعل", message: "اسم الخطوة موجود بالفعل" });
      }

      // 5) إدخال الخطوة الفرعية
      await insertTablecompanySubProjectStagesSub([
        convertArabicToEnglish(esc(stageIdNum)),
        convertArabicToEnglish(esc(projectIdNum)),
        esc(subNameStr),
        null, // attached
      ]);

      // 6) تحديثات لاحقة (لا نفشل العملية لو أخفقت)
      try {
        await UpdaterateCost(projectIdNum);
      } catch (e) {
        console.warn("UpdaterateCost failed:", e);
      }
      try {
        await UpdaterateStage(projectIdNum, stageIdNum);
      } catch (e) {
        console.warn("UpdaterateStage failed:", e);
      }
      try {
        await StageSubinsert(projectIdNum, stageIdNum, userSession.userName);
      } catch (e) {
        console.warn("StageSubinsert failed:", e);
      }

      // 7) رد النجاح
      return res.status(200).send({
        success:  "تمت إضافة الخطوة بنجاح",
        message: "تمت إضافة الخطوة بنجاح",
        data: { ProjectID: projectIdNum, StageID: stageIdNum, StageSubName: subNameStr }
      });

    } catch (error) {
      console.error("insertStageSub error:", error);
      return res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة الخطوة" });
    }
  };
};



const insertStageSubv2 = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط وتطبيع المدخلات
      const { StageID, ProjectID, StageSubName } = req.body || {};
      const stageIdNum   = StageID;
      const projectIdNum = parsePositiveInt(ProjectID);
      const subNameStr   = String(StageSubName ?? "").trim();

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(stageIdNum))   errors.StageID   = "رقم المرحلة مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(subNameStr) || subNameStr.length < 2 || subNameStr.length > 120) {
        errors.StageSubName = "اسم الخطوة مطلوب (2 إلى 120 حرف)";
      }

      // تحضير الملف (اختياري)
      const file = req.file || (Array.isArray(req.files) && req.files[0]) || null;
      let attachedName = null;
      if (file) {
        const mime = String(file.mimetype || "");
        const size = Number(file.size || 0);
        const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf"];
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (!allowed.includes(mime)) errors.attached = "نوع الملف غير مدعوم (يُقبل PDF/صور)";
        if (size > maxSize) errors.attached = "حجم الملف يتجاوز 15MB";
        attachedName = String(file.filename || file.originalname || "").replace(/[\\\/]+/g, "");
        if (!isNonEmpty(attachedName)) errors.attached = "اسم الملف غير صالح";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success:"أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) منع التكرار داخل نفس المشروع/المرحلة
      const existing = await SELECTTablecompanySubProjectStagesSub(
        projectIdNum,
        stageIdNum,
        subNameStr
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(200).send({ success:"اسم الخطوة موجود بالفعل",  message:"اسم الخطوة موجود بالفعل" });
      }

      // 5) الإدراج في قاعدة البيانات أولاً
      await insertTablecompanySubProjectStagesSub([
        convertArabicToEnglish(esc(stageIdNum)),
        convertArabicToEnglish(esc(projectIdNum)),
        esc(subNameStr),
        attachedName ? esc(attachedName) : null,
      ]);

      // 6) رفع الملف (إن وجد) وتسجيل العملية — لا نفشل العملية لو أخفق الرفع
      if (file && attachedName) {
        try {
          await uploaddata(file);
          try { await implmentOpreationSingle("upload", attachedName); }
          catch (opErr) { console.warn("implmentOpreationSingle failed:", opErr); }
        } catch (upErr) {
          console.warn("File upload failed:", upErr);
          // ملاحظة: يمكن لاحقاً إضافة منطق لتعديل السجل وإزالة المرفق عند فشل الرفع إن توفرت دالة تحديث.
        }
      }

      // 7) تحديثات لاحقة (غير حرجة)
      try { await UpdaterateCost(projectIdNum); } catch (e) { console.warn("UpdaterateCost failed:", e); }
      try { await UpdaterateStage(projectIdNum, stageIdNum); } catch (e) { console.warn("UpdaterateStage failed:", e); }
      try { await StageSubinsert(projectIdNum, stageIdNum, userSession.userName); } catch (e) { console.warn("StageSubinsert failed:", e); }

      // 8) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: { ProjectID: projectIdNum, StageID: stageIdNum, StageSubName: subNameStr, attached: attachedName || null }
      });

    } catch (error) {
      console.error("insertStageSubv2 error:", error);
      return res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة الخطوة" });
    }
  };
};


// ===== Helpers: تطبيع/تحقق (بدون مكتبات) =====


const insertStageCustImage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) المدخلات
      const { StageID, ProjectID } = req.body || {};
      const stageIdNum   = StageID;
      const projectIdNum = parsePositiveInt(ProjectID);

      const errors = {};
      if (!isNonEmpty(stageIdNum))   errors.StageID = "معرف المرحلة غير موجود";
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";

      // 3) الملف (مطلوب صورة)
      const file = req.file || (Array.isArray(req.files) && req.files[0]) || null;
      if (!file) errors.file = "الصورة مطلوبة";
      else {
        const mime = String(file.mimetype || "");
        const size = Number(file.size || 0);
        const allowed = ["image/png","image/jpeg","image/jpg","image/webp","image/gif"];
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (!allowed.includes(mime)) errors.file = "نوع الملف غير مدعوم (المدعوم: PNG/JPEG/WEBP/GIF)";
        if (size > maxSize) errors.file = "حجم الملف يتجاوز 15MB";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) تحضير اسم الملف الآمن
      const attachedName = sanitizeFilename(file.filename || file.originalname);
      if (!isNonEmpty(attachedName)) {
        return res.status(200).send({ success: "اسم الملف غير صالح", message: "اسم الملف غير صالح" });
      }

      // 5) رفع الملف أولاً (لضمان الاتساق)، ثم حذف المؤقت
      try {
        await uploaddata(file); // يفترض ينقل من مجلد مؤقت إلى التخزين النهائي
      } catch (upErr) {
        console.error("uploaddata failed:", upErr);
        return res.status(200).send({ success:  "فشل رفع الملف", message: "فشل رفع الملف" });
      } finally {
        try { deleteFileSingle(attachedName, "upload"); } catch (e) { /* اختياري */ }
      }

      // 6) إدراج السجل في قاعدة البيانات
      await insertTableStageCUST_IMAGE([
        convertArabicToEnglish(esc(stageIdNum)),
        convertArabicToEnglish(esc(projectIdNum)),
        esc(attachedName),
        esc(String(userSession.PhoneNumber ?? "")),
      ]);

      // 7) نجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: { ProjectID: projectIdNum, StageID: stageIdNum, attached: attachedName }
      });

    } catch (error) {
      console.error("insertStageCustImage error:", error);
      return res.status(500).json({ success: false, message: "حدث خطأ أثناء رفع الصورة وإدراجها" });
    }
  };
};


// وظيفة ادخال ملاحظات المرحلة الرئيسية
const NotesStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط وتطبيع المدخلات
      const {
        StagHOMID,     // كما هي في كودك
        ProjectID,
        Type,
        Note,
        RecordedBy,
        countdayDelay
      } = (req.body || {});

      const stageHomeId  = parsePositiveInt(StagHOMID);
      const projectIdNum = parsePositiveInt(ProjectID);
      const typeStr      = String(Type ?? "").trim();
      const noteStr      = String(Note ?? "").trim();
      const recordedByStr= String(RecordedBy ?? userSession.userName ?? userSession.PhoneNumber ?? "").trim();
      const delayCount   = (countdayDelay === undefined || countdayDelay === null || countdayDelay === "")
        ? 0
        : parseNonNegativeInt(countdayDelay);

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(stageHomeId))  errors.StagHOMID = "رقم المرحلة مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(typeStr) || !lenBetween(typeStr, 1, 50)) {
        errors.Type = "نوع الملاحظة مطلوب (حتى 50 حرفاً)";
      }
      if (!isNonEmpty(noteStr) || !lenBetween(noteStr, 1, 2000)) {
        errors.Note = "نص الملاحظة مطلوب (1 إلى 2000 حرف)";
      }
      if (!isNonEmpty(recordedByStr) || !lenBetween(recordedByStr, 2, 100)) {
        errors.RecordedBy = "اسم المُسجِّل مطلوب";
      }
      if (!Number.isFinite(delayCount)) {
        errors.countdayDelay = "عدد أيام التأخير يجب أن يكون عدداً صحيحاً صفرياً أو موجباً";
      }

      // 4) فحص المرفق (اختياري)
      const file = req.file || (Array.isArray(req.files) && req.files[0]) || null;
      let attachedName = null;
      if (file) {
        const mime = String(file.mimetype || "");
        const size = Number(file.size || 0);
        const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf","image/gif"];
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (!allowed.includes(mime)) errors.ImageAttachment = "نوع الملف غير مدعوم (يُقبل صور/PDF)";
        if (size > maxSize) errors.ImageAttachment = "حجم الملف يتجاوز 15MB";
        attachedName = sanitizeFilename(file.filename || file.originalname);
        if (!isNonEmpty(attachedName)) errors.ImageAttachment = "اسم الملف غير صالح";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) رفع الملف (إن وجد) قبل الإدراج لضمان الاتساق
      if (file && attachedName) {
        try {
          await uploaddata(file);
        } catch (upErr) {
          console.error("uploaddata failed:", upErr);
          return res.status(200).send({ success: "فشل رفع المرفق" , message: "فشل رفع المرفق" });
        } finally {
          try { deleteFileSingle(attachedName, "upload"); } catch { /* اختياري */ }
        }
      }

      // 6) الإدراج في قاعدة البيانات
      await insertTablecompanySubProjectStageNotes([
        convertArabicToEnglish(esc(stageHomeId)),
        convertArabicToEnglish(esc(projectIdNum)),
        esc(typeStr),
        esc(noteStr),
        esc(recordedByStr),
        delayCount,
        attachedName ? esc(attachedName) : null,
      ]);

      // 7) إجراءات لاحقة غير حرجة
      try { await Delayinsert(projectIdNum, stageHomeId, userSession.userName); }
      catch (e) { console.warn("Delayinsert failed:", e); }

      // 8) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: {
          ProjectID: projectIdNum,
          StagHOMID: stageHomeId,
          Type: typeStr,
          countdayDelay: delayCount,
          ImageAttachment: attachedName || null,
        }
      });

    } catch (err) {
      console.error("NotesStage error:", err);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


// وظيفة تجمع بين اضافة وتعديل ملاحظات فرعية
const NotesStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط المدخلات
      const {
        StageSubID,
        Note,
        type,          // "AddNote" | "EditNote" | "DeletNote"
        idNote,        // مطلوب في Edit/Delete
        Imageolddelete // اختياري في Edit
      } = req.body || {};

      const stageSubIdNum = parsePositiveInt(StageSubID);
      const idNoteNum     = idNote !== undefined && idNote !== null && String(idNote) !== ""
                              ? parsePositiveInt(idNote)
                              : NaN;

      // 3) تحقق يدوي أساسي
      const errors = {};
      if (!Number.isFinite(stageSubIdNum)) errors.StageSubID = "معرّف الخطوة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      const allowedTypes = new Set(["AddNote", "EditNote", "DeletNote"]);
      if (!allowedTypes.has(String(type))) errors.type = "نوع العملية غير صالح (يجب أن يكون AddNote أو EditNote أو DeletNote)";

      if (type === "AddNote" && !isMeaningfulNote(Note)) {
        errors.Note = "نص الملاحظة مطلوب لإضافة ملاحظة";
      }
      if ((type === "EditNote" || type === "DeletNote") && !Number.isFinite(idNoteNum)) {
        errors.idNote = "المعرّف الداخلي للملاحظة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      }
      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) جلب سجل الخطوة الفرعية للتعامل معه
      const bringData = await SELECTTablecompanySubProjectStagesSubSingl(stageSubIdNum);
      if (!bringData) {
        return res.status(200).send({ success:  "لم يتم العثور على الخطوة المطلوبة", message: "لم يتم العثور على الخطوة المطلوبة" });
      }

      // 5) تنفيذ العملية حسب النوع
      const userName    = userSession.userName;
      const PhoneNumber = userSession.PhoneNumber;
      let NoteArry;
      let kind = "Note";

      if (type === "AddNote") {
        // (ملفات مرفقة اختيارياً عبر req.files — نمررها كما هي إلى دالتك)
        NoteArry = await AddNote(Note, userName, PhoneNumber, bringData, req.files);
      } else if (type === "EditNote") {
        NoteArry = await EditNote(
          idNoteNum,
          Note,                 // يمكن أن يكون فارغاً حسب منطقك الداخلي؛ هنا نمرره كما هو
          userName,
          PhoneNumber,
          bringData,
          Imageolddelete,       // اسم/قائمة الصور القديمة المطلوب حذفها - حسب منطقك
          req.files
        );
      } else if (type === "DeletNote") {
        const dataNote = Array.isArray(bringData?.Note)
          ? bringData.Note
          : (isNonEmpty(bringData?.Note) ? JSON.parse(bringData.Note) : []);
        NoteArry = dataNote.filter(item => parseInt(item.id) !== parseInt(idNoteNum));
      }

      // 6) حفظ النتيجة في قاعدة البيانات
      if (NoteArry !== undefined) {
        await UPDATETablecompanySubProjectStagesSub(
          [JSON.stringify(NoteArry), stageSubIdNum],
          kind
        );
      } else {
        return res.status(200).send({ success:  "فشل تجهيز بيانات الملاحظة", message: "فشل تجهيز بيانات الملاحظة" });
      }

      // 7) (اختياري) سجلّ عمليات/إشعارات — لا نفشل العملية لو أخفق
      try {
        await StageSubNote(
          bringData.ProjectID,
          bringData.StagHOMID,
          stageSubIdNum,
          Note,
          userSession.userName,
          type === "AddNote" ? "اضاف" : (type === "EditNote" ? "تعديل" : "حذف")
        );
      } catch (logErr) { console.warn("StageSubNote failed:", logErr); }

      // 8) رد النجاح (201 للإضافة، 200 للتعديل/الحذف)
      const isCreated = type === "AddNote";
      const message =  isCreated ? "تمت إضافة الملاحظة بنجاح" :
                 (type === "EditNote" ? "تم تعديل الملاحظة بنجاح" : "تم حذف الملاحظة بنجاح")

      return res.status(200).send({
        success: message,
        message:message      });

    } catch (error) {
      console.error("NotesStageSub error:", error);
      return res.status(500).json({ success: false, message: "فشل تنفيذ العملية" });
    }
  };
};


// وظيفة ادخال ملاحظات المرحلة الفرعية
const AddNote = async (Note, userName, PhoneNumber, bringData, files) => {
  try {
    let arrayImage = [];
    if (files && files.length > 0) {
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        await uploaddata(element);
        deleteFileSingle(element.filename, "upload");

        arrayImage.push(element.filename);
      }
    } else {
      arrayImage = null;
    }

    let NoteArry;
    const data = {
      id: Math.floor(1000 + Math.random() * 9000),
      Note: Note,
      userName: userName,
      PhoneNumber: PhoneNumber,
      Date: new Date().toDateString(),
      File: arrayImage,
    };

    if (bringData.Note !== null) {
      NoteArry = JSON.parse(bringData.Note);
      NoteArry?.push(data);
    } else {
      NoteArry = [data];
    }
    return NoteArry;
  } catch (error) {
    console.log(error);
  }
};
// وظيفة تعديل ملاحظات المرحلة الفرعية
const EditNote = async (
  id,
  Note,
  userName,
  PhoneNumber,
  bringData,
  Imageolddelete,
  files
) => {
  try {
    const dataNote = JSON.parse(bringData.Note) || [];
    let newDtat = [...dataNote];
    // console.log(dataNote);
    const findNote = newDtat.find((item) => parseInt(item.id) === parseInt(id));
    if (findNote) {
      let arrayImage = findNote?.File !== null ? [...findNote?.File] : [];

      if (arrayImage.length > 0 && String(Imageolddelete).length > 0) {
        const imageDelete = Imageolddelete ? Imageolddelete.split(",") : [];

        await Promise.all(
          imageDelete.map(async (pic) => {
            arrayImage = arrayImage.filter((items) => items !== pic);
            try {
              const findimat = await bucket.file(pic).exists();
              if (findimat[0]) {
                await bucket.file(pic).delete();
              }
            } catch (error) {
              console.log(error);
            }
          })
        );
      }
      if (files && files.length > 0) {
        for (let index = 0; index < files.length; index++) {
          const element = files[index];
          await uploaddata(element);
          deleteFileSingle(element.filename, "upload");

          arrayImage.push(element.filename);
        }
      }

      // console.log(findNote, "arrays", Imageolddelete);

      const data = {
        id: id,
        Note: Note,
        userName: userName,
        PhoneNumber: PhoneNumber,
        Date: new Date().toDateString(),
        File: arrayImage,
      };

      const findIndex = newDtat.findIndex(
        (item) => parseInt(item.id) === parseInt(id)
      );

      if (findIndex > -1) {
        newDtat[findIndex] = data;
      }
    }

    return newDtat;
  } catch (error) {
    console.log(error);
  }
};
// AddORCanselAchievmentarrayall

// وظيفة تقوم باضافة الانجازات او إلغائها

// استيراد النسبئة المئوية للمشروع

const AddORCanselAchievment = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const stageSubIdNum = parsePositiveInt(req.body?.StageSubID);
      if (!Number.isFinite(stageSubIdNum)) {
        return res.status(200).send({
          success: "StageSubID غير صالح (يجب أن يكون رقماً صحيحاً موجباً)",
          message: "StageSubID غير صالح (يجب أن يكون رقماً صحيحاً موجباً)",
        });
      }

      // 3) جلب بيانات الخطوة الفرعية المستهدفة
      const bringData = await SELECTTablecompanySubProjectStagesSubSingl(stageSubIdNum);
      if (!bringData) {
        return res.status(200).send({
          success: "لم يتم العثور على الخطوة الفرعية المطلوبة",
          message: "لم يتم العثور على الخطوة الفرعية المطلوبة",
        });
      }

      // 4) تنفيذ العملية (إضافة/إلغاء الإنجاز حسب منطق دالتك)
      const userName = userSession.userName;
      const PhoneNumber = userSession.PhoneNumber;

      await opreationAddAchivevment(stageSubIdNum, userName, PhoneNumber, bringData);

      // 5) تحديثات لاحقة (لا تُسقط العملية إن فشلت)
      try { await UpdaterateCost(bringData.ProjectID); }
      catch (e) { console.warn("UpdaterateCost failed:", e); }

      try { await UpdaterateStage(bringData.ProjectID, bringData.StagHOMID); }
      catch (e) { console.warn("UpdaterateStage failed:", e); }

      // 6) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: {
          StageSubID: stageSubIdNum,
          ProjectID: bringData.ProjectID,
          StagHOMID: bringData.StagHOMID,
          by: userName,
        }
      });

    } catch (error) {
      console.error("AddORCanselAchievment error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


// const cansles = [1,2,3,4];
// const arrays =[1,4,5,3];
// console.log(cansles.filter(item => !arrays.includes(item)))
const AddORCanselAchievmentarrayall = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع القوائم
      const selectAllarray         = normalizeIds(req.body?.selectAllarray);        // المطلوب تفعيلها
      const selectAllarraycansle   = normalizeIds(req.body?.selectAllarraycansle);  // كانت مفعلة مسبقاً

      if (selectAllarray.length === 0 && selectAllarraycansle.length === 0) {
        return res.status(200).send({
          success: "لا توجد عناصر لمعالجتها",
          message: "لا توجد عناصر لمعالجتها",
          errors: { selectAllarray:"فارغة", selectAllarraycansle:"فارغة" }
        });
      }

      // 3) تحديد المُلغى: عناصر كانت موجودة سابقاً ولم تعد ضمن التحديد الحالي
      const addSet = new Set(selectAllarray);
      const cancelIds = selectAllarraycansle.filter(id => !addSet.has(id));
      const addIds    = selectAllarray;

      const userName    = userSession.userName;
      const PhoneNumber = userSession.PhoneNumber;

      // 4) تنفيذ: إلغاء أولاً ثم إضافة
      const results = { added: 0, canceled: 0, failed: 0, errors: [] };
      let refProjectID = null, refStagHOMID = null; // لتحديث النِّسب لاحقاً

      // helper لتنفيذ عملية على عنصر واحد
      const processOne = async (id, mode /* "cancel" | "add" */) => {
        try {
          const bringData = await SELECTTablecompanySubProjectStagesSubSingl(id);
          if (!bringData) {
            results.failed++;
            results.errors.push({ id, error: "لم يتم العثور على السجل" });
            return;
          }
          // حفظ مرجع مشروع/مرحلة لتحديث النِّسب بعد الدفعة
          if (refProjectID == null) {
            refProjectID = bringData.ProjectID;
            refStagHOMID = bringData.StagHOMID;
          }
          await opreationAddAchivevment(
            id,
            userName,
            PhoneNumber,
            bringData,
            mode === "add" ? "alladd" : undefined
          );
          if (mode === "add") results.added++; else results.canceled++;
        } catch (e) {
          results.failed++;
          results.errors.push({ id, error: String(e?.message || e) });
        }
      };

      for (const id of cancelIds) { await processOne(id, "cancel"); }
      for (const id of addIds)    { await processOne(id, "add"); }

      // 5) تحديثات لاحقة (لا تُسقط العملية الأساسية عند الفشل)
      if (refProjectID != null) {
        try { await UpdaterateCost(refProjectID); } catch (e) { /* تحذيري */ }
        try { await UpdaterateStage(refProjectID, refStagHOMID); } catch (e) { /* تحذيري */ }
      }

      // 6) الرد النهائي
      return res.status(200).json({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        summary: results
      });

    } catch (error) {
      console.error("AddORCanselAchievmentarrayall error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


const opreationAddAchivevment = async (
  StageSubID,
  userName,
  PhoneNumber,
  bringData,
  type = "single"
) => {
  try {
    let data = {
      id: Math.floor(1000 + Math.random() * 9000),
      userName: userName,
      PhoneNumber: PhoneNumber,
      Date: new Date().toDateString(),
    };

    if (type === "single") {
      await opreationpartoneAchivement(data, bringData, StageSubID, userName);
    } else {
      if (type === "alladd" && bringData.Done === "true") return;
      await opreationpartoneAchivement(data, bringData, StageSubID, userName);
    }
  } catch (error) {
    console.log(error);
  }
};

const opreationpartoneAchivement = async (
  data,
  bringData,
  StageSubID,
  userName
) => {
  let Done;
  let CloseDate;
  let Operations = [];
  let types;
  if (bringData?.Done === "true") {
    types = "إلغاء الانجاز";
    data = {
      ...data,
      type: types,
    };
    Done = "false";
    CloseDate = null;
  } else {
    (types = "تم الانجاز"),
      (data = {
        ...data,
        type: types,
      });
    Done = "true";
    CloseDate = new Date().toDateString();
  }

  Operations =
    bringData.closingoperations !== null
      ? JSON.parse(bringData.closingoperations)
      : [];
  Operations.push(data);
  await UPDATETablecompanySubProjectStagesSub(
    [JSON.stringify(Operations), CloseDate, Done, StageSubID],
    "Closingoperations"
  );
  await AchievmentStageSubNote(
    StageSubID,
    userName,
    types === "تم الانجاز" ? "إنجاز" : types
  );
};

//  إغلاق او التراجع عن اغلاق  المراحل
const ClassCloaseOROpenStage = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط وتطبيع المدخلات
      const { StageID, ProjectID } = req.body || {};
      const Note        = String(req.body?.Note ?? "").trim();
      const RecordedBy  = String(req.body?.RecordedBy ?? userSession.userName ?? "").trim();

      const stageIdNum   = StageID;
      const projectIdNum = parsePositiveInt(ProjectID);

      // 3) تحقق يدوي
      const errors = {};
      if (!isNonEmpty(stageIdNum))   errors.StageID = "معرف المرحلة غير موجود";
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) جلب بيانات المرحلة
      const bringData = await SELECTTablecompanySubProjectStageCUSTONe(projectIdNum, stageIdNum);
      if (!bringData) {
        return res.status(200).send({ success:  "لم يتم العثور على المرحلة المطلوبة", message: "لم يتم العثور على المرحلة المطلوبة" });
      }

      // 5) تحديد الحالة الحالية وإجراء الفتح/الإغلاق
      const doneStr = String(bringData.Done ?? "").toLowerCase(); // "true" | "false"
      const isCurrentlyDone = doneStr === "true";

      let message = "تمت العملية بنجاح";

      if (!isCurrentlyDone) {
        // إغلاق المرحلة: نطلب ملاحظة ومَن سجّل
        const closeErrors = {};
        if (!isNonEmpty(Note) || !lenBetween(Note, 1, 2000)) {
          closeErrors.Note = "الملاحظة مطلوبة عند الإغلاق (حتى 2000 حرف)";
        }
        if (!isNonEmpty(RecordedBy) || !lenBetween(RecordedBy, 2, 100)) {
          closeErrors.RecordedBy = "اسم المُسجِّل مطلوب عند الإغلاق";
        }

        if (Object.keys(closeErrors).length > 0) {
          return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors: closeErrors });
        }

        // محاولة الإغلاق
        const result = await CloaseOROpenStage(
          Note,
          RecordedBy,
          stageIdNum,
          projectIdNum
        );
        // دالتك ترجع "true" أو رسالة؛ نتبع نفس منطقك
        if (result !== "true") {
          message = result; // قد تكون رسالة تحذيرية/توضيحية من الدالة
        }
      } else {
        // فتح المرحلة من جديد
        await UPDATEStopeProjectStageCUST(
          [null, null, "false", isNonEmpty(Note) ? esc(Note) : null, isNonEmpty(RecordedBy) ? esc(RecordedBy) : null, stageIdNum, projectIdNum],
          "Opean" // كما في كودك الأصلي
        );
      }

      // 6) إشعار — لا نفشل العملية لو أخفق
      try {
        await CloseOROpenStagenotifcation(
          projectIdNum,
          stageIdNum,
          userSession.userName,
          !isCurrentlyDone ? "اغلاق" : "فتح"
        );
      } catch (e) {
        console.warn("CloseOROpenStagenotifcation failed:", e);
      }

      // 7) ردّ النجاح
      return res.status(200).json({ success: true, message });

    } catch (error) {
      console.error("ClassCloaseOROpenStage error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};

//  حساب فارق الايام والتاخيرات
const CloaseOROpenStage = async (Note, RecordedBy, StageID, ProjectID) => {
  try {
    const rate = await PercentagecalculationforSTage(StageID, ProjectID);
    // console.log(rate, "rate", StageID, ProjectID);

    if (rate === 100) {
      const dataStage = await SELECTTablecompanySubProjectStageCUSTONe(
        ProjectID,
        StageID
      );

      const date1 = new Date();
      const date2 = new Date(dataStage.EndDate);

      const diffInMs = date2.getTime() - date1.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 3600 * 24));
      await UPDATEStopeProjectStageCUST([
        date1,
        diffInDays,
        "true",
        Note,
        RecordedBy,
        StageID,
        ProjectID,
      ]);
      return "true";
    } else {
      return "لايمكن اغلاق المشروع قبل انهاء الانجاز";
    }
  } catch (error) {
    console.log(error);
  }
};






// ادخال بيانات المصروفات
const ExpenseInsert = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const { projectID, Amount, Data, ClassificationName } = req.body || {};
      const projectIdNum = parsePositiveInt(projectID);
      const amountNum    = parseAmount(Amount);
      const dataStrRaw   = String(Data ?? "").trim();
      const dataISO      = tryParseDateISO(dataStrRaw); // اختياري: إن نجح نخزن ISO
      const classStr     = String(ClassificationName ?? "").trim();
      const Taxable      = 15; // نسبة الضريبة (كما في كودك)

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.projectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!Number.isFinite(amountNum) || amountNum < 0) errors.Amount = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStrRaw)) errors.Data = "التاريخ/البيان مطلوب";
      if (isNonEmpty(dataStrRaw) && dataISO === null && dataStrRaw.length > 100) {
        errors.Data = "قيمة التاريخ/البيان غير صالحة أو طويلة جداً";
      }
      if (isNonEmpty(classStr) && !lenBetween(classStr, 2, 100)) {
        errors.ClassificationName = "التصنيف إن وُجد يجب أن يكون بين 2 و 100 حرف";
      }

      // فحص المرفقات (اختياري)
      const files = collectFiles(req);
      const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf"];
      const maxSize = 15 * 1024 * 1024; // 15MB
      for (const f of files) {
        const mime = String(f.mimetype || "");
        const size = Number(f.size || 0);
        if (!allowed.includes(mime)) {
          errors.files = "نوع ملف غير مدعوم (PDF/صور فقط)";
          break;
        }
        if (size > maxSize) {
          errors.files = "حجم أحد الملفات يتجاوز 15MB";
          break;
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: false, message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) جلب رقم الفاتورة التالي (آمن مع أشكال مختلفة من الاستعلام)
      const totaldataproject = await SELECTTablecompanySubProjectexpenseObjectOne(projectIdNum, "count");
      const baseCount =
        Number(totaldataproject?.InvoiceNo) ??
        Number(totaldataproject?.count) ??
        Number(totaldataproject?.["COUNT(*)"]);
      const InvoiceNo = Number.isFinite(baseCount) && baseCount >= 0 ? (Number(baseCount) + 1) : 1;

      // 5) رفع المرفقات (إن وجدت) قبل الإدراج لضمان الاتساق
      const arrayImage = [];
      for (const file of files) {
        try {
          await uploaddata(file); // نقل الملف للتخزين النهائي
          const safeName = sanitizeFilename(file.filename || file.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } finally {
          try { deleteFileSingle(file.filename, "upload"); } catch { /* اختياري */ }
        }
      }
      const imagesPayload = arrayImage.length ? JSON.stringify(arrayImage) : null;

      // 6) الإدراج في قاعدة البيانات
      await insertTablecompanySubProjectexpense([
        convertArabicToEnglish(esc(projectIdNum)),
        amountNum, // رقم
        dataISO || esc(dataStrRaw), // نخزن ISO إن أمكن، وإلا النص الأصلي
        isNonEmpty(classStr) ? esc(classStr) : null,
        imagesPayload,
        InvoiceNo,
        Taxable,
      ]);

      // 7) تحديثات/إشعارات غير حرجة (لا تُسقط العملية عند الفشل)
      try {
        await Financeinsertnotification(projectIdNum, "مصروفات", "إضافة", userSession.userName);
      } catch (e) { console.warn("Financeinsertnotification failed:", e); }
      try {
        await UpdaterateCost(projectIdNum, "cost");
      } catch (e) { console.warn("UpdaterateCost failed:", e); }

      // 8) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح"
      });

    } catch (err) {
      console.error("ExpenseInsert error:", err);
      return res.status(500).json({ success: false, message: "فشل تنفيذ العملية" });
    }
  };
};



// ادخال بييانات العهد
const RevenuesInsert = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const { projectID, Amount, Data, Bank } = req.body || {};
      const projectIdNum = parsePositiveInt(projectID);
      const amountNum    = parseAmount(Amount);
      const dataStrRaw   = String(Data ?? "").trim();
      const dataISO      = tryParseDateISO(dataStrRaw); // نخزن ISO إن أمكن
      const bankStr      = String(Bank ?? "").trim();

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.projectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!Number.isFinite(amountNum) || amountNum < 0) errors.Amount = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStrRaw)) errors.Data = "التاريخ/البيان مطلوب";
      if (isNonEmpty(dataStrRaw) && dataISO === null && dataStrRaw.length > 100) {
        errors.Data = "قيمة التاريخ/البيان غير صالحة أو طويلة جداً";
      }
      if (isNonEmpty(bankStr) && !lenBetween(bankStr, 2, 100)) {
        errors.Bank = "اسم البنك إن وُجد يجب أن يكون بين 2 و 100 حرف";
      }

      // 4) فحص المرفقات (اختياري)
      const files = collectFiles(req);
      const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf"];
      const maxSize = 15 * 1024 * 1024; // 15MB
      for (const f of files) {
        const mime = String(f.mimetype || "");
        const size = Number(f.size || 0);
        if (!allowed.includes(mime)) { errors.files = "نوع ملف غير مدعوم (PDF/صور فقط)"; break; }
        if (size > maxSize) { errors.files = "حجم أحد الملفات يتجاوز 15MB"; break; }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) رفع المرفقات (إن وجدت) قبل الإدراج
      const arrayImage = [];
      for (const file of files) {
        try {
          await uploaddata(file); // نقل للتخزين النهائي
          const safeName = sanitizeFilename(file.filename || file.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } finally {
          try { deleteFileSingle(file.filename, "upload"); } catch { /* اختياري */ }
        }
      }
      const imagesPayload = arrayImage.length ? JSON.stringify(arrayImage) : null;

      // 6) الإدراج في قاعدة البيانات
      await insertTablecompanySubProjectREVENUE([
        convertArabicToEnglish(esc(projectIdNum)),
        amountNum,                           // رقم
        dataISO || esc(dataStrRaw),          // تاريخ ISO أو النص الأصلي
        isNonEmpty(bankStr) ? esc(bankStr) : null,
        imagesPayload,
      ]);

      // 7) إشعار/تحديثات لاحقة (لا تُسقط العملية لو فشلت)
      try {
        await Financeinsertnotification(projectIdNum, "عهد", "إضافة", userSession.userName);
      } catch (e) { console.warn("Financeinsertnotification failed:", e); }
      try {
        await UpdaterateCost(projectIdNum, "cost");
      } catch (e) { console.warn("UpdaterateCost failed:", e); }

      // 8) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: {
          projectID: projectIdNum,
          amount: amountNum,
          date: dataISO || dataStrRaw,
          bank: bankStr || null,
          attachments: arrayImage.length
        }
      });

    } catch (err) {
      console.error("RevenuesInsert error:", err);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


// ادخال بيانات المرتجع
const ReturnsInsert = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const { projectID, Amount, Data } = req.body || {};
      const projectIdNum = parsePositiveInt(projectID);
      const amountNum    = parseAmount(Amount);
      const dataStrRaw   = String(Data ?? "").trim();
      const dataISO      = tryParseDateISO(dataStrRaw); // نخزن ISO إن أمكن

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.projectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!Number.isFinite(amountNum) || amountNum < 0) errors.Amount = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      if (!isNonEmpty(dataStrRaw)) errors.Data = "التاريخ/البيان مطلوب";
      if (isNonEmpty(dataStrRaw) && dataISO === null && dataStrRaw.length > 100) {
        errors.Data = "قيمة التاريخ/البيان غير صالحة أو طويلة جداً";
      }

      // 4) فحص المرفقات (اختياري)
      const files = collectFiles(req);
      const allowed = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf"];
      const maxSize = 15 * 1024 * 1024; // 15MB
      for (const f of files) {
        const mime = String(f.mimetype || "");
        const size = Number(f.size || 0);
        if (!allowed.includes(mime)) { errors.files = "نوع ملف غير مدعوم (PDF/صور فقط)"; break; }
        if (size > maxSize) { errors.files = "حجم أحد الملفات يتجاوز 15MB"; break; }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) رفع المرفقات (إن وجدت) قبل الإدراج
      const arrayImage = [];
      for (const file of files) {
        try {
          await uploaddata(file); // نقل للتخزين النهائي
          const safeName = sanitizeFilename(file.filename || file.originalname);
          if (isNonEmpty(safeName)) arrayImage.push(safeName);
        } finally {
          try { deleteFileSingle(file.filename, "upload"); } catch { /* اختياري */ }
        }
      }
      const imagesPayload = arrayImage.length ? JSON.stringify(arrayImage) : null;

      // 6) الإدراج في قاعدة البيانات
      await insertTablecompanySubProjectReturned([
        convertArabicToEnglish(esc(projectIdNum)),
        amountNum,                          // رقم
        dataISO || esc(dataStrRaw),         // تاريخ ISO أو النص الأصلي
        imagesPayload,
      ]);

      // 7) إشعار/تحديثات غير حرجة (لا تُسقط العملية لو فشلت)
      try {
        await Financeinsertnotification(projectIdNum, "مرتجعات", "إضافة", userSession.userName);
      } catch (e) { console.warn("Financeinsertnotification failed:", e); }
      try {
        await UpdaterateCost(projectIdNum, "cost");
      } catch (e) { console.warn("UpdaterateCost failed:", e); }

      // 8) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: {
          projectID: projectIdNum,
          amount: amountNum,
          date: dataISO || dataStrRaw,
          attachments: arrayImage.length
        }
      });

    } catch (err) {
      console.error("ReturnsInsert error:", err);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


// ************************************************************************************************
// *********************************                  *********************************************
// ********************************* وظـــائف الإرشيف *********************************************

// اضافة مجلد جديد في ارشيف ملف المشروع

const AddFolderArchivesnew = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) (اختياري) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط وتطبيع المدخلات
      const { ProjectID, FolderName } = req.body || {};
      const projectIdNum = parsePositiveInt(ProjectID);
      const cleanedName  = sanitizeFolderName(FolderName);

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum)) errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (!isNonEmpty(cleanedName)) errors.FolderName = "اسم المجلد مطلوب";
      else if (!lenBetween(cleanedName, 2, 100)) errors.FolderName = "اسم المجلد يجب أن يكون بين 2 و 100 حرف";

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) الإدراج في قاعدة البيانات
      await insertTablecompanySubProjectarchivesFolder([
        convertArabicToEnglish(esc(projectIdNum)),
        esc(cleanedName),
      ]);

      // 5) نجاح
      return res.status(200).json({
        success: true,
        message: "تمت العملية بنجاح",
      });

    } catch (err) {
      console.error("AddFolderArchivesnew error:", err);

      // معالجة لطيفة لحالة التكرار إذا كان لديك قيد UNIQUE في قاعدة البيانات
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return res.status(200).send({ success:  "اسم المجلد موجود مسبقاً لهذا المشروع", message: "اسم المجلد موجود مسبقاً لهذا المشروع" });
      }

      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};


//  إضافة ملف فرعي داخل الملف الرئيسي
const AddfileinFolderHomeinArchive = (uploadQueue) => {
  return async (req, res) => {
    try {
      // (اختياري) التحقق من الجلسة إن كان endpoint محمياً
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 1) التقاط وتطبيع المدخلات
      const { ArchivesID, id: idsubRaw } = req.body || {};
      let   { type: typeRaw, name: nameRaw } = req.body || {};

      const archivesIdNum = parsePositiveInt(ArchivesID);
      const idsubNum      = (idsubRaw === undefined || idsubRaw === null || String(idsubRaw) === "")
        ? null : parsePositiveInt(idsubRaw);

      // تحقق أساسي للأرقام
      const errors = {};
      if (!Number.isFinite(archivesIdNum)) errors.ArchivesID = "رقم الأرشيف مطلوب ويجب أن يكون عدداً صحيحاً موجباً";
      if (idsubRaw !== undefined && idsubRaw !== null && String(idsubRaw) !== "" && !Number.isFinite(idsubNum)) {
        errors.id = "معرّف العقدة الفرعية (id) يجب أن يكون رقماً صحيحاً موجباً أو فارغاً للجذر";
      }

      // 2) تحديد ما إذا كنا ننشئ مجلدًا أم نرفع ملفًا
      let nodeName = null;
      let nodeType = null;
      let nodeSize = 0;

      const allowedMimes = [
        "image/png","image/jpeg","image/jpg","image/webp","image/gif",
        "application/pdf","text/plain",
        "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv","application/zip","application/x-zip-compressed"
      ];
      const maxSize = 15 * 1024 * 1024; // 15MB

      typeRaw = String(typeRaw ?? "").trim().toLowerCase();

      if (typeRaw === "folder") {
        // إنشاء مجلد
        const cleaned = sanitizeName(nameRaw);
        if (!isNonEmpty(cleaned) || !lenBetween(cleaned, 1, 100)) {
          errors.FolderName = "اسم المجلد مطلوب (حتى 100 حرف) ويجب أن يكون خالياً من المحارف غير المسموحة";
        } else {
          nodeName = cleaned;
          nodeType = "folder";
          nodeSize = 0;
        }
      } else {
        // رفع ملف
        const file = collectSingleFile(req);
        if (!file) {
          errors.file = "يجب إرفاق ملف أو تحديد النوع كـ folder مع اسم";
        } else {
          const mime = String(file.mimetype || "");
          const size = Number(file.size || 0);
          if (!allowedMimes.includes(mime)) {
            errors.file = "نوع الملف غير مدعوم";
          } else if (size > maxSize) {
            errors.file = "حجم الملف يتجاوز 15MB";
          } else {
            // نرفع الملف أولاً لضمان الاتساق
            try {
              await uploaddata(file);
            } catch (upErr) {
              console.error("uploaddata failed:", upErr);
              return res.status(200).send({ success: "فشل رفع الملف", message: "فشل رفع الملف" });
            } finally {
              try { deleteFileSingle(file.filename, "upload"); } catch { /* اختياري */ }
            }
            nodeName = sanitizeName(file.filename || file.originalname);
            nodeType = mime;
            nodeSize = size;
            if (!isNonEmpty(nodeName)) {
              errors.file = "اسم الملف غير صالح بعد التنظيف";
            }
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 3) جلب شجرة الأطفال الحالية
      const row = await SELECTTablecompanySubProjectarchivesotherroad(archivesIdNum);
      if (!row) {
        return res.status(200).send({ success:  "لم يتم العثور على سجل الأرشيف المطلوب", message: "لم يتم العثور على سجل الأرشيف المطلوب" });
      }

      let Children = [];
      try {
        Children = row.children !== null && row.children !== undefined
          ? JSON.parse(row.children) : [];
      } catch {
        // إن كانت البيانات تالفة، نبدأ من مصفوفة جديدة
        Children = [];
      }

      // 4) تحديث الشجرة عبر دالتك
      const childrenNew = await handlerOpreation(
        nodeName,
        nodeType,
        nodeSize,
        Children,
        Number.isFinite(idsubNum) ? idsubNum : null,
        archivesIdNum
      );

      if (!childrenNew) {
        return res.status(200).send({ success: "فشل تحديث بنية الأرشيف", message: "فشل تحديث بنية الأرشيف" });
      }

      // 5) حفظ الشجرة المحدثة
      await UPDATETablecompanySubProjectarchivesFolderinChildern([
        JSON.stringify(childrenNew),
        convertArabicToEnglish(esc(archivesIdNum)),
      ]);

      // 6) نجاح
      return res.status(200).send({
        success: "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: {
          ArchivesID: archivesIdNum,
          id: Number.isFinite(idsubNum) ? idsubNum : null,
          name: nodeName,
          type: nodeType,
          size: nodeSize
        }
      });

    } catch (error) {
      console.error("AddfileinFolderHomeinArchive error:", error);
      return res.status(500).json({ success: false, message: "فشل تنفيذ العملية" });
    }
  };
};


const handlerOpreation = async (
  name,
  type,
  size,
  children,
  idsub,
  ArchivesID
) => {
  try {
    return new Promise(async (resolve, reject) => {
      let value;
      if (type === "folder") {
        value = {
          id: Math.floor(100000 + Math.random() * 900000),
          name: name,
          type: type,
          children: [],
        };
      } else {
        value = {
          id: Math.floor(100000 + Math.random() * 900000),
          Date: new Date().toISOString(),
          name: name,
          type: type,
          size: size,
        };
      }

      if (idsub === ArchivesID) {
        children.push(value);
        resolve(children);
      } else {
        if (children.length > 0) {
          let childrenNew;
          childrenNew = await CreatChild(value, children, idsub);
          if (!childrenNew) {
            children.forEach(async (pic) => {
              if (pic.children) {
                childrenNew = await CreatChild(value, pic.children, idsub);
              }
            });
          }
          if (childrenNew) {
            // console.log(childrenNew);
            resolve(childrenNew);
          } else {
            // children.push(value);
            resolve(children);
          }
        } else {
          children.push(value);
          resolve(children);
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const CreatChild = (updates, children, idsub) => {
  return new Promise(async (resolve, reject) => {
    try {
      const folder = children?.find(
        (folder) => parseInt(folder.id) === parseInt(idsub)
      );
      if (folder) {
        folder?.children?.push(updates);
        resolve(children);
      } else {
        const promises = [];
        children.forEach((child) => {
          if (child.children) {
            promises.push(CreatChild(updates, child.children, idsub));
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
    } catch (error) {
      console.log(error);
    }
  });
};

// ******************************************************************
// ********************* الطلبيات **********************************

const InsertDatainTableRequests = (uploadQueue) => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط/تطبيع المدخلات
      const { ProjectID, Type, Data, user } = req.body || {};
      const projectIdNum = parsePositiveInt(ProjectID);
      const typeStr = String(Type ?? "").trim();
      const dataStr = String(Data ?? "").trim();
      const userStr = String(user ?? "").trim();

      // 3) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(projectIdNum))
        errors.ProjectID = "رقم المشروع مطلوب ويجب أن يكون عدداً صحيحاً موجباً";

      if (!isNonEmpty(typeStr) || typeStr === "تصنيف الإضافة" || !lenBetween(typeStr, 2, 100))
        errors.Type = "التصنيف مطلوب (غير \"تصنيف الإضافة\") وبطول بين 2 و 100 حرف";

      if (!isNonEmpty(dataStr) || !lenBetween(dataStr, 1, 2000))
        errors.Data = "نص الطلب مطلوب (1 إلى 2000 حرف)";

      if (isNonEmpty(userStr) && !lenBetween(userStr, 2, 100))
        errors.user = "اسم المستخدم (إن وُجد) يجب أن يكون بين 2 و 100 حرف";

      // فحص المرفقات (اختياري)
      const files = collectFiles(req);
      const allowed = [
        "image/png","image/jpeg","image/jpg","image/webp","image/gif",
        "application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain","text/csv","application/zip","application/x-zip-compressed"
      ];
      const maxSize = 15 * 1024 * 1024; // 15MB
      for (const f of files) {
        const mime = String(f.mimetype || "");
        const size = Number(f.size || 0);
        if (!allowed.includes(mime)) { errors.files = "نوع ملف غير مدعوم"; break; }
        if (size > maxSize) { errors.files = "حجم أحد الملفات يتجاوز 15MB"; break; }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: false, message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 4) رفع المرفقات (إن وجدت) قبل الإدراج
      let arrayImage = [];
      if (files.length > 0) {
        for (const file of files) {
          try {
            await uploaddata(file); // نقل للتخزين النهائي
            const safeName = sanitizeFilename(file.filename || file.originalname);
            if (isNonEmpty(safeName)) arrayImage.push(safeName);
          } finally {
            try { deleteFileSingle(file.filename, "upload"); } catch { /* اختياري */ }
          }
        }
      }
      if (arrayImage.length === 0) arrayImage = null;

      // 5) الإدراج في قاعدة البيانات
      const createdAtISO = new Date().toISOString();
      await insertTablecompanySubProjectRequestsForcreatOrder([
        convertArabicToEnglish(esc(projectIdNum)),
        esc(typeStr),
        esc(dataStr),
        isNonEmpty(userStr) ? esc(userStr) : null,
        arrayImage ? JSON.stringify(arrayImage) : null,
        createdAtISO,
      ]);

      // 6) إرسال ملاحظة (لا تُسقط العملية عند الفشل)
      const masseges = `${typeStr}: ${dataStr}`;
      let Filemassge = {};
      if (arrayImage && arrayImage.length > 0) {
        // نأخذ أول ملف فقط كما في كودك
        Filemassge = {
          uri: arrayImage[0],
          name: arrayImage[0],
          type: files[0]?.mimetype,
          size: files[0]?.size,
          location: {}
        };
      }
      try { await sendNote(projectIdNum, masseges, Filemassge, userSession); }
      catch (e) { console.warn("sendNote failed:", e); }

      // 7) رد النجاح
      return res.status(200).send({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح"
      });

      // (اختياري) إشعار مالي إن رغبت بإعادته
      // try {
      //   await Financeinsertnotification(projectIdNum, "طلب", "إضافة", userSession.userName);
      // } catch (e) { console.warn("Financeinsertnotification failed:", e); }

    } catch (error) {
      console.error("InsertDatainTableRequests error:", error);
      return res.status(500).json({ success: false, message: "فشل في تنفيذ العملية" });
    }
  };
};

//  updatechild folder
module.exports = {
  StageSub,
  NotesStage,
  NotesStageSub,
  ExpenseInsert,
  RevenuesInsert,
  ReturnsInsert,
  AddFolderArchivesnew,
  AddfileinFolderHomeinArchive,
  InsertStage,
  insertStageSub,
  AddORCanselAchievment,
  ClassCloaseOROpenStage,
  InsertDatainTableRequests,
  OpreationProjectInsertv2,
  projectBrinshv2,
  AddORCanselAchievmentarrayall,
  insertStageSubv2,
  insertStageCustImage,
};
