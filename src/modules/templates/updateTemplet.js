const { uploaddata } = require("../../../bucketClooud");
const { parseRatio0to100, parsePositiveInt, sanitizeFilename, isNonEmpty, sanitizeName, lenBetween, parseNonNegativeInt } = require("../../../middleware/Aid");
const { implmentOpreationSingle } = require("../../../middleware/Fsfile");
const {
  SELECTFROMTableStageTempletaObject,
} = require("../../../sql/selected/selected");
const {
  UPDATETablecompanySubProjectStagetemplet,
  UPDATETablecompanySubProjectStageSubtemplet,
  UPDATETablecompanySubProjectStagesSubv2,
  UPDATEStopeProjectStageCUSTv2,
  UPDATETableStagetype,
} = require("../../../sql/update");

const ALLOWED_MIMES = ["image/png","image/jpeg","image/jpg","image/webp","application/pdf"];
const MAX_FILE_SIZE = 15 * 1024 * 1024;

// ===== UpdateStageHome =====
const UpdateStageHome = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      let { StageIDtemplet, Type, StageName, Days, Ratio, attached } = req.body || {};

      // تحقق/تنظيف
      const stageIdTpl = parsePositiveInt(StageIDtemplet);
      const cleanType  = Type;
      const cleanName  = sanitizeName(StageName);
      const daysInt    = parseNonNegativeInt(Days);
      const ratioNum   = parseRatio0to100(Ratio);
      const fileFromReq = req.file ? sanitizeFilename(req.file.filename) : null;
      const attachedName = fileFromReq || (isNonEmpty(attached) ? sanitizeFilename(attached) : null);

      const errors = {};
      if (!Number.isFinite(stageIdTpl)) errors.StageIDtemplet = "معرّف القالب غير صالح";
      if (!isNonEmpty(cleanType)) errors.Type = "النوع مطلوب";
      if (!isNonEmpty(cleanName) || !lenBetween(cleanName, 2, 150)) errors.StageName = "اسم المرحلة مطلوب (2–150)";
      if (!Number.isFinite(daysInt)) errors.Days = "الأيام يجب أن تكون عددًا صحيحًا ≥ 0";
      if (!Number.isFinite(ratioNum)) errors.Ratio = "النسبة (0–100)";
      if (Object.keys(errors).length) return res.status(200).json({ error: errors });

      // جلب المرحلة مع مجموع نسب النوع
      const stage = await SELECTFROMTableStageTempletaObject(
        stageIdTpl,
        userSession?.IDCompany,
        `,(SELECT SUM(Ratio) FROM StagesTemplet WHERE trim(Type)=trim('${cleanType}') AND IDCompany=${userSession?.IDCompany}) AS TotalRatio`
      );
            console.log(errors,stage);

      if (!stage) return res.status(404).json({ error: "المرحلة غير موجودة" });

      // فحص ملف مرفق اختياري
      if (req.file) {
        const mime = String(req.file.mimetype || "");
        const size = Number(req.file.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ error: "نوع المرفق غير مدعوم" });
        if (size > MAX_FILE_SIZE)        return res.status(200).json({ error: "حجم المرفق يتجاوز 15MB" });
        await uploaddata(req.file);
        await implmentOpreationSingle("upload", attachedName);
      }

      // إصلاح جمع النِّسب: (المجموع الحالي - نسبة القديمة + الجديدة) لأن SUM يشمل الحالية
      const oldRatio  = Number(stage?.Ratio || 0);
      const totalNow  = Number(stage?.TotalRatio || 0);
      const newTotal  = cleanType !== "عام" ? (totalNow - oldRatio + ratioNum) : ratioNum;
      if (newTotal > 100) {
        return res.status(200).json({ error: "مجموع النسب لا يجب أن يتجاوز 100" });
      }

      // بناء اسم نهائي يحافظ على رقم الترتيب الموجود بين قوسين (إن وُجد)
      const originalName = String(stage?.StageName || "");
      const matchIdx = originalName.match(/\((\d{1,4})\)\s*$/);
      const idx = matchIdx ? matchIdx[1] : null;
      const finalStageName = idx ? `${cleanName} (${idx})` : cleanName;

      // تحديث جدول القوالب (نمرر payload منقّح بدل req.body الخام)
      const payload = {
        StageIDtemplet: stageIdTpl,
        Type: cleanType,
        StageName: cleanName,
        Days: daysInt,
        Ratio: ratioNum,
        attached: attachedName
      };
      await UPDATETablecompanySubProjectStagetemplet(payload, userSession?.IDCompany, res);

      // تحديث المراحل المفتوحة المنسوخة من القالب
      await UPDATEStopeProjectStageCUSTv2([
        cleanType,
        finalStageName,
        daysInt,
        Math.round(ratioNum),
        attachedName,
        stageIdTpl,
      ]);

      return res.status(200).json({ success: "تمت العملية بنجاح" });
    } catch (error) {
      console.error("UpdateStageHome error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
    }
  };
};

// ===== UpdateStageSub =====
const UpdateStageSub = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      const { StageSubID, StageSubName } = req.body || {};
      const subId   = parsePositiveInt(StageSubID);
      const subName = sanitizeName(StageSubName);
      const fileFromReq = req.file ? sanitizeFilename(req.file.filename) : null;

      const errors = {};
      if (!Number.isFinite(subId)) errors.StageSubID = "معرّف الخطوة غير صالح";
      if (!isNonEmpty(subName) || !lenBetween(subName, 2, 150)) errors.StageSubName = "اسم الخطوة مطلوب (2–150)";
      if (Object.keys(errors).length) return res.status(200).json({ error: errors });

      let attached = null;
      if (fileFromReq) {
        const mime = String(req.file.mimetype || "");
        const size = Number(req.file.size || 0);
        if (!ALLOWED_MIMES.includes(mime)) return res.status(200).json({ error: "نوع المرفق غير مدعوم" });
        if (size > MAX_FILE_SIZE)        return res.status(200).json({ error: "حجم المرفق يتجاوز 15MB" });
        attached = fileFromReq;
        await uploaddata(req.file);
        implmentOpreationSingle("upload", attached);
      }

      if (!attached) {
        await UPDATETablecompanySubProjectStageSubtemplet([
          subName,
          subId,
          userSession.IDCompany,
        ]);
      } else {
        await UPDATETablecompanySubProjectStageSubtemplet(
          [subName, attached, subId, userSession.IDCompany],
          "StageSubName=?, attached=?"
        );
      }

      // مزامنة اسم/مرفق الخطوة في النسخ المُنشأة من هذا القالب
      await UPDATETablecompanySubProjectStagesSubv2([
        subName,
        attached,
        subId,
      ]);

      return res.status(200).json({ success: "تمت العملية بنجاح" });
    } catch (error) {
      console.error("UpdateStageSub error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
    }
  };
};

// ===== UpdateTypeTemplet =====
const UpdateTypeTemplet = () => {
  return async (req, res) => {
    try {
      const { Type, id } = req.body || {};
      const userSession = req.session?.user;
      if (!userSession) return res.status(401).send("Invalid session");

      const cleanType = sanitizeName(Type);
      const typeId    = parsePositiveInt(id);

      const errors = {};
      if (!Number.isFinite(typeId)) errors.id = "معرّف النوع غير صالح";
      if (!isNonEmpty(cleanType) || !lenBetween(cleanType, 1, 100)) errors.Type = "اسم النوع مطلوب (1–100)";
      if (Object.keys(errors).length) return res.status(200).json({ error: errors });

      await UPDATETableStagetype(cleanType, typeId, userSession.IDCompany);
      return res.status(200).json({ success: "تمت العملية بنجاح" });
    } catch (error) {
      console.error("UpdateTypeTemplet error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
    }
  };
};

module.exports = {
  UpdateStageHome,
  UpdateStageSub,
  UpdateTypeTemplet
};
