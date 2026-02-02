const { Addusertraffic, parsePositiveInt, convertArabicToEnglish, normalizePhone, isNonEmpty, lenBetween, isValidLocalPhone9, esc } = require("../../../../middleware/Aid");
const {
  DeletTableuserComppanyCorssUpdateActivationtoFalse,
  DeleteuserBransh,
} = require("../../../../sql/delete");
const {
  insertTableusersBransh,
  insertTableusersProject,
  insertTableusersBranshAcceptingcovenant,
} = require("../../../../sql/INsertteble");
const {
  SelectVerifycompanyexistencePhonenumber,
} = require("../../../../sql/selected/selected");
const {
  SELECTTableusersCompanyVerificationID,
  SELECTTableusersCompanyVerificationIDUpdate,
  SELECTTableusersCompanyVerification,
  SELECTTableusersBransh,
} = require("../../../../sql/selected/selectuser");
const {
  UpdateTableuserComppany,
  UpdateTableLoginActivatytoken,
  UpdateTableuserComppanyValidity,
  UpdateTableusersBransh,
  UpdateTableusersProject,
} = require("../../../../sql/update");

// =============================================================
// userCompanyUpdatdashbord
// =============================================================
const userCompanyUpdatdashbord = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "userCompanyUpdatdashbord"); } catch {}

      const { IDCompany, userName, IDNumber, PhoneNumber, jobdiscrption, job, id } = req.body || {};
      const idNum     = parsePositiveInt(id);
      const companyId = parsePositiveInt(IDCompany);
      const nameStr   = String(userName ?? "").trim();
      const idNoStr   = convertArabicToEnglish(IDNumber).trim();
      const jobStr    = String(job ?? "").trim();
      const jobDesc   = String(jobdiscrption ?? "").trim();
      const phoneLocal = normalizePhone(PhoneNumber);

      const errors = {};
      if (!Number.isFinite(idNum)) errors.id = "المعرف مطلوب ويكون رقماً صحيحاً موجباً";
      if (!Number.isFinite(companyId)) errors.IDCompany = "رقم الشركة غير صالح";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 100)) errors.userName = "اسم المستخدم مطلوب (2–100)";
      if (isNonEmpty(idNoStr) && !lenBetween(idNoStr, 4, 50)) errors.IDNumber = "رقم الهوية/الإقامة حتى 50";
      if (!isValidLocalPhone9(phoneLocal)) errors.PhoneNumber = "رقم الجوال غير صالح (9 أرقام محلية بعد التطبيع)";
      if (isNonEmpty(jobStr) && !lenBetween(jobStr, 2, 50)) errors.job = "المسمى الوظيفي حتى 50";
      if (isNonEmpty(jobDesc) && !lenBetween(jobDesc, 0, 2000)) errors.jobdiscrption = "الوصف حتى 2000";
      if (Object.keys(errors).length) return res.status(200).json({ success:false, message:"أخطاء في التحقق", errors });

      const verificationFinduser = await SELECTTableusersCompanyVerificationIDUpdate(phoneLocal, idNum);
      const findRegistrioncompany = await SelectVerifycompanyexistencePhonenumber(phoneLocal);

      if ((Array.isArray(verificationFinduser) && verificationFinduser.length > 0) || findRegistrioncompany) {
        return res.status(200).json({
          success:false,
          message: findRegistrioncompany
            ? "الرقم موجود في قائمة انتظار تسجيل حساب شركات"
            : "الرقم الذي أضفته مستخدم لمستخدم آخر"
        });
      }

      await UpdateTableuserComppany(
        [
          convertArabicToEnglish(esc(companyId)),
          esc(nameStr),
          esc(idNoStr || "0"),
          convertArabicToEnglish(esc(phoneLocal)),
          esc(jobStr || "عضو"),
          esc(jobDesc || "موظف"),
          convertArabicToEnglish(esc(idNum))
        ],
        "job=?,jobdiscrption=?"
      );

      return res.status(200).json({ success:true, message:"تمت العملية بنجاح" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success:false, message:"فشل في تنفيذ العملية" });
    }
  };
};

// =============================================================
// userCompanyUpdat (تحديث داخل شركة المستخدم الحالي)
// =============================================================
const userCompanyUpdat = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "userCompanyUpdat"); } catch {}

      const { userName, IDNumber, PhoneNumber, jobdiscrption, job, id } = req.body || {};
      const idNum   = parsePositiveInt(id);
      const nameStr = String(userName ?? "").trim();
      const idNoStr = convertArabicToEnglish(IDNumber).trim();
      const jobStr  = String(job ?? "").trim();
      const jobDesc = String(jobdiscrption ?? "").trim();
      const phoneLocal = normalizePhone(PhoneNumber);

      const errors = {};
      if (!Number.isFinite(idNum)) errors.id = "المعرف مطلوب ويكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 100)) errors.userName = "اسم المستخدم مطلوب (2–100)";
      // if (isNonEmpty(idNoStr) && !lenBetween(idNoStr, 4, 50)) errors.IDNumber = "رقم الهوية/الإقامة حتى 50";
      if (!isValidLocalPhone9(phoneLocal)) errors.PhoneNumber = "رقم الجوال غير صالح (9 أرقام)";
      if (isNonEmpty(jobStr) && !lenBetween(jobStr, 2, 50)) errors.job = "المسمى الوظيفي حتى 50";
      if (isNonEmpty(jobDesc) && !lenBetween(jobDesc, 0, 2000)) errors.jobdiscrption = "الوصف حتى 2000";
      if (Object.keys(errors).length) return res.status(200).json({ success:"أخطاء في التحقق", message:"أخطاء في التحقق", errors });

      const verificationFinduser = await SELECTTableusersCompanyVerificationIDUpdate(phoneLocal, idNum);
      const findRegistrioncompany = await SelectVerifycompanyexistencePhonenumber(phoneLocal);

      if ((Array.isArray(verificationFinduser) && verificationFinduser.length > 0) || findRegistrioncompany) {
        const message = findRegistrioncompany
            ? "الرقم موجود في قائمة انتظار تسجيل حساب شركات"
            : "الرقم الذي أضفته لمستخدم موجود";
        return res.status(200).json({
          success:message,
          message: message
        });
      }

      await UpdateTableuserComppany(
        [
          convertArabicToEnglish(esc(userSession?.IDCompany)),
          esc(nameStr),
          esc(idNoStr || "0"),
          convertArabicToEnglish(esc(phoneLocal)),
          esc(jobStr || "عضو"),
          esc(jobDesc || "موظف"),
          convertArabicToEnglish(esc(idNum))
        ],
        "job=?,jobdiscrption=?"
      );

      return res.status(200).json({ success:"تمت العملية بنجاح", message:"تمت العملية بنجاح" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success:false, message:"فشل في تنفيذ العملية" });
    }
  };
};

// =============================================================
// UpdatUserCompanyinBrinsh (V1)
// =============================================================
const UpdatUserCompanyinBrinsh = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdatUserCompanyinBrinsh"); } catch {}

      const { idBrinsh, type, checkGloblenew, checkGlobleold, kind } = req.body || {};
      const idBrinshNum = parsePositiveInt(idBrinsh);

      const errors = {};
      if (!Number.isFinite(idBrinshNum)) errors.idBrinsh = "رقم الفرع غير صالح";
      const kindStr = String(kind ?? "").trim();
      if (!["Acceptingcovenant", "user", ""].includes(kindStr) && isNaN(Number(type))) {
        // نسمح بأن يكون type رقم (مشروع) أو kind من هذه القيم
      }
      if (Object.keys(errors).length) return res.status(200).json({ success:false, message:"أخطاء في التحقق", errors });

      if (kindStr === "Acceptingcovenant" || kindStr === "user") {
        await Updatchackglobluserinbrinsh(idBrinshNum, kindStr === "user" ? type : kindStr, checkGloblenew, checkGlobleold, userSession.userName);
      } else {
        await UpdatchackAdmininbrinsh(idBrinshNum, type, checkGloblenew, checkGlobleold, userSession.userName);
      }

      return res.status(200).json({ success:true, message:"successfuly" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success:false, message:"خطأ في التنفيذ" });
    }
  };
};

// =============================================================
// UpdatUserCompanyinBrinshV2
// =============================================================
const UpdatUserCompanyinBrinshV2 = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdatUserCompanyinBrinshV2"); } catch {}

      const { idBrinsh, type, checkGloblenew, checkGlobleold, kind } = req.body || {};
      const idBrinshNum = parsePositiveInt(idBrinsh);
      const kindStr = String(kind ?? "").trim();
      const validKinds = ["Acceptingcovenant", "user", "justuser"];

      const errors = {};
      if (!Number.isFinite(idBrinshNum)) errors.idBrinsh = "رقم الفرع غير صالح";
      if (!validKinds.includes(kindStr) && isNaN(Number(type))) {
        // نسمح بنوعي التمرير
      }
      if (Object.keys(errors).length) return res.status(200).json({ success:false, message:"أخطاء في التحقق", errors });

      if (validKinds.includes(kindStr)) {
        await Updatchackglobluserinbrinshv2(idBrinshNum, type, checkGloblenew, checkGlobleold, userSession.userName);
      } else {
        await UpdatchackAdmininbrinshv2(idBrinshNum, type, checkGloblenew, checkGlobleold, userSession.userName);
      }

      return res.status(200).json({ success:true, message:"successfuly" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success:false, message:"خطأ في التنفيذ" });
    }
  };
};

// =============================================================
// Helpers: صلاحيات الإدمن/الأعضاء (مع حواجز أمان إضافية)
// =============================================================
const UpdatchackAdmininbrinsh = async (idBrinsh, type, checkGloblenew, checkGlobleold, userName) => {
  try {
    const oldId = parsePositiveInt(checkGlobleold);
    const newId = parsePositiveInt(checkGloblenew);

    if (Number.isFinite(oldId)) {
      await DeleteuserBransh(oldId, idBrinsh);
      const result = await SELECTTableusersCompanyVerificationID(oldId);
      if (result && result[0]) {
        await UpdateTableuserComppanyValidity([result[0].jobHOM, oldId], "job");
      }
    }

    if (Number.isFinite(newId)) {
      await DeleteuserBransh(checkGlobleold, idBrinsh);
      await DeleteuserBransh(checkGlobleold, idBrinsh, "user_id", "idBransh", "usersProject");
      await insertTableusersBransh([newId, idBrinsh, "مدير الفرع"]);
    }
  } catch (e) { console.error("UpdatchackAdmininbrinsh error:", e); }
};

const Updatchackglobluserinbrinsh = async (idBrinsh, type, checkGloblenew, checkGlobleold, userName) => {
  try {
    const deletedkeys = Object.keys(checkGlobleold || {});
    const newvalidy   = Object.values(checkGloblenew || {});

    if (deletedkeys.length > 0) {
      for (const element of deletedkeys) {
        if (Number(type)) {
          await DeleteuserBransh(element, element, "user_id", "ProjectID", "usersProject");
        } else {
          await DeleteuserBransh(element, idBrinsh, "user_id", "idBransh", "usersBransh");
        }
      }
    }
    for (const element of newvalidy) {
      await opreationAddvalidityuserBrinshorCovenant(type, idBrinsh, element);
    }
  } catch (e) { console.error("Updatchackglobluserinbrinsh error:", e); }
};

const UpdatchackAdmininbrinshv2 = async (idBrinsh, type, checkGloblenew, checkGlobleold, userName) => {
  try {
    const oldId = parsePositiveInt(checkGlobleold);
    if (Number.isFinite(oldId)) {
      await DeleteuserBransh(oldId, idBrinsh);
      const result = await SELECTTableusersCompanyVerificationID(oldId);
      if (result) {
        await UpdateTableuserComppanyValidity([result[0]?.jobHOM, oldId], "job");
      }
    }
    const newId = parsePositiveInt(checkGloblenew);
    if (!Number.isFinite(newId)) return;
    await DeleteuserBransh(checkGlobleold, idBrinsh);
    await DeleteuserBransh(checkGlobleold, idBrinsh, "user_id", "idBransh", "usersProject");
    await insertTableusersBransh([idBrinsh, newId, "مدير الفرع"]);
    await UpdateTableuserComppanyValidity(["مدير الفرع", newId], "job");
  } catch (e) { console.error("UpdatchackAdmininbrinshv2 error:", e); }
};

const Updatchackglobluserinbrinshv2 = async (idBrinsh, type, checkGloblenew, checkGlobleold, userName) => {
  try {
    const deletedkeys = Object.keys(checkGlobleold || {});
    const newvalidy   = Object.values(checkGloblenew || {});

    if (deletedkeys.length > 0) {
      for (const element of deletedkeys) {
        if (Number(type)) {
          await DeleteuserBransh(element, type, "user_id", "ProjectID", "usersProject");
        } else if (type === "Acceptingcovenant") {
          await UpdateTableusersBransh(["false", element, idBrinsh], "Acceptingcovenant=?");
        } else {
          await DeleteuserBransh(element, idBrinsh, "user_id", "idBransh", "usersBransh", "job != 'مدير الفرع' AND");
          await DeleteuserBransh(element, idBrinsh, "user_id", "idBransh", "usersProject");
        }
      }
    }
    for (const element of newvalidy) {
      await opreationAddvalidityuserBrinshorCovenant(type, idBrinsh, element);
    }
  } catch (e) { console.error("Updatchackglobluserinbrinshv2 error:", e); }
};

// =============================================================
// DeletUser
// =============================================================
const DeletUser = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");
      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "DeletUser"); } catch {}

      const phoneLocal = normalizePhone(req.body?.PhoneNumber);
      if (!isValidLocalPhone9(phoneLocal)) {
        return res.status(200).json({ success:false, message:"رقم الجوال غير صالح (9 أرقام محلية)" });
      }

      const ok1 = await DeletTableuserComppanyCorssUpdateActivationtoFalse([convertArabicToEnglish(esc(phoneLocal))]);
      const ok2 = await DeletTableuserComppanyCorssUpdateActivationtoFalse([convertArabicToEnglish(esc(phoneLocal))], "LoginActivaty");

      if (ok1) return res.status(200).json({ success:true, message:"تمت العملية بنجاح" });
      return res.status(404).json({ success:false, message:"المستخدم غير موجود أو لم يتم التعديل" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"العملية غير ناجحة" });
    }
  };
};

// =============================================================
// opreationAddvalidityuserBrinshorCovenant (كما هو مع حواجز)
// =============================================================
const opreationAddvalidityuserBrinshorCovenant = async (type, idBrinsh, element) => {
  try {
    const idBrinshNum = parsePositiveInt(idBrinsh);
    if (!Number.isFinite(idBrinshNum)) return;

    if (Number(type)) {
      const projId = parsePositiveInt(type);
      const userId = parsePositiveInt(element?.id);
      if (!Number.isFinite(projId) || !Number.isFinite(userId)) return;

      const resultuser = await SELECTTableusersBransh([userId, projId], "usersProject", "user_id", "ProjectID");
      if (resultuser) {
        await UpdateTableusersProject([JSON.stringify(element?.Validity ?? {}), userId, projId]);
      } else {
        await insertTableusersProject([idBrinshNum, projId, userId, JSON.stringify(element?.Validity ?? {})]);
      }
    } else {
      const userId = parsePositiveInt(element?.id);
      if (!Number.isFinite(userId)) return;

      const resultuser = await SELECTTableusersBransh([userId, idBrinshNum]);
      if (String(type) !== "Acceptingcovenant") {
        if (resultuser) {
          await UpdateTableusersBransh([JSON.stringify(element?.Validity ?? {}), userId, idBrinshNum], "ValidityBransh=?");
        } else {
          await insertTableusersBransh([idBrinshNum, userId, "عضو"]);
        }
      } else {
        if (resultuser) {
          const Acceptingcovenant = resultuser?.Acceptingcovenant === "true" ? "false" : "true";
          await UpdateTableusersBransh([Acceptingcovenant, userId, idBrinshNum], "Acceptingcovenant=?");
        } else {
          await insertTableusersBranshAcceptingcovenant([idBrinshNum, userId, "عضو", "true"]);
        }
      }
    }
  } catch (error) { console.error(error); }
};

// =============================================================
// UpdateToken
// =============================================================
const UpdateToken = () => {
  return async (req, res) => {
    try {
      const { tokenNew, tokenOld } = req.body || {};
      const userSession = req.session?.user;
      if (!userSession?.PhoneNumber) return res.status(401).send("Invalid session");

      const newStr = String(tokenNew ?? "").trim();
      const oldStr = String(tokenOld ?? "").trim();
      const errors = {};
      if (!isNonEmpty(newStr) || !lenBetween(newStr, 8, 2048)) errors.tokenNew = "التوكين الجديد غير صالح";
      if (isNonEmpty(oldStr) && !lenBetween(oldStr, 8, 2048)) errors.tokenOld = "التوكين القديم غير صالح";
      if (Object.keys(errors).length) return res.status(200).json({ success:false, message:"أخطاء في التحقق", errors });

      const phoneLocal = normalizePhone(userSession.PhoneNumber);
      await UpdateTableLoginActivatytoken(convertArabicToEnglish(esc(phoneLocal)), esc(newStr), esc(oldStr || null));

      return res.status(200).json({ success:true, message:"تمت العملية بنجاح" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل تنفيذ العملية" });
    }
  };
};

// =============================================================
// InsertmultipleProjecsinvalidity
// =============================================================
const InsertmultipleProjecsinvalidity = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      try { Addusertraffic(userSession.userName, userSession?.PhoneNumber, "InsertmultipleProjecsinvalidity"); } catch {}

      const { ProjectesNew, Validitynew, idBrinsh, PhoneNumber } = req.body || {};
      const idBrinshNum = parsePositiveInt(idBrinsh);
      const phoneLocal  = normalizePhone(PhoneNumber);

      const errors = {};
      if (!Number.isFinite(idBrinshNum)) errors.idBrinsh = "رقم الفرع غير صالح";
      if (!Array.isArray(ProjectesNew) || ProjectesNew.length === 0) errors.ProjectesNew = "قائمة المشاريع مطلوبة";
      if (!isValidLocalPhone9(phoneLocal)) errors.PhoneNumber = "رقم الجوال غير صالح";
      if (Object.keys(errors).length) return res.status(200).json({ success:false, message:"أخطاء في التحقق", errors });

      const resultusernew = await SELECTTableusersCompanyVerification(phoneLocal);
      if (!Array.isArray(resultusernew) || resultusernew.length === 0) {
        return res.status(404).json({ success:false, message:"المستخدم غير موجود" });
      }

      const userId = parsePositiveInt(resultusernew[0]?.id);
      if (!Number.isFinite(userId)) return res.status(500).json({ success:false, message:"فشل تحديد المعرّف" });

      // إزالة صلاحيات المشاريع الحالية لهذا المستخدم في هذا الفرع
      await DeleteuserBransh(userId, idBrinshNum, "user_id", "idBransh", "usersProject");

      // إدخال صلاحيات المشاريع الجديدة
      const uniqueProjects = Array.from(new Set(ProjectesNew.map(p => parsePositiveInt(p)).filter(n => Number.isFinite(n))));
      for (const proj of uniqueProjects) {
        await insertTableusersProject([idBrinshNum, proj, userId, JSON.stringify(Validitynew ?? {})]);
      }

      return res.status(200).json({ success:true, message:"تمت العملية بنجاح" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, message:"فشل تنفيذ العملية" });
    }
  };
};


// BringUpdateuser();

module.exports = {
  userCompanyUpdat,
  UpdatUserCompanyinBrinsh,
  UpdatUserCompanyinBrinshV2,
  DeletUser,
  UpdateToken,
  InsertmultipleProjecsinvalidity,
  userCompanyUpdatdashbord,
};
