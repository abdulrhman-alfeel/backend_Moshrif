const { uploaddata } = require("../../../bucketClooud");
const {
  verificationfromdata,
  StageTempletXsl2,
  convertArabicToEnglish,
  parsePositiveInt,
  sanitizeName,
  lenBetween,
  isNonEmpty,
  sanitizeFilename,
  parseRatio0to100,
  esc,
} = require("../../../middleware/Aid");
const { implmentOpreationSingle } = require("../../../middleware/Fsfile");
const {
  insertTablecompanySubProjectStagetemplet,
  insertTablecompanySubProjectStageSubtemplet2,
  insertTablecompanySubProjectStageSubtemplet,
  insertTableStagestype,
} = require("../../../sql/INsertteble");
const {
  SELECTFROMTableStageTempletmax,
} = require("../../../sql/selected/selected");

// ===== Helpers (بدون مكتبات): تطبيع/تحقق/تنظيف =====





// فحص بسيط للقيمة ضمن مصفوفة (بديل آمن للدالة القديمة)
function checkIfNumber(arr, index, label = "جدول المراحل الرئيسية") {
  const v = (Array.isArray(arr) ? arr[index] : undefined);
  if (!isNonEmpty(v)) return `${label} في العمود رقم ${index} يجب ملؤه`;
  return null;
}

// أنواع مرفقات مسموحة لملفات مراحل Sub (اختياري)
const ALLOWED_MIMES = [
  "image/png","image/jpeg","image/jpg","image/webp","image/gif",
  "application/pdf"
];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// ===================================================================
// insertStageHome
// ===================================================================
const insertStageHome = (uploadQueue) => {
  return async (req, res) => {
    try {
      const { Type, StageName, Days, Ratio = 0, attached } = req.body || {};
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      // تحققات إضافية (إلى جانب verificationfromdata)
      const cleanType  = String(Type ?? "").trim();
      const cleanName  = sanitizeName(StageName);
      const daysInt    = parsePositiveInt(Days);
      const ratioNum   = parseRatio0to100(Ratio);

      const errors = {};
      if (!isNonEmpty(cleanType)) errors.Type = "النوع مطلوب";
      if (!isNonEmpty(cleanName) || !lenBetween(cleanName, 2, 150)) errors.StageName = "اسم المرحلة مطلوب (2–150)";
      if (!Number.isFinite(daysInt)) errors.Days = "الأيام يجب أن تكون رقمًا صحيحًا موجبًا";
      if (!Number.isFinite(ratioNum)) errors.Ratio = "النسبة (0–100)";
      if (Object.keys(errors).length) return res.status(200).json({ error: errors });

      if (await verificationfromdata([cleanType, cleanName, daysInt])) {
        const result = await SELECTFROMTableStageTempletmax(cleanType, userSession?.IDCompany);
        const ListID = await insertTableStagestype(userSession?.IDCompany, cleanType);

        if (result?.StageID != null && String(result.StageID).length !== 0) {
          const currentRatio = Number(result.TotalRatio || 0);
          const totalRatio   = cleanType !== "عام" ? currentRatio + ratioNum : ratioNum;
          if (totalRatio > 100) {
            return res.status(200).json({ error: "مجموع النسب لا يجب أن يتجاوز 100" });
          }

          await insertTablecompanySubProjectStagetemplet([
            Number(result.StageID) + 1,
            cleanType,
            cleanName,
            convertArabicToEnglish(esc(daysInt)),
            convertArabicToEnglish(esc(ratioNum)),
            attached ?? null,
            userSession?.IDCompany,
            ListID,
          ]);

          return res.status(200).json({ success: "تمت الإضافة بنجاح" });
        } else {
          return res.status(200).json({ error: "هناك خطأ في قراءة رقم المرحلة الأخيرة" });
        }
      } else {
        return res.status(200).json({ error: "يرجى إدخال البيانات بشكل صحيح" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "حدث خطأ غير متوقع" });
    }
  };
};

// ===================================================================
// insertStageSub (Templet) — مع دعم مرفق اختياري
// ===================================================================
const insertStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      const { StageID, StageSubName, Stagestype_id } = req.body || {};
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      const stageIdInt   = StageID;
      const typeIdInt    = parsePositiveInt(Stagestype_id);
      const cleanSubName = sanitizeName(StageSubName);

      const errors = {};
      if (!isNonEmpty(stageIdInt)) errors.StageID = "رقم المرحلة غير صالح";
      if (!Number.isFinite(typeIdInt))  errors.Stagestype_id = "رقم نوع المرحلة غير صالح";
      if (!isNonEmpty(cleanSubName) || !lenBetween(cleanSubName, 2, 150)) errors.StageSubName = "اسم خطوة المرحلة مطلوب (2–150)";
      if (Object.keys(errors).length) return res.status(200).json({ error: errors });

      const attached = req.file ? req.file.filename : null;

      if (await verificationfromdata([stageIdInt, cleanSubName])) {
        if (attached) {
          // تحقق من المرفق
          const mime = String(req.file.mimetype || "");
          const size = Number(req.file.size || 0);
          if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ error: "نوع المرفق غير مدعوم (صور/PDF)" });
          if (size > MAX_FILE_SIZE)        return res.status(200).json({ error: "حجم المرفق يتجاوز 15MB" });

          await insertTablecompanySubProjectStageSubtemplet2([
            stageIdInt,
            cleanSubName,
            sanitizeFilename(attached),
            userSession?.IDCompany,
            typeIdInt,
          ]);
          await uploaddata(req.file);
          await implmentOpreationSingle("upload", sanitizeFilename(attached));
        } else {
          await insertTablecompanySubProjectStageSubtemplet2([
            stageIdInt,
            cleanSubName,
            null,
            userSession?.IDCompany,
            typeIdInt,
          ]);
        }
        return res.status(200).json({ success: "تمت الإضافة بنجاح" });
      } else {
        return res.status(200).json({ error: "يرجى إدخال البيانات بشكل صحيح" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "حدث خطأ غير متوقع" });
    }
  };
};

// ===================================================================
// insertStageTempletinDatabase: إدخال من ملف إكسل (شيت 0: مراحل، شيت 1: خطوات)
// ===================================================================
const insertStageTempletinDatabase = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");
      if (!req.file || !req.file.path) return res.status(200).json({ error: "لم يتم رفع ملف" });

      // قراءة الشيتين
      const data    = await StageTempletXsl2(req.file.path, 0); // [Type, StageName, Days, Ratio]
      const dataSub = await StageTempletXsl2(req.file.path, 1); // [StageIDRef(or TypeRef), StageSubName]

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(200).json({ error: "لا توجد بيانات في ملف الإكسل" });
      }

      // نبدأ بالـ StageID انطلاقاً من 'عام' كمرجع
      const result = await SELECTFROMTableStageTempletmax("عام", userSession?.IDCompany);
      let StageIDnew = Number(result?.StageID || 0);

      // تجميع نسبي لكل نوع للتحقق لاحقًا (Reducing per Type)
      const ratioByType = {};

      // تمرير أولي للتحقق وتجميع النِّسب لكل نوع
      for (const row of data) {
        const elements = Object.values(row);
        const typeRaw   = elements[1];
        const nameRaw   = elements[2];
        const ratioRaw  = elements[4];

        // تحقق أساسي
        const msg = checkIfNumber(elements, 0) || checkIfNumber(elements, 3, "النسب");
        if (msg) return res.status(200).json({ error: msg });

        const cleanType  = String(typeRaw ?? "").trim();
        const cleanName  = sanitizeName(nameRaw);
        const ratioNum   = parseRatio0to100(ratioRaw);

        if (!Number.isFinite(ratioNum)) return res.status(200).json({ error: `نسبة تقديرية غير صالحة للمرحلة: ${cleanName}` });

        ratioByType[cleanType] = (ratioByType[cleanType] || 0) + ratioNum;
      }

      // لا يجوز أن تتجاوز النِّسب الإجمالية 100 لأي نوع غير "عام"
      for (const [t, sum] of Object.entries(ratioByType)) {
        if (t !== "عام" && sum > 100) {
          return res.status(200).json({ error: `يجب أن تكون النسبة التقديرية المجمعة لنوع '${t}' ≤ 100 (الموجودة: ${sum})` });
        }
      }

      // الإدراج
      for (const row of data) {
        const elements = Object.values(row);
        const cleanType  = String(elements[1] ?? "").trim();
        const cleanName  = sanitizeName(elements[2]);
        const daysInt    = parsePositiveInt(elements[3]);
        const ratioNum   = Number(parseRatio0to100(elements[4]) || 0);

        StageIDnew += 1;
        const ListID = await insertTableStagestype(cleanType);
        await insertTablecompanySubProjectStagetemplet([
          StageIDnew,
          cleanType,
          cleanName,
          convertArabicToEnglish(esc(daysInt)),
          convertArabicToEnglish(esc(ratioNum)),
          null,
          userSession?.IDCompany,
          ListID,
        ]);

        // إدراج الخطوات التابعة من الشيت 1: نربط على العمود الأول (نفس قيمة Type في الصف الأصلي)
        if (Array.isArray(dataSub) && dataSub.length > 0) {
          for (const sub of dataSub) {
            const subArr = Object.values(sub);
            // الربط حسب نوع المرحلة في العمود 0 (كما هو في ملفك)
            if (String(subArr[0]).trim() === String(elements[0]).trim()) {
              const subName = sanitizeName(subArr[1]);
              if (isNonEmpty(subName)) {
                await insertTablecompanySubProjectStageSubtemplet([
                  StageIDnew,
                  subName,
                  userSession?.IDCompany,
                  ListID,
                ]);
              }
            }
          }
        }
      }

      return res.status(200).json({ success: "تمت العملية بنجاح" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "حدث خطأ أثناء إدخال البيانات" });
    }
  };
};

// ===================================================================
// insertTypeTemplet: إضافة نوع مرحلة (Type) لشركة المستخدم
// ===================================================================
const insertTypeTemplet = () => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      const TypeParam = String(req.params?.Type ?? "").trim();
      const cleanType = sanitizeName(TypeParam);

      if (!isNonEmpty(cleanType) || !lenBetween(cleanType, 1, 100)) {
        return res.status(200).json({ error: "نوع المرحلة غير صالح" });
      }

      await insertTableStagestype(userSession?.IDCompany, cleanType);
      return res.status(200).json({ success: "تمت الإضافة بنجاح" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "حدث خطأ أثناء الإضافة" });
    }
  };
};

module.exports = {
  insertStageHome,
  insertStageSub,
  insertStageTempletinDatabase,
  insertTypeTemplet
};
