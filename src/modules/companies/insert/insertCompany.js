const { verificationfromdata, convertArabicToEnglish, esc,  isDigits,
  isExactDigits,
  isNonEmpty,
  lenBetween,isEmail,isValidUrl,parseAmount } = require("../../../../middleware/Aid");
const {
  insertTablecompanySub,
  insertTableLinkevaluation,
  insertTableFinancialCustody,
  insertTablecompanycompanyRegistration,
} = require("../../../../sql/INsertteble");
const {
  SELECTTablecompanySubID,
  SELECTTablecompanySubCount,
  SelectVerifycompanyexistence,
  SELECTTablecompanyName,
  SELECTTablecompanySubLinkevaluation,
  SELECTTablecompany,
  SELECTTableMaxFinancialCustody,
} = require("../../../../sql/selected/selected");
const {
  SELECTTableusersCompanyVerification,
  SELECTTableusersall,
} = require("../../../../sql/selected/selectuser");
const {
  UpdateTableinnuberOfcurrentBranchescompany,
  UpdateTableLinkevaluation,
} = require("../../../../sql/update");
const { verificationSend } = require("../select/userCompanyselect");
const { CovenantNotfication } = require("../../notifications/NotifcationProject");
const { CheckAdmin, CheckGlobal } = require("./insertuserCompany");

// اضافة شركة جديدة
// ====== Helpers: تطبيع الأرقام العربية + أدوات بسيطة للتحقق ======

const translaeteArabic = (char) => {
  switch (char) {
    case "CommercialRegistrationNumber": return "رقم السجل التجاري";
    case "NameCompany": return "اسم الشركة";
    case "BuildingNumber": return "رقم المبنى";
    case "StreetName": return "اسم الشارع";   
    case "NeighborhoodName": return "اسم الحي";
    case "PostalCode": return "الرمز البريدي";
    case "City": return "المدينة";

    case "Country": return "الدولة";
    case "TaxNumber": return "الرقم الضريبي";
    case "PhoneNumber": return "رقم الجوال";
    case "userName": return "اسم المستخدم";
    default: return char;
  }
};

// ====== المعالج الرئيسي ======
const insertDataCompany = () => {
  return async (req, res) => {
    try {
      // --- 1) التقاط وتطبيع القيم
      const body = req.body || {};

      const raw = {
        CommercialRegistrationNumber: body.CommercialRegistrationNumber,
        NameCompany: body.NameCompany,
        BuildingNumber: body.BuildingNumber,
        StreetName: body.StreetName,
        NeighborhoodName: body.NeighborhoodName,
        PostalCode: body.PostalCode,
        City: body.City,
        Country: body.Country,
        TaxNumber: body.TaxNumber,
        Api: body.Api,
        PhoneNumber: body.PhoneNumber,
        userName: body.userName,
      };
      // تطبيع الأرقام العربية للحقول الرقمية
      const normalized = {
        CommercialRegistrationNumber: convertArabicToEnglish(raw.CommercialRegistrationNumber),
        NameCompany: String(raw.NameCompany || "").trim(),
        BuildingNumber: convertArabicToEnglish(raw.BuildingNumber),
        StreetName: String(raw.StreetName || "").trim(),
        NeighborhoodName: String(raw.NeighborhoodName || "").trim(),
        PostalCode: convertArabicToEnglish(raw.PostalCode),
        City: String(raw.City || "").trim(),
        Country: String(raw.Country || "").trim(),
        TaxNumber: convertArabicToEnglish(raw.TaxNumber),
        Api: String(raw.Api || "").trim(),
        PhoneNumber: convertArabicToEnglish(raw.PhoneNumber),
        userName: String(raw.userName || "").trim(),
      };

      // --- 2) تحقق يدوي من المدخلات (بدون مكتبات)
      const errors = {};

      // الحقول المطلوبة
      Object.entries(normalized).forEach(([k, v]) => {
        if (!isNonEmpty(v)) errors[k] = `${translaeteArabic(k)} هذا الحقل مطلوب`;
      });

      // قواعد خاصة
      if (normalized.NameCompany && !lenBetween(normalized.NameCompany, 2, 100)) {
        errors.NameCompany = "اسم الشركة يجب أن يكون بين 2 و 100 حرف";
      }

      if (normalized.userName && !lenBetween(normalized.userName, 3, 50)) {
        errors.userName = "اسم المستخدم يجب ألا يقل عن 3 أحرف";
      }

      if (normalized.CommercialRegistrationNumber && !isDigits(normalized.CommercialRegistrationNumber)) {
        errors.CommercialRegistrationNumber = "رقم السجل التجاري يجب أن يحتوي على أرقام فقط";
      }

      if (normalized.BuildingNumber && !isDigits(normalized.BuildingNumber)) {
        errors.BuildingNumber = "رقم المبنى يجب أن يحتوي على أرقام فقط";
      }

      // الرمز البريدي السعودي (خمسة أرقام)
      if (normalized.PostalCode && !isExactDigits(normalized.PostalCode, 5)) {
        errors.PostalCode = "الرمز البريدي يجب أن يتكون من 5 أرقام";
      }

      // if (normalized.TaxNumber && !isDigits(normalized.TaxNumber)) {
      //   errors.TaxNumber = "الرقم الضريبي يجب أن يحتوي على أرقام فقط";
      // }

      // رقم الجوال: 9 أرقام، مع السماح بصفر بادئ (يُحذف)
      // if (normalized.PhoneNumber) {
      //   const pn = normalized.PhoneNumber;
      //   if (!/^0?\d{9}$/.test(pn)) {
      //     errors.PhoneNumber = "رقم الجوال غير صالح، استخدم 0XXXXXXXXX أو 9 أرقام بدون صفر";
      //   }
      // }

      // Api: مجرد نص غير فارغ (قد يكون مفتاح/Token وليس رابط)
      if (normalized.Api && !isNonEmpty(normalized.Api)) {
        errors.Api = "قيمة API مطلوبة";
      }

      // إرجاع أخطاء التحقق إن وجدت
      if (Object.keys(errors).length > 0) {
        return res.status(200).send({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors,
        });
      }

      // --- 3) تجهيز رقم الجوال النهائي (حذف الصفر إن وُجد)
      let phoneNo = normalized.PhoneNumber.replace(/^0/, "");

      // --- 4) تحقق من تكامل البيانات عبر دالتك الداخلية (إن كانت مطلوبة في منطقك)
      const isDataValid = await verificationfromdata([
        normalized.CommercialRegistrationNumber,
        normalized.NameCompany,
        normalized.BuildingNumber,
        normalized.StreetName,
        normalized.NeighborhoodName,
        normalized.PostalCode,
        normalized.City,
        normalized.Country,
        normalized.TaxNumber,
        normalized.Api,
        normalized.PhoneNumber,
        normalized.userName,
      ]);

      if (!isDataValid) {
        return res.status(200).send({
          success: "يجب إكمال جميع البيانات المطلوبة",
          message: "يجب إكمال جميع البيانات المطلوبة",
        });
      }

      // --- 5) تحقق من وجود الشركة مسبقاً
      const existingCompany = await SelectVerifycompanyexistence(
        normalized.CommercialRegistrationNumber,
        "companyRegistration"
      );
      if (existingCompany) {
        return res.status(200).send({
          success: "الشركة موجودة بالفعل",
          message: "الشركة موجودة بالفعل",
        });
      }

      // --- 6) تحقق من أن رقم الجوال غير مستخدم
      const phoneUsed = await SELECTTableusersCompanyVerification(phoneNo);
      if (Array.isArray(phoneUsed) && phoneUsed.length > 0) {
        return res.status(200).send({
          success: "الرقم مستخدم بالفعل في حساب بإحدى الشركات",
          message: "الرقم مستخدم بالفعل في حساب بإحدى الشركات",
        });
      }

      // --- 7) الإدخال في قاعدة البيانات (مع الحماية/الهروب)
      await insertTablecompanycompanyRegistration([
        convertArabicToEnglish(esc(normalized.CommercialRegistrationNumber)),
        esc(normalized.NameCompany),
        convertArabicToEnglish(esc(normalized.BuildingNumber)),
        esc(normalized.StreetName),
        esc(normalized.NeighborhoodName),
        convertArabicToEnglish(esc(normalized.PostalCode)),
        esc(normalized.City),
        esc(normalized.Country),
        convertArabicToEnglish(esc(normalized.TaxNumber)),
        String(esc(normalized.Api)),
        convertArabicToEnglish(esc(phoneNo)),
        esc(normalized.userName),
      ]);

      // --- 8) إشعار
      await sendNotificationCompany(normalized.NameCompany);

      // --- 9) رد النجاح
      return res.status(200).send({
        success: "نرحب بك في منصة مشرف، سيتم مراجعة بياناتك وفتح الحساب فور التحقق من صحتها.",
        message:
          "نرحب بك في منصة مشرف، سيتم مراجعة بياناتك وفتح الحساب فور التحقق من صحتها.",
      });
    } catch (error) {
      console.error("Insert company error:", error);
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تنفيذ العملية، يرجى المحاولة لاحقاً.",
      });
    }
  };
};


const sendNotificationCompany = async (name) => {
  try {
    let array = [
      "582405952",
      "502464530",
      "567256943",
      "564565001",
      "570635004",
    ];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      await verificationSend(element, null, `طلب انشاء حساب جديد من ${name}`);
    }
  } catch (error) {
    console.log(error);
  }
};
const sendNotificationalluser = async (name) => {
  try {
    const arrayuser = await SELECTTableusersall();

    for (let index = 0; index < arrayuser.length; index++) {
      const element = arrayuser[index];
      await verificationSend(element.PhoneNumber, null, `عميلنا العزيز يوجد تحديث جديد للمنصة عن طريق المتجر`);
    }
  } catch (error) {
    console.log(error);
  }
};

// sendNotificationalluser();
//  اضافة فرع جديد
// ===== المعالج الرئيسي =====
const inseertCompanybrinsh = () => {
  return async (req, res) => {
    try {
      // 1) التقاط القيم + تطبيع
      const {
        NumberCompany,
        NameSub,
        BranchAddress,
        Email,
        PhoneNumber,
        check,
        checkGloble, // إبقاء نفس التسمية المستخدمة لديك
      } = req.body || {};

      const normalized = {
        NumberCompany: convertArabicToEnglish(NumberCompany),
        NameSub: String(NameSub ?? "").trim(),
        BranchAddress: String(BranchAddress ?? "").trim(),
        Email: String(Email ?? "").trim().toLowerCase(),
        PhoneNumber: PhoneNumber,
        check: Number.isFinite(Number(check)) ? Number(check) : 0,
        checkGloble, // قد يكون object/array حسب منطقك الحالي
      };

      // 2) تحقق يدوي من المدخلات
      const errors = {};

      // if (!isNonEmpty(normalized.NumberCompany) || !isDigits(normalized.NumberCompany)) {
      //   errors.NumberCompany = "رقم الشركة مطلوب ويجب أن يكون أرقاماً فقط";
      // }
      if (!isNonEmpty(normalized.NameSub) || !lenBetween(normalized.NameSub, 2, 100)) {
        errors.NameSub = "اسم الفرع مطلوب (2 إلى 100 حرف)";
      }
      if (!isNonEmpty(normalized.BranchAddress) || !lenBetween(normalized.BranchAddress, 4, 200)) {
        errors.BranchAddress = "عنوان الفرع مطلوب (4 إلى 200 حرف)";
      }

      // if (!isNonEmpty(normalized.Email) && !isEmail(normalized.Email)) {
      //   errors.Email = "البريد الإلكتروني غير صالح";
      // }

      // رقم الجوال اختياري؛ إن وُجد نتحقق من 9 أرقام محلية بعد التطبيع
      // if (!isNonEmpty(PhoneNumber)) {
      //   if (!/^\d{9}$/.test(normalized.PhoneNumber)) {
      //     errors.PhoneNumber = "رقم الجوال غير صالح؛ يجب أن يتكون من 9 أرقام محلية";
      //   }
      // }

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors,
        });
      }

      // 3) التأكد من وجود الشركة الأساسية
      const companyRow = await SELECTTablecompanyName(normalized.NumberCompany);
      if (!companyRow) {
        return res.status(200).json({
          success:  "يرجى إنشاء حساب شركة قبل البدء بالفروع",
          message: "يرجى إنشاء حساب شركة قبل البدء بالفروع",
        });
      }

      // 4) التحقق من وجود الفرع مسبقاً
      const existingBranch = await SELECTTablecompanySubID(
        normalized.NameSub,
        normalized.NumberCompany
      );
      if (existingBranch) {
        return res.status(409).json({
          success:  "الفرع موجود مسبقاً",
          message: "الفرع موجود مسبقاً",
        });
      }

      // 5) الإدخال في قاعدة البيانات (مع الحماية/الهروب إن كانت دوالك متوفرة)
     const listID =  await insertTablecompanySub([
        convertArabicToEnglish(esc(normalized.NumberCompany)),
        esc(normalized.NameSub),
        esc(normalized.BranchAddress),
        isNonEmpty(normalized.Email) ? esc(normalized.Email) : null,
        isNonEmpty(PhoneNumber) ? convertArabicToEnglish(esc(normalized.PhoneNumber)) : null,
      ]);

      if (!listID || !listID) {
        // حالة نادرة: لم نستطع جلب المعرّف
        return res.status(500).json({
          success:  "تم إنشاء الفرع لكن حدثت مشكلة في استرجاع المعرّف",
          message: "تم إنشاء الفرع لكن حدثت مشكلة في استرجاع المعرّف",
        });
      }

      // 7) تعيينات إضافية (مشرف/عمومي) حسب منطقك
      if (normalized.check > 0) {
        await CheckAdmin(normalized.check, listID);
      }

      const globalEntries =
        normalized.checkGloble !== undefined ? Object.entries(normalized.checkGloble) : [];
      if (globalEntries.length > 0) {
        await CheckGlobal(normalized.checkGloble, listID);
      }

      // 8) تحديث عداد الفروع للشركة
      const countBransh = await SELECTTablecompanySubCount(normalized.NumberCompany);
      const total = Array.isArray(countBransh) && countBransh[0] && countBransh[0]["COUNT(*)"]
        ? countBransh[0]["COUNT(*)"]
        : 0;
      await UpdateTableinnuberOfcurrentBranchescompany([total, normalized.NumberCompany]);

      // 9) رد النجاح
      return res.status(200).json({
        success:  "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
      });

    } catch (error) {
      console.error("insertCompanyBranch error:", error);
      return res.status(500).json({
        success:  "يوجد خطأ في العملية التي قمت بها",
        message: "يوجد خطأ في العملية التي قمت بها",
      });
    }
  };
};


// اضافة رابط تقييم الجودة


const InsertLinkevaluation = () => {
  return async (req, res) => {
    try {
      const { IDcompanySub, Linkevaluation } = req.body || {};

      // 1) تطبيع ومدخلات جاهزة للتحقق
      const idStr = convertArabicToEnglish(IDcompanySub);
      const link  = String(Linkevaluation ?? "").trim();

      // 2) تحقق يدوي
      const errors = {};
      if (!isNonEmpty(idStr) || !isDigits(idStr) || Number(idStr) <= 0) {
        errors.IDcompanySub = "معرّف الفرع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      }
      if (!isNonEmpty(link)) {
        errors.Linkevaluation = "الرابط مطلوب";
      } else if (link.length > 2048) {
        errors.Linkevaluation = "طول الرابط كبير جداً";
      } else if (!isValidUrl(link)) {
        errors.Linkevaluation = "صيغة الرابط غير صحيحة (يجب أن يبدأ بـ http أو https)";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors,
        });
      }

      // 3) موجود؟ حدّث، وإلا أنشئ
      const existing = await SELECTTablecompanySubLinkevaluation(Number(idStr));
      if (existing) {
        await UpdateTableLinkevaluation([esc(link), convertArabicToEnglish(esc(idStr))]);
        return res.status(200).json({
          success:  "تم تحديث رابط التقييم بنجاح",
          message: "تم تحديث رابط التقييم بنجاح",
        });
      } else {
        await insertTableLinkevaluation([convertArabicToEnglish(esc(idStr)), esc(link)]);
        return res.status(200).json({
          success: "تم إنشاء رابط التقييم بنجاح",
          message: "تم إنشاء رابط التقييم بنجاح",
        });
      }
    } catch (error) {
      console.error("insertLinkEvaluation error:", error);
      return res.status(500).json({
        success: "فشل تنفيذ العملية",
        message: "فشل تنفيذ العملية",
      });
    }
  };
};

// الحفاظ على الاسم القديم إن كان مستخدماً في المشروع


// اغلاق عمليات المالية يدوياً
const OpenOrCloseopreationStopfinance = () => {
  return async (req, res) => {
    try {
      const id = req.query.idCompany;
      let DisabledFinance;
      const data = await SELECTTablecompany(id);
      if (data.DisabledFinance === "true") {
        DisabledFinance = "false";
      } else {
        DisabledFinance = "true";
      }
      await UpdateTableinnuberOfcurrentBranchescompany(
        [DisabledFinance, id],
        "DisabledFinance"
      );
      res
        .send({
          success: "تمت العملية بنجاح",
          DisabledFinance: DisabledFinance,
        })
        .status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};

//  طلبات العهد

const insertRequestFinancialCustody = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) التقاط القيم من الطلب + تطبيع
      const { IDCompanySub, Amount, Statement } = req.body || {};
      const IDCompany   = userSession.IDCompany;
      const Requestby   = String(userSession.PhoneNumber ?? "").trim();

      const idCompanySubStr = convertArabicToEnglish(IDCompanySub);
      const idCompanySub    = isDigits(idCompanySubStr) ? Number(idCompanySubStr) : NaN;
      const amountNum       = parseAmount(Amount);
      const statementStr    = String(Statement ?? "").trim();

      // 3) تحقق يدوي للمدخلات
      const errors = {};
      if (!Number.isFinite(idCompanySub) || idCompanySub <= 0) {
        errors.IDCompanySub = "معرّف الفرع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      }
      if (!isNonEmpty(statementStr)) {
        errors.Statement = "بيان/وصف الطلب مطلوب";
      } else if (statementStr.length > 500) {
        errors.Statement = "بيان الطلب طويل جداً (الحد الأقصى 500 حرف)";
      }
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        errors.Amount = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
      }
      if (!isNonEmpty(IDCompany)) {
        errors.IDCompany = "لم يتم العثور على الشركة في الجلسة";
      }
      if (!isNonEmpty(Requestby)) {
        errors.Requestby = "لم يتم العثور على رقم مقدم الطلب في الجلسة";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).json({
          success:  "أخطاء في التحقق من المدخلات",
          message: "أخطاء في التحقق من المدخلات",
          errors,
        });
      }

      // 4) حساب رقم الطلب التالي (idOrder)
      const maxOrder = await SELECTTableMaxFinancialCustody(idCompanySub);
      const last = Number(maxOrder?.last_id);
      const idOrder = Number.isFinite(last) && last >= 1 ? last + 1 : 1;

      // 5) الإدخال في قاعدة البيانات (مع الحماية/الهروب إن كانت دوالك متوفرة)
      await insertTableFinancialCustody([
        idOrder,
        convertArabicToEnglish(esc(IDCompany)),
        idCompanySub,                                  // رقم صحيح بالفعل
        esc(Requestby),
        amountNum,                                     // رقم عشري مُنقّح
        esc(statementStr),
      ]);

      // 6) إشعار (لا نفشل العملية لو أخفق الإشعار)
      try {
        await CovenantNotfication(idCompanySub, Requestby);
      } catch (notifyErr) {
        console.warn("CovenantNotfication failed:", notifyErr);
      }

      // 7) رد النجاح
      return res.status(200).json({
        success: "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        idOrder,
      });

    } catch (error) {
      console.error("insertRequestFinancialCustody error:", error);
      return res.status(500).json({
        success: "فشل تنفيذ العملية",
        message: "فشل تنفيذ العملية",
      });
    }
  };
};




module.exports = {
  insertDataCompany,
  inseertCompanybrinsh,
  InsertLinkevaluation,
  OpenOrCloseopreationStopfinance,
  insertRequestFinancialCustody,
};
