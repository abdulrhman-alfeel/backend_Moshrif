const express = require("express");
const {
  SELECTTableusersCompanyVerification,
  SELECTTableLoginActivaty,
} = require("../sql/selected/selectuser");
const { DELETETableLoginActivaty } = require("../sql/delete");
const {
  verificationSend,
} = require("../src/modules/companies/select/userCompanyselect");
const { insertTableLoginActivaty } = require("../sql/INsertteble");
const { SELECTTablecompany } = require("../sql/selected/selected");
const { createTokens, verifyJWT } = require("../middleware/jwt");
const router = express.Router();
router.use(verifyJWT);

// 1. POST /api/auth/login - تسجيل الدخول
router.post("/login", async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "الرجاء إدخال رقم الهاتف",
      });
    }
    verificationSend('502464530', null,`تسجيل دخول من قبل ${phoneNumber}`);

    const result = await SELECTTableusersCompanyVerification(phoneNumber);
    await DELETETableLoginActivaty([phoneNumber]);
    // bring validity users from table user table
    //   send operation login to table loginActivaty
    if (result?.length > 0 && result[0]?.job === "Admin") {
      const output = Math.floor(1000 + Math.random() * 9000);
      verificationSend(phoneNumber, output);
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + 5);
      const data = [
        result[0]?.IDCompany,
        result[0]?.userName,
        result[0]?.IDNumber,
        result[0].PhoneNumber,
        result[0]?.image,
        new Date().toDateString(),
        futureDate.toDateString(),
        result[0]?.job,
        result[0]?.jobdiscrption,
        output,
        null,
      ];
      await insertTableLoginActivaty(data);

      res.send({ success: true, masseg: "اهلاً وسهلا بك" }).status(200);
    }

    // يجب ربط هذا بقاعدة بيانات المستخدمين الفعلية أو نظام المصادقة الخارجي

    res.status(501).json({
      success: false,
      error: "يرجى ربط نظام المصادقة بالنظام الفعلي",
      code: "AUTHENTICATION_NOT_CONFIGURED",
    });
  } catch (error) {
    next(error);
  }
});
// 2. GET /api/auth/profile - معلومات المستخدم
router.get("/verification", async (req, res, next) => {
  // TODO: ربط بنظام إدارة المستخدمين الخاص بك
  // يجب جلب معلومات المستخدم من قاعدة البيانات أو النظام الخارجي
  try {
    const { output, PhoneNumber } = req.query;

    const result = await SELECTTableLoginActivaty(
      output,
      parseInt(PhoneNumber)
    );
    if (result !== undefined) {
      // create accessToken from data users
      const user = {
        IDCompany: result?.IDCompany,
        CommercialRegistrationNumber: result.CommercialRegistrationNumber,
        userName: result?.userName,
        PhoneNumber: result?.PhoneNumber,
        IDNumber: result?.IDNumber,
        image: result?.image,
        job: result.job,
        jobdiscrption: result.jobdiscrption,
        token: result.token,
        DateOFlogin: result.DateOFlogin,
        DateEndLogin: result.DateEndLogin,
      };

      const data = await SELECTTablecompany(result?.IDCompany);
      const accessToken = createTokens(user);
      // console.log(accessToken);
      // bring data usres according to validity
      // const ObjectData = await verificationfromValidity(result);
      res
        .send({
          success: true,
          accessToken: accessToken,
          data: user,
          DisabledFinance: data.DisabledFinance,
        })
        .status(200);
    } else {
      res
        .send({ success: false, masseg: "رمز التأكيد خاطاً تأكد من الرمز" })
        .status(501);
    }
  } catch (error) {
    // console.log(error);
      res
        .send({ success: false, masseg: "هناك خطاء في العملية" })
        .status(501);
  }
});

module.exports = router;
