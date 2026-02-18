require("dotenv").config();
const axios = require("axios");
const { Subscripation_new } = require("./opreationSubscripation");
const {
  UpdateState_company_subscriptions,
  Updatetran_ref_company_subscriptions,
} = require("../../../sql/update");
const {
  Select_table_company_subscriptions_vs2,
} = require("../../../sql/selected/selected");
const { DeleteTablecompany_subscriptions } = require("../../../sql/delete");
const path = require("path");

/**
 * مهم جداً: نحتاج rawBody عشان Signature verification (HMAC على body)
 * PayTabs/ClickPay يرسلون هيدر Signature ليتحقق منه السيرفر. :contentReference[oaicite:1]{index=1}
 */
function clickpayRawBodyMiddleware(req, res, next) {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    req.rawBody = data || "";
    // حاول parse JSON بشكل آمن
    try {
      req.body = req.rawBody ? JSON.parse(req.rawBody) : {};
    } catch {
      req.body = {};
    }
    next();
  });
}

// function timingSafeEqualHex(a, b) {
//   const aBuf = Buffer.from(String(a || ""), "utf8");
//   const bBuf = Buffer.from(String(b || ""), "utf8");
//   if (aBuf.length !== bBuf.length) return false;
//   return crypto.timingSafeEqual(aBuf, bBuf);
// }

// /**
//  * حسب توثيق PayTabs/ClickPay: Signature = HMAC-SHA256(body) باستخدام Server Key :contentReference[oaicite:2]{index=2}
//  */
// function verifyClickPaySignature(req) {
//   const requestSignature = req.get("Signature") || req.get("signature") || "";
//   const expected = crypto
//     .createHmac("sha256", process.env.CLICKPAY_SERVER_KEY)
//     .update(req.rawBody || "")
//     .digest("hex");

//   return timingSafeEqualHex(expected, requestSignature);
// }

/**
 * 1) إنشاء رابط الدفع (Hosted Payment Page)
 * Endpoint: POST https://secure.clickpay.com.sa/payment/request :contentReference[oaicite:3]{index=3}
 */
const Creat_payment = () => {
  return async (req, res) => {
    try {
      const {
        currency = "SAR",
        description = "Order payment",
        id_subscriptions,
        project_count,
        company_subscriptions_id = null,
      } = req.body || {};

      const userSession = req.session.user;
      if (!userSession) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid session" });
      }

      let result = {};
      let chack = company_subscriptions_id === null ;

      // ClickPay يذكر: return URL لازم HTTPS عشان يستقبل النتائج. :contentReference[oaicite:4]{index=4}
      if (chack) {
        result = await Subscripation_new(
          id_subscriptions,
          project_count,
          userSession?.IDCompany,
          res,
          "inactive"
        );
      } else {
        result = await Select_table_company_subscriptions_vs2(
          company_subscriptions_id
        );

        if (!result) {
          return res
            .status(200)
            .json({ success: false, error: "الاشتراك غير موجود" });
        }
      }

      const { code_subscription, price } = result;


      const callbackUrl = `${process.env.BASE_URL}/payments/clickpay/ipn`;
      const returnUrl = `${process.env.BASE_URL}/payments/clickpay/return?cart_id=${code_subscription}&type=${chack}`;

      // const returnUrl = `${process.env.BASE_URL}/payments/clickpay/return`;

      const url = "https://secure.clickpay.com.sa/payment/request";
      // هذا نفس payload اللي عندك (وزدت callback + customer_details اختياريين)
      const data = {
        profile_id: Number(process.env.CLICKPAY_PROFILE_ID),
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: code_subscription,
        cart_description: description,
        cart_currency: currency,
        cart_amount: Number(price),
        // server-to-server callback (IPN) :contentReference[oaicite:5]{index=5}
        callback: callbackUrl,
        // redirect back after payment :contentReference[oaicite:6]{index=6}
        return: returnUrl,
        hide_shipping: true,
        return_using_get: true,

        customer_details: {
          name: result?.NameCompany || "Customer Name",
          email: "customer@example.com",
          phone: result?.PhoneNumber || "0000000000",
          street1: result?.StreetName || "Address",
          city: result?.City || "City",
          state: result?.City || "State",
          country: result?.Country || "Country",
          zip: "00000",
          ip:
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress,
        },
      };
      const headers = {
        Authorization: process.env.CLICKPAY_SERVER_KEY, // نفس طريقتك :contentReference[oaicite:7]{index=7}
        "Content-Type": "application/json",
      };

      const response = await axios.post(url, data, { headers });


      // ClickPay يرجع redirect_url كرابط صفحة الدفع. :contentReference[oaicite:8]{index=8}
      const redirectUrl = response?.data?.redirect_url;

      if (!redirectUrl) {
        return res.status(502).json({
          ok: false,
          message: "No redirect_url returned from ClickPay",
          raw: response?.data,
        });
      };
      await Updatetran_ref_company_subscriptions(
        response?.data?.tran_ref,
        code_subscription
      );

      return res.json({
        ok: true,
        payment_url: redirectUrl,
        tran_ref: response?.data?.tran_ref,
        cart_id: code_subscription,
        raw: response.data,
      });

    } catch (err) {
      const raw = err?.response?.data || err?.message;
      console.error("Create payment error:", raw);
      return res
        .status(500)
        .json({ ok: false, message: "create payment failed", raw });
    }
  };
};

/**
 * 2) IPN / Callback: server-to-server من ClickPay
 * - لازم endpoint يستقبل raw body للتحقق من Signature :contentReference[oaicite:9]{index=9}
 */
const clickpay_ipn = () => {
  return async (req, res) => {
    try {
      // console.log("hello", req.body);
      const payload = req.body || {};
      const tranRef = payload?.tran_ref;
      const cartId = payload?.cart_id;
      // await UpdateState_company_subscriptions(cartId)
      // PayTabs/ClickPay عادةً: payment_result.response_status = A / D / ... :contentReference[oaicite:10]{index=10}
      const status = payload?.payment_result?.response_status;
      const message = payload?.payment_result?.response_message;
console.log("ClickPay IPN:", { cartId, tranRef, status, message });
      // console.log("ClickPay IPN:", { cartId, tranRef, status, message });

      // TODO: update DB هنا
      // if (status === "A") => paid
      // else => failed/canceled

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("IPN error:", err);
      // بعض التجار يرجعون 200 حتى ما تصير retries
      return res.status(200).json({ ok: true });
    }
  };
};

/**
 * 3) Validate/Query transaction (اختياري)
 * ClickPay عنده Query Transaction API. :contentReference[oaicite:11]{index=11}
 * ملاحظة: قد يختلف المسار حسب حسابك/إعداداتك، فخلي هذا endpoint جاهز وعدّل URL حسب التوثيق عندك.
 */

//        "payment_result": {
//             "response_status": "A",
//             "response_code": "G68155",
//             "response_message": "Authorised",
//             "transaction_time": "2025-12-31T08:02:35Z"
//         },

//                 "payment_result": {
//             "response_status": "D",
//             "response_code": "310",
//             "response_message": "3DSecure authentication rejected",
//             "transaction_time": "2025-12-31T08:04:57Z"
//         },

//         {
//     "ok": false,
//     "message": "validate failed",
//     "raw": {
//         "code": 113,
//         "message": "ErrorCode = 2000, ErrorMessage=Transaction not found",
//         "trace": "PMNT0301.6954D980.00140AF3"
//     }
// }
const clickpay_validate = () => {
  return async (req, res) => {
    try {
      const { tran_ref } = req.body || {};
      if (!tran_ref)
        return res
          .status(400)
          .json({ ok: false, message: "tran_ref is required" });
      const data = await validate_payment(tran_ref);

      return res.json({ ok: true, result: data });
    } catch (err) {
      const raw = err?.response?.data || err?.message;
      console.error("Validate error:", raw);
      return res
        .status(500)
        .json({ ok: false, message: "validate failed", raw });
    }
  };
};

const validate_payment = async (tran_ref) => {
  try {
    // ⚠️ عدّل هذا المسار إذا كان عندك مختلف حسب التوثيق في لوحة ClickPay
    const url = "https://secure.clickpay.com.sa/payment/query";

    const data = {
      profile_id: Number(process.env.CLICKPAY_PROFILE_ID),
      tran_ref,
    };

    const headers = {
      Authorization: process.env.CLICKPAY_SERVER_KEY,
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, data, { headers });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
const clickpay_return = () => {
  return async (req, res) => {
    try {
      const { cart_id, type } = req.query || {};
      // console.log("ClickPay Return:", { cart_id, type }); 
      const { tran_ref, price,vat } = await Select_table_company_subscriptions_vs2(
        cart_id,
        "code_subscription"
      );

      const data = await validate_payment(tran_ref);
      // console.log("ClickPay Return Validation Result:", data);
      const total = parseFloat(price) + parseFloat(vat);
      // console.log("Total:", total, "Cart Amount:", data?.cart_amount);
      const ok =
        data?.payment_result?.response_status === "A" &&
        parseInt(data?.cart_amount) === parseInt(total);

      if (ok) {
        if (cart_id) await UpdateState_company_subscriptions(cart_id);

        // ✅ يفتح صفحة HTML مع باث يدل على النجاح
        return res.redirect(`/payment/success?cart_id=${encodeURIComponent(cart_id || "")}`);
      } else {
        if (type === "true" && cart_id) await DeleteTablecompany_subscriptions(cart_id);

        // ✅ يفتح صفحة HTML مع باث يدل على الفشل
        return res.redirect(`/payment/failed?cart_id=${encodeURIComponent(cart_id || "")}`);
      }
    } catch (e) {
      return res.redirect(`/payment/error`);
    }
  };
};

module.exports = {
  Creat_payment,
  clickpay_ipn,
  clickpay_validate,
  clickpay_return,
  clickpayRawBodyMiddleware,
};
