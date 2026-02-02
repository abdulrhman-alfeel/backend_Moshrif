const {
  DeleteTableFinancialCustody,
  DeleteTablecompanySubProjectall,
} = require("../../../../sql/delete");
const {
  insertTableuserComppany,
  insertTablecompany,
  insertTableBranchdeletionRequests,
} = require("../../../../sql/INsertteble");
const {
  SELECTTablecompanyName,
  SELECTTablecompanyRegistration,
  SelectVerifycompanyexistencePhonenumber,
  SelectVerifycompanyexistence,
  SELECTTableBranchdeletionRequests,
  SELECTTABLEcompanyProjectall,
  SELECTTablecompanySubID,
} = require("../../../../sql/selected/selected");
const {
  SELECTTableusersCompanyVerification,
} = require("../../../../sql/selected/selectuser");

const {
  UpdateTablecompanySub,
  UpdateTablecompany,
  UPDATETableFinancialCustody,
  UpdateTableinnuberOfcurrentBranchescompany,
  UpdateTablecompanyRegistration,
} = require("../../../../sql/update");
const { CovenantNotfication } = require("../../notifications/NotifcationProject");
const bcrypt = require("bcrypt");
const { opreationDeletProject } = require("./UpdateProject");
const { verificationSend } = require("../select/userCompanyselect");

const {
  convertArabicToEnglish,
  Addusertraffic,
  parseNonNegativeFloat,
  parsePositiveInt,
  isNonEmpty,
  lenBetween,
  isDigits,
  esc,
  normalizePhone,
  isEmail,
} = require("../../../../middleware/Aid");


const UpdateDataCompany = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(200).send({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل حركة المستخدم (كما في كودك)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateDataCompany");
      } catch (e) {
        // لا تُسقط العملية عند فشل التسجيل
        console.warn("Addusertraffic failed:", e);
      }

      // 3) التقاط وتطبيع المدخلات
      const {
        NameCompany,
        BuildingNumber,
        StreetName,
        NeighborhoodName,
        PostalCode,
        City,
        Country,
        TaxNumber,
        Cost,
        id,
      } = req.body || {};
      const CommercialRegistrationNumber = req.body?.CommercialRegistrationNumber;

      const idNum         = parsePositiveInt(id);
      const nameStr       = String(NameCompany ?? "").trim();
      const buildNumStr   = convertArabicToEnglish(BuildingNumber).replace(/\D/g, "");
      const streetStr     = String(StreetName ?? "").trim();
      const neighStr      = String(NeighborhoodName ?? "").trim();
      const postalStr     = convertArabicToEnglish(PostalCode).replace(/\D/g, "");
      const cityStr       = String(City ?? "").trim();
      const countryStr    = String(Country ?? "").trim();
      const taxStr        = convertArabicToEnglish(TaxNumber).replace(/\D/g, "");
      const costNum       = parseNonNegativeFloat(Cost);
      const crnStr        = CommercialRegistrationNumber != null && CommercialRegistrationNumber !== ""
                              ? convertArabicToEnglish(CommercialRegistrationNumber).replace(/\D/g, "")
                              : null;

      // 4) تحقق يدوي للمدخلات
      const errors = {};
      if (!Number.isFinite(idNum)) errors.id = "المُعرّف مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 100))
        errors.NameCompany = "اسم الشركة مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(buildNumStr) || !isDigits(buildNumStr))
        errors.BuildingNumber = "رقم المبنى مطلوب ويجب أن يتكون من أرقام فقط";
      if (!isNonEmpty(streetStr) || !lenBetween(streetStr, 2, 100))
        errors.StreetName = "اسم الشارع مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(neighStr) || !lenBetween(neighStr, 2, 100))
        errors.NeighborhoodName = "اسم الحي مطلوب (2 إلى 100 حرف)";
      // الرمز البريدي السعودي: 5 أرقام
      if (!/^\d{5}$/.test(postalStr)) errors.PostalCode = "الرمز البريدي يجب أن يتكون من 5 أرقام";
      if (!isNonEmpty(cityStr) || !lenBetween(cityStr, 2, 100))
        errors.City = "اسم المدينة مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(countryStr) || !lenBetween(countryStr, 2, 100))
        errors.Country = "اسم الدولة مطلوب (2 إلى 100 حرف)";
      // الرقم الضريبي: أرقام فقط (مثلاً في السعودية 15 رقماً، نسمح 10–15 لتفادي رفض بيانات تاريخية)
      // if (!isNonEmpty(taxStr) || !/^\d{10,15}$/.test(taxStr))
      //   errors.TaxNumber = "الرقم الضريبي يجب أن يتكون من 10 إلى 15 رقماً";
      // التكلفة: اختيارية؛ إن وُجدت يجب أن تكون ≥ 0
      if (req.body.hasOwnProperty("Cost") && !Number.isFinite(costNum))
        errors.Cost = "التكلفة (إن وُجدت) يجب أن تكون رقماً صفرياً أو موجباً";
      // السجل التجاري (اختياري) إن وُجد يجب أن يكون أرقاماً فقط
      if (crnStr !== null && crnStr !== "" && !isDigits(crnStr))
        errors.CommercialRegistrationNumber = "رقم السجل التجاري يجب أن يحتوي على أرقام فقط";

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: false, message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) تحضير بيانات التحديث وفق وجود السجل التجاري
      if (crnStr === null || crnStr === "") {
        // بدون تحديث السجل التجاري
        await UpdateTablecompany([
          esc(nameStr),
          convertArabicToEnglish(esc(buildNumStr)),
          esc(streetStr),
          esc(neighStr),
          convertArabicToEnglish(esc(postalStr)),
          esc(cityStr),
          esc(countryStr),
          convertArabicToEnglish(esc(taxStr)),
          // إن لم تُرسل التكلفة نمرر 0 (أو يمكنك الإبقاء على القيمة القديمة بمنطق مختلف إذا كانت دالتك تدعم UPDATE جزئي)
          convertArabicToEnglish(esc(Number.isFinite(costNum) ? costNum : 0)),
          convertArabicToEnglish(esc(idNum)),
        ]);
      } else {
        // مع تحديث السجل التجاري
        await UpdateTablecompany(
          [
            esc(nameStr),
            convertArabicToEnglish(esc(buildNumStr)),
            esc(streetStr),
            esc(neighStr),
            convertArabicToEnglish(esc(postalStr)),
            esc(cityStr),
            esc(countryStr),
            convertArabicToEnglish(esc(taxStr)),
            convertArabicToEnglish(esc(Number.isFinite(costNum) ? costNum : 0)),
            convertArabicToEnglish(esc(crnStr)),
            convertArabicToEnglish(esc(idNum)),
          ],
          ",CommercialRegistrationNumber=?"
        );
      }

      // 6) نجاح
      return res.status(200).send({ success:  "تمت العملية بنجاح" , message: "تمت العملية بنجاح" });

    } catch (err) {
      console.error("UpdateDataCompany error:", err);
      return res.status(500).send({ success: "فشل في تنفيذ العملية", message: "فشل في تنفيذ العملية" });
    }
  };
};


const UpdateApiCompany = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(200).send({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateApiCompany");
      } catch (e) {
        console.warn("Addusertraffic failed:", e);
      }

      // 3) التقاط/تطبيع id
      const idNum = parsePositiveInt(req.query?.id);
      if (!Number.isFinite(idNum)) {
        return res.status(200).send({
          success: false,
          message: "معرّف الشركة غير صالح (يجب أن يكون رقماً صحيحاً موجباً)",
        });
      }

      // 4) التحقق من وجود الشركة
      const company = await SELECTTablecompanyName(idNum);
      if (!company) {
        return res.status(200).send({ success: false, message: "لا توجد الشركة المطلوبة" });
      }

      // 5) تجهيز السجل التجاري واستخراج الأرقام فقط
      const crnRaw = String(company?.CommercialRegistrationNumber ?? "").trim();
      const crnDigits = convertArabicToEnglish(crnRaw).replace(/\D/g, "");
      if (!crnDigits) {
        return res.status(200).send({
          success:  "لا يوجد سجل تجاري صالح للشركة لتوليد API",
          message: "لا يوجد سجل تجاري صالح للشركة لتوليد API",
        });
      }

      // 6) توليد الـ Hash عبر bcrypt (بشكل آمن)
      const hash = await bcrypt.hash(crnDigits, 10);

      // 7) التحديث في قاعدة البيانات (حقل Api كما في كودك)
      await UpdateTableinnuberOfcurrentBranchescompany(
        [esc(hash), convertArabicToEnglish(esc(idNum))],
        "Api"
      );

      // 8) ردّ النجاح
      return res.status(200).send({
        success: "تمت العملية بنجاح",
        message: "تمت العملية بنجاح",
        data: hash, // ملاحظة أمنية: إرجاع الـ hash اختياري؛ إن أردت إخفاءه احذفه من الرد.
      });

    } catch (err) {
      console.error("UpdateApiCompany error:", err);
      return res.status(500).json({ success: "فشل في تنفيذ العملية", message: "فشل في تنفيذ العملية" });
    }
  };
};



const AgreedRegistrationCompany = () => {
  return async (req, res) => {
    try {
      const id = req.query.id;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "AgreedRegistrationCompany"
      );


  
      const dataCompany = await SELECTTablecompanyRegistration(parseInt(id));
      if (Boolean(dataCompany)) {
    const existingCompany = await SelectVerifycompanyexistence(dataCompany?.CommercialRegistrationNumber);
      if (existingCompany) {
        // في حال كانت الشركة موجودة بالفعل، نحذف طلب التسجيل ونكتفي
        await DeleteTablecompanySubProjectall("companyRegistration", "id", id);
        return res.status(200).send({
          success: "الشركة مسجّلة بالفعل",
          message: "الشركة مسجّلة بالفعل",
        });
      }
        await bcrypt.hash(
          `${dataCompany?.CommercialRegistrationNumber}`,
          10,
          async function (err, hash) {
            await insertTablecompany([
              dataCompany?.CommercialRegistrationNumber,
              dataCompany?.NameCompany,
              dataCompany?.BuildingNumber,
              dataCompany?.StreetName,
              dataCompany?.NeighborhoodName,
              dataCompany?.PostalCode,
              dataCompany?.City,
              dataCompany?.Country,
              dataCompany?.TaxNumber,
              hash,
            ]);
            const checkCompany = await SelectVerifycompanyexistence(
              dataCompany?.CommercialRegistrationNumber
            );
            if (Boolean(checkCompany)) {
              await insertTableuserComppany([
                checkCompany?.id,
                dataCompany?.userName,
                0,
                dataCompany?.PhoneNumber,
                "Admin",
                "موظف",
                "Admin",
                JSON.stringify([]),
              ]);
              // console.log("checkCompany", checkCompany);
              // await DeleteTablecompanySubProjectall(
              //   "companyRegistration",
              //   "id",
              //   id
              // );
              await verificationSend(
                dataCompany?.PhoneNumber,
                null,
                `تم قبول طلب تسجيل شركتك في منصة مشرف`
              );

              res
                .send({ success: "تمت العملية بنجاح", data: `${hash}` })
                .status(200);
            }
          }
        );
      }
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية" }).status(402);
    }
  };
};




// قبول تسجيل الشركة
// const AgreedRegistrationCompany = () => {
//   return async (req, res) => {
//     try {
//       // 1) التحقق من الجلسة
//       const userSession = req.session?.user;
//       if (!userSession) {
//         return res.status(200).send({ success: false, message: "Invalid session" });
//       }

//       // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
//       try {
//         Addusertraffic(
//           userSession.userName,
//           userSession?.PhoneNumber,
//           "AgreedRegistrationCompany"
//         );
//       } catch (e) { /* اختياري: console.warn */ }

//       // 3) قراءة/تحقق المعرّف
//       const idNum = parsePositiveInt(req.query?.id);
//       if (!Number.isFinite(idNum)) {
//         return res.status(200).send({ success: "المعرّف غير صالح" , message: "المعرّف غير صالح" });
//       }

//       // 4) جلب طلب التسجيل
//       const dataCompany = await SELECTTablecompanyRegistration(idNum);
//       if (!dataCompany) {
//         return res.status(200).json({ success:  "لم يتم العثور على طلب التسجيل", message: "لم يتم العثور على طلب التسجيل" });
//       }

//       // 5) تحقق من البيانات الأساسية في الطلب
//       const crnDigits = convertArabicToEnglish(dataCompany?.CommercialRegistrationNumber);
//       const phoneLocal = normalizePhone(dataCompany?.PhoneNumber);
//       const nameStr = String(dataCompany?.NameCompany ?? "").trim();
     
//       const existingCompany = await SelectVerifycompanyexistence(crnDigits);
//       if (existingCompany) {
//         // في حال كانت الشركة موجودة بالفعل، نحذف طلب التسجيل ونكتفي
//         await DeleteTablecompanySubProjectall("companyRegistration", "id", idNum);
//         return res.status(200).send({
//           success: "الشركة مسجّلة بالفعل",
//           message: "الشركة مسجّلة بالفعل",
//         });
//       }
//       // 10) التحقق من المستخدم (الجوال) قبل إنشاء المستخدم الإداري
//       const existUser = await SELECTTableusersCompanyVerification(phoneLocal);
//       if (Array.isArray(existUser) && existUser.length > 0) {
//         // في حال الرقم مستخدم، نحذف الشركة التي أنشأناها للتو؟ (حسب منطقك)
//         // أو فقط نُرجع خطأ. هنا نرجع 409 ونبقي الشركة (يمكنك تعديل المنطق).
//         return res.status(200).send({
//           success:  "رقم الجوال مستخدم بالفعل في حساب شركة",
//           message: "رقم الجوال مستخدم بالفعل في حساب شركة",
//         });
//       }



//       // 7) توليد API hash من السجل التجاري
//       const hash = await bcrypt.hash(crnDigits, 10);

//       // 8) إدراج الشركة الجديدة
//       await insertTablecompany([
//         convertArabicToEnglish(esc(crnDigits)),
//         esc(nameStr),
//         convertArabicToEnglish(esc(dataCompany?.BuildingNumber)),
//         esc(String(dataCompany?.StreetName ?? "").trim()),
//         esc(String(dataCompany?.NeighborhoodName ?? "").trim()),
//         convertArabicToEnglish(esc(dataCompany?.PostalCode)),
//         esc(String(dataCompany?.City ?? "").trim()),
//         esc(String(dataCompany?.Country ?? "").trim()),
//         convertArabicToEnglish(esc(dataCompany?.TaxNumber)),
//         hash,
//       ]);

//       // 9) الحصول على الشركة المُدرجة (id)
//       const checkCompany = await SelectVerifycompanyexistence(crnDigits);
//       if (!checkCompany || !checkCompany.id) {
//         return res.status(200).send({ success: "تعذّر تأكيد إنشاء الشركة", message: "تعذّر تأكيد إنشاء الشركة" });
//       }


//       // 11) إنشاء المستخدم الإداري الافتراضي للشركة
//       await insertTableuserComppany([
//         convertArabicToEnglish(esc(checkCompany.id)),
//         esc(String(dataCompany?.userName ?? "").trim()),
//         convertArabicToEnglish(esc("0")), // IDNumber غير متوفر في الطلب — تركته 0 كما في كودك
//         convertArabicToEnglish(esc(phoneLocal)),
//         esc("Admin"),
//         esc("موظف"),
//         esc("Admin"),
//         JSON.stringify([]),
//       ]);

//       // 12) حذف طلب التسجيل بعد النجاح
//       // await DeleteTablecompanySubProjectall("companyRegistration", "id", idNum);

//       // 13) إرسال إشعار نجاح
//       try {
//         await verificationSend(
//           phoneLocal,
//           null,
//           "تم قبول طلب تسجيل شركتك في منصة مشرف"
//         );
//       } catch (e) { /* اختياري: console.warn */ }

//       // 14) ردّ النجاح
//       return res.status(200).json({
//         success: "تمت العملية بنجاح",
//         message: "تمت العملية بنجاح",
//         data: { api: hash, companyId: checkCompany.id }
//       });

//     } catch (error) {
//       console.error("AgreedRegistrationCompany error:", error);
//       return res.status(500).json({ success: false, message: "فشل تنفيذ العملية" });
//     }
//   };
// };


const sendNotificationRegistration = async (name) => {
  try {
    let array = [
      "571309090",
      "559233392",
      "557711177",
      "555785065",
      "550033173",
      "555285149",
      "533540335",
      "599667724",
      "505942034",
      "550555702",
      "571506060",
      "532171179",
      "567890370",
      "543259000",
      "534672874",
      "563449128",
      "509430463",
      "544666255",
      "500088197",
      "502464530",
    ];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      await verificationSend(
        element,
        null,
        `تم قبول طلب تسجيل شركتك في منصة مشرف`
      );
    }
  } catch (error) {
    console.log(error);
  }
};

// sendNotificationRegistration()

// حذف بيانات الشركة قيد التسجيل
const DeleteCompanyRegistration = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
      }
      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "DeleteCompanyRegistration"
      );
      const id = req.query.id;
      await DeleteTablecompanySubProjectall("companyRegistration", "id", id);
      res.send({ success: "تمت العملية بنجاح" }).status(200);
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية" }).status(400);
      console.log(error);
    }
  };
};

const UpdatedataRegistration = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdatedataRegistration");
      } catch (e) { /* اختياري */ }

      // 3) التقاط وتطبيع المدخلات
      const {
        CommercialRegistrationNumber,
        NameCompany,
        BuildingNumber,
        StreetName,
        NeighborhoodName,
        PostalCode,
        City,
        Country,
        TaxNumber,
        Api,
        PhoneNumber,
        userName,
        id,
      } = req.body || {};

      const idNum   = parsePositiveInt(id);
      const crnStr  = convertArabicToEnglish(CommercialRegistrationNumber).replace(/\D/g, "");
      const nameStr = String(NameCompany ?? "").trim();
      const buildStr= convertArabicToEnglish(BuildingNumber).replace(/\D/g, "");
      const street  = String(StreetName ?? "").trim();
      const neigh   = String(NeighborhoodName ?? "").trim();
      const postal  = convertArabicToEnglish(PostalCode).replace(/\D/g, "");
      const city    = String(City ?? "").trim();
      const country = String(Country ?? "").trim();
      const taxStr  = convertArabicToEnglish(TaxNumber).replace(/\D/g, "");
      const apiStr  = Api === undefined || Api === null ? "" : String(Api).trim();
      const phoneLocal = normalizePhone(PhoneNumber);
      const reqUserName = String(userName ?? "").trim();

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(idNum)) errors.id = "المعرف مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(crnStr) || !isDigits(crnStr) || crnStr.length < 5)
        errors.CommercialRegistrationNumber = "السجل التجاري غير صالح";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 100))
        errors.NameCompany = "اسم الشركة مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(buildStr) || !isDigits(buildStr))
        errors.BuildingNumber = "رقم المبنى يجب أن يكون أرقاماً فقط";
      if (!isNonEmpty(street) || !lenBetween(street, 2, 100))
        errors.StreetName = "اسم الشارع مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(neigh) || !lenBetween(neigh, 2, 100))
        errors.NeighborhoodName = "اسم الحي مطلوب (2 إلى 100 حرف)";
      if (!/^\d{5}$/.test(postal)) errors.PostalCode = "الرمز البريدي يجب أن يتكون من 5 أرقام";
      if (!isNonEmpty(city) || !lenBetween(city, 2, 100))
        errors.City = "اسم المدينة مطلوب (2 إلى 100 حرف)";
      if (!isNonEmpty(country) || !lenBetween(country, 2, 100))
        errors.Country = "اسم الدولة مطلوب (2 إلى 100 حرف)";
      // if (!isNonEmpty(taxStr) || !/^\d{10,15}$/.test(taxStr))
      //   errors.TaxNumber = "الرقم الضريبي يجب أن يكون بين 10 و 15 رقماً";
      // if (!/^\d{9}$/.test(phoneLocal))
      //   errors.PhoneNumber = "رقم الجوال غير صالح (يجب أن يكون 9 أرقام محلية بعد التطبيع)";
      if (isNonEmpty(reqUserName) && !lenBetween(reqUserName, 2, 100))
        errors.userName = "اسم المستخدم (إن وُجد) يجب أن يكون بين 2 و 100 حرف";
      if (apiStr.length > 255)
        errors.Api = "قيمة Api طويلة جداً (الحد الأقصى 255)";

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) فحوصات تضارب (توافقاً مع منطقك الأصلي)
      // أ) الهاتف مستخدم في حساب مستخدمين لشركة؟
      const verificationFinduser = await SELECTTableusersCompanyVerification(phoneLocal);
      if (Array.isArray(verificationFinduser) && verificationFinduser.length > 0) {
        return res.status(200).send({
          success: "الرقم مستخدم بالفعل في حساب بإحدى الشركات",
          message: "الرقم مستخدم بالفعل في حساب بإحدى الشركات",
        });
      }

      // ب) السجل التجاري موجود في جدول الشركات الفعلي؟
      const checkVerifctioncomany = await SelectVerifycompanyexistence(crnStr);
      if (checkVerifctioncomany) {
        return res.status(200).send({
          success:  "السجل التجاري متواجد لشركة أخرى",
          message: "السجل التجاري متواجد لشركة أخرى",
        });
      }

      // ج) سجل بنفس الهاتف في جدول التسجيلات؟
      const findRegistrioncompany = await SelectVerifycompanyexistencePhonenumber(phoneLocal);
      // د) سجل بنفس السجل التجاري في جدول التسجيلات؟
      const checkVerifction = await SelectVerifycompanyexistence(crnStr, "companyRegistration");

      // منطق السماح بالتحديث:
      // - إن لم يوجد تسجيل بنفس الهاتف → مسموح
      // - أو يوجد بنفس الهاتف ولكن لنفس السجل التجاري (ونفس السجل الجاري تحديثه)
      // - أو يوجد تسجيل بهاتف مختلف لنفس السجل (ونفس id) ← سنسمح
      let conflictPhone = false;
      if (findRegistrioncompany) {
        const sameCRN = String(findRegistrioncompany.CommercialRegistrationNumber ?? "") === crnStr;
        const sameId  = Number(findRegistrioncompany.id) === idNum;
        // إن كان الهاتف مرتبطاً بتسجيل آخر مختلف (ليس نفس السجل أو نفس الـ id) نمنع
        if (!(sameCRN || sameId)) conflictPhone = true;
      }
      if (conflictPhone) {
        return res.status(200).send({
          success:  "الرقم مستخدم لإضافة حساب شركة أخرى",
          message: "الرقم مستخدم لإضافة حساب شركة أخرى",
        });
      }

      // كذلك لو هناك تسجيل آخر بنفس السجل التجاري ولكن بمعرف مختلف نمنع
      if (checkVerifction && Number(checkVerifction.id) !== idNum) {
        return res.status(200).send({
          success: "السجل التجاري مستخدم في طلب تسجيل آخر",
          message: "السجل التجاري مستخدم في طلب تسجيل آخر",
        });
      }

      // 6) التحديث
      await UpdateTablecompanyRegistration([
        convertArabicToEnglish(esc(crnStr)),
        esc(nameStr),
        convertArabicToEnglish(esc(buildStr)),
        esc(street),
        esc(neigh),
        convertArabicToEnglish(esc(postal)),
        esc(city),
        esc(country),
        convertArabicToEnglish(esc(taxStr)),
        convertArabicToEnglish(esc(phoneLocal)),
        esc(reqUserName || userSession.userName || ""),
        esc(apiStr),
        convertArabicToEnglish(esc(idNum)),
      ]);

      return res.status(200).send({ success:  "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("UpdatedataRegistration error:", error);
      return res.status(500).json({ success:  "فشل في تنفيذ العملية", message: "فشل في تنفيذ العملية" });
    }
  };
};


const UpdateCompanybrinsh = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل حركة المستخدم (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "UpdateCompanybrinsh");
      } catch(e){ /* اختياري */ }

      // 3) التقاط/تطبيع المدخلات
      const { NumberCompany, NameSub, BranchAddress, Email, PhoneNumber, id } = req.body || {};
      const companyId = parsePositiveInt(NumberCompany);
      const branchId  = parsePositiveInt(id);
      const nameStr   = String(NameSub ?? "").trim();
      const addrStr   = String(BranchAddress ?? "").trim();
      const emailStr  = String(Email ?? "").trim().toLowerCase();
      const phoneLoc  = normalizePhone(PhoneNumber);

      // 4) تحقق يدوي
      const errors = {};
      if (!Number.isFinite(companyId)) errors.NumberCompany = "رقم الشركة مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!Number.isFinite(branchId))  errors.id = "رقم الفرع مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(nameStr) || !lenBetween(nameStr, 2, 120)) errors.NameSub = "اسم الفرع مطلوب (2 إلى 120 حرف)";
      if (!isNonEmpty(addrStr) || !lenBetween(addrStr, 2, 200)) errors.BranchAddress = "عنوان الفرع مطلوب (2 إلى 200 حرف)";
      if (isNonEmpty(emailStr) && !isEmail(emailStr)) errors.Email = "صيغة البريد الإلكتروني غير صحيحة";
      if (isNonEmpty(PhoneNumber) && !/^\d{9}$/.test(phoneLoc)) errors.PhoneNumber = "رقم الجوال غير صالح؛ يجب أن يكون 9 أرقام محلية بعد التطبيع";
      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success:  "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) التأكد من وجود الشركة
      const company = await SELECTTablecompanyName(companyId);
      if (!company) {
        return res.status(200).send({ success:  "لم يتم العثور على الشركة", message: "لم يتم العثور على الشركة" });
      }

      // 6) منع تكرار اسم الفرع داخل نفس الشركة (إن وجد فرع آخر بنفس الاسم وبـ id مختلف)
      try {
        const existing = await SELECTTablecompanySubID(nameStr, companyId);
        if (existing && Number(existing.id) !== branchId) {
          return res.status(200).send({ success:  "اسم الفرع موجود مسبقاً لهذه الشركة", message: "اسم الفرع موجود مسبقاً لهذه الشركة" });
        }
      } catch (_) { /* في حال كانت الدالة تُعيد undefined عند عدم الوجود لا مشكلة */ }

      // 7) تنفيذ التحديث
      const ok = await UpdateTablecompanySub([
        convertArabicToEnglish(esc(companyId)),
        esc(nameStr),
        esc(addrStr),
        isNonEmpty(emailStr) ? esc(emailStr) : null,
        isNonEmpty(PhoneNumber) ? convertArabicToEnglish(esc(phoneLoc)) : null,
        convertArabicToEnglish(esc(branchId)),
      ]);

      if (!ok) {
        return res.status(200).send({ success:  "فشل في تنفيذ العملية" , message: "فشل في تنفيذ العملية" });
      }

      return res.status(200).send({ success:  "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

    } catch (err) {
      console.error("UpdateCompanybrinsh error:", err);
      return res.status(500).json({ success:  "فشل في تنفيذ العملية", message: "فشل في تنفيذ العملية" });
    }
  };
}

// قبول ورفض الطلبات
const Acceptandrejectrequests = () => {
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
        "Acceptandrejectrequests"
      );

      const id = req.body.id;
      const kindORreason = req.body.kindORreason;
      if (String(kindORreason).length > 0) {
        if (kindORreason === "قبول") {
          await UPDATETableFinancialCustody(
            `Approvingperson="${userSession.userName}",ApprovalDate=CURRENT_TIMESTAMP,OrderStatus="true"`,
            id
          );
          await CovenantNotfication(0, userSession.userName, "acceptance", id);
        } else {
          await UPDATETableFinancialCustody(
            `Approvingperson="${userSession.userName}",RejectionStatus="true",Reasonforrejection="${esc(kindORreason)}",Dateofrejection=CURRENT_TIMESTAMP`,
            id
          );
          await CovenantNotfication(0, userSession.userName, "reject", id);
        }
      }
      res.send({ success: "تمت العملية بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};

// تعديل بيانات الطلب
const Updatecovenantrequests = () => {
  return async (req, res) => {
    try {
      // 1) التحقق من الجلسة
      const userSession = req.session?.user;
      if (!userSession) {
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      // 2) تسجيل الحركة (لا تُسقط العملية عند الفشل)
      try {
        Addusertraffic(userSession.userName, userSession?.PhoneNumber, "Updatecovenantrequests");
      } catch(e){ /* اختياري */ }

      // 3) التقاط/تطبيع المدخلات
      const { typedata, title, id } = req.body || {};
      const idNum   = parsePositiveInt(id);
      const typeStr = String(typedata ?? "").trim();
      const noteStr = String(title ?? "").trim();

      // 4) تحقق أساسي
      const errors = {};
      if (!Number.isFinite(idNum)) errors.id = "المعرف مطلوب ويجب أن يكون رقماً صحيحاً موجباً";
      if (!isNonEmpty(typeStr)) errors.typedata = "حالة الطلب مطلوبة";
      // إن كانت الحالة "معلقة" نحتاج مبلغاً صالحاً
      let amountNum = null;
      if (typeStr === "معلقة") {
        amountNum = parseNonNegativeFloat(req.body?.Amount);
        if (!Number.isFinite(amountNum)) errors.Amount = "المبلغ يجب أن يكون رقماً صفرياً أو موجباً";
        if (!isNonEmpty(noteStr) || !lenBetween(noteStr, 1, 2000)) errors.title = "البيان/العنوان مطلوب (حتى 2000 حرف)";
      } else {
        // أي حالة أخرى: نعتبرها تحديث سبب الرفض
        if (!isNonEmpty(noteStr) || !lenBetween(noteStr, 1, 2000)) errors.title = "سبب الرفض مطلوب (حتى 2000 حرف)";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(200).send({ success: "أخطاء في التحقق من المدخلات", message: "أخطاء في التحقق من المدخلات", errors });
      }

      // 5) التحديث في قاعدة البيانات
      if (typeStr === "معلقة") {
        // نحدّث البيان + المبلغ
        // ملاحظة: نحافظ على صيغة دالتك الأصلية (setClause, id) مع استخدام esc للتعقيم
        const setClause = `Statement="${esc(noteStr)}",Amount=${convertArabicToEnglish(esc(amountNum))}`;
        await UPDATETableFinancialCustody(setClause, convertArabicToEnglish(esc(idNum)));
      } else {
        // نحدّث سبب الرفض فقط
        const setClause = `Reasonforrejection="${esc(noteStr)}"`;
        await UPDATETableFinancialCustody(setClause, convertArabicToEnglish(esc(idNum)));
      }

      // 6) نجاح
      return res.status(200).send({ success: "تمت العملية بنجاح", message: "تمت العملية بنجاح" });

    } catch (error) {
      console.error("Updatecovenantrequests error:", error);
      return res.status(500).send({ success:  "فشل في تنفيذ العملية" , message: "فشل في تنفيذ العملية" });
    }
  };
};


const Deletecovenantrequests = () => {
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
        "Deletecovenantrequests"
      );
      const PhoneNumber = userSession.PhoneNumber;
      if (PhoneNumber !== "502464530") {
        const id = req.query.id;
        await DeleteTableFinancialCustody([id]);
        res.send({ success: "تمت العملية بنجاح" }).status(200);
      } else {
        res.send({ success: "لايمكنك  القيام بالحذف" }).status(200);
      }
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(500);
    }
  };
};

const Branchdeletionprocedures = () => {
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
        "Branchdeletionprocedures"
      );
      const { IDBrach } = req.query;
      const check = Math.floor(1000 + Math.random() * 9000);
      await insertTableBranchdeletionRequests([
        IDBrach,
        userSession?.IDCompany,
        check,
        userSession?.PhoneNumber,
      ]);
      await verificationSend(
        userSession?.PhoneNumber,
        check,
        `كود حذف الفرع تأكد ان لا يصل هذا الرمز لاي شخص`
      );
      res.send({ success: "تمت العملية بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "قشل تنفيذ العملية" }).status(400);
    }
  };
};

const Implementedbyopreation = () => {
  return async (req, res) => {
    try {
      const { check } = req.query;

      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      Addusertraffic(
        userSession.userName,
        userSession?.PhoneNumber,
        "Implementedbyopreation"
      );
      const result = await SELECTTableBranchdeletionRequests(
        userSession?.IDCompany,
        check,
        userSession.PhoneNumber
      );
      if (result.length > 0) {
        const project = await SELECTTABLEcompanyProjectall(result[0].IDBranch);
        for (const pic of project) {
          await opreationDeletProject(pic?.id);
        }
        await DeleteTablecompanySubProjectall(
          "companySub",
          "id",
          result[0].IDBranch
        );
        await DeleteTablecompanySubProjectall(
          "BranchdeletionRequests",
          "id",
          result[0].id
        );
      }
      res.send({ success: "تمت العملية بنجاح" }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "قشل تنفيذ العملية" }).status(400);
    }
  };
};


// Move projects from idBrinsh 2 to idBrinsh 1 and delete idBrinsh 2

// Output the modified data

module.exports = {
  UpdateCompanybrinsh,
  UpdateDataCompany,
  Acceptandrejectrequests,
  Updatecovenantrequests,
  Deletecovenantrequests,
  UpdateApiCompany,
  AgreedRegistrationCompany,
  UpdatedataRegistration,
  DeleteCompanyRegistration,
  Branchdeletionprocedures,
  Implementedbyopreation,
};
