const moment = require("moment");
const {
  insert_table_subscription_types,
  insert_table_company_subscription,
  insert_table_project_subscription,
} = require("../../../sql/INsertteble");
const {
  SELECT_Table_subscription_types,
  Select_table_company_subscriptions_onObject,
  SELECT_Table_subscription_types_one_object,
  Select_table_company_subscriptionsChack,
  Select_table_company_subscriptions_vs2,
} = require("../../../sql/selected/selected");
const {
  UPDATE_project_subscriptions,
  update_company_subscription,
  Update_subscription_types,
} = require("../../../sql/update");
const { generateSubscriptionCode } = require("../../../middleware/Aid");
const { DeleteSubscriptionTypes } = require("../../../sql/delete");

/**
 * إدراج نوع باقة اشتراك جديد في جدول subscription_types
 * - يستقبل من body: name, duration_in_months, price_per_project
 * - يحفظ النوع في قاعدة البيانات
 * - يرجع success أو error
 */
const insert_subscription_types = () => {
  return async (req, res) => {
    try {
      const {
        name,
        duration_in_months,
        price_per_project,
        discraption,
      } = req.body || {};

      const errors = {};

      /* =========================
         Validation
      ========================= */

      // name
      if (!name) {
        errors.name = "اسم الباقة مطلوب";
      } else if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
        errors.name = "اسم الباقة يجب أن يكون بين 2 و 100 حرف";
      }

      // duration_in_months
      if (duration_in_months === undefined || duration_in_months === null) {
        errors.duration_in_months = "مدة الاشتراك مطلوبة";
      } else if (!Number.isInteger(Number(duration_in_months)) || Number(duration_in_months) <= 0) {
        errors.duration_in_months = "عدد الأشهر يجب أن يكون رقمًا صحيحًا أكبر من صفر";
      }

      // price_per_project
      if (price_per_project === undefined || price_per_project === null) {
        errors.price_per_project = "سعر المشروع مطلوب";
      } else if (isNaN(price_per_project) || Number(price_per_project) < 0) {
        errors.price_per_project = "سعر المشروع يجب أن يكون رقمًا صحيحًا أو عشريًا أكبر أو يساوي صفر";
      }

      // discraption (اختياري)
      if (discraption && typeof discraption !== "string") {
        errors.discraption = "الوصف يجب أن يكون نصًا";
      }

      // لو فيه أخطاء → رجّعها
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      /* =========================
         Insert
      ========================= */

      await insert_table_subscription_types([
        name.trim(),
        Number(duration_in_months),
        Number(price_per_project),
        discraption?.trim() || null,
      ]);

      return res.status(200).json({
        success: true,
        message: "Subscription type inserted successfully.",
      });

    } catch (error) {
      console.error("Error inserting subscription type:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  };
};

const Delete_subscription_types = () => {
  return async (req, res) => {
    try {
      const { id } = req.query;
      await DeleteSubscriptionTypes(id);
      return res.status(200).json({
        success: true,
        message: "Subscription type deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting subscription type:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  };
};

const opreation_update_subscription = () => {
  return async (req, res) => {
    try {
      const { id, name, duration_in_months, price_per_project,discraption } = req.body;
      await Update_subscription_types([
        name,
        duration_in_months,
        price_per_project,
        discraption,
        id,
      ]);
      return res.status(200).json({
        success: true,
        message: "Subscription type updated successfully.",
      });
    } catch (error) {
      console.error("Error updating subscription type:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};

/**
 * إنشاء اشتراك جديد للشركة (company_subscriptions)
 * - يتأكد من وجود session
 * - يأخذ: id (نوع الباقة), project_count (عدد المشاريع)
 * - يجلب نوع الباقة من DB ويحسب السعر = عدد المشاريع * سعر المشروع
 * - يحسب تاريخ النهاية: اليوم + مدة الباقة بالأشهر
 * - يولد كود اشتراك مثل: MOSHRIF-XXXX-XXXX-XXXX
 * - يحفظ الاشتراك في جدول الشركة
 * - يرجع الكود للعميل
 */
const insert_Subscripation_New = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid session" });
      }

      const { id, project_count } = req.body;

      const code_subscription = await Subscripation_new(id,project_count,userSession?.IDCompany,res);
   
   
      return res.status(200).json({
        success: true,
        message: "Subscription records inserted successfully.",
        code_subscription,
      });
    } catch (error) {
      console.error("Error inserting subscription records:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};



const Subscripation_new = async (id,project_count,IDCompany,res,Status="active")  => {
  try{
    
      // جلب بيانات نوع الباقة
      const data_types = await SELECT_Table_subscription_types_one_object(id);
      if (data_types?.length === 0) {
        return res
          .status(200)
          .json({ success: false, error: "Subscription type not found." });
      }

      const price = project_count * data_types.price_per_project  * data_types.duration_in_months  ; // السعر مع الضريبة
      const vat = (price * 15 / 100); // نسبة الضريبة (مثال: 15%)
      const total = price + vat;
      // console.log("Price:", price, "VAT:", vat, "Total:", total); 
      // حساب السعر الإجمالي للاشتراك
      // حساب تاريخ انتهاء الاشتراك: اليوم + مدة الباقة بالأشهر
      const end_date = moment()
        .add(Number(data_types.duration_in_months || 0), "months")
        .format("YYYY-MM-DD");

      // توليد كود اشتراك فريد
      const code_subscription = generateSubscriptionCode("MOSHRIF", [4, 4, 4]);

      // حفظ اشتراك الشركة  
      await insert_table_company_subscription([
        IDCompany,
        id,
        code_subscription,
        project_count,
        price,
        vat,
        end_date,
        Status,
      ]);
      const data_campany  = await Select_table_company_subscriptions_vs2(IDCompany,'c.id');
      return {code_subscription,price:total,...data_campany};
  }catch(error){
    console.log(error,'Error in Subscripation_new');
  }
}



/**
 * التحقق هل اشتراك الشركة موجود (company_subscriptions_id)
 * - يرجع true إذا موجود
 * - يرجع false إذا غير موجود
 */
const chack_company_subscription = async (company_subscriptions_id) => {
  try {
    const data = await Select_table_company_subscriptions_onObject(
      company_subscriptions_id
    );
    return data.length > 0;
  } catch (error) {
    // ملاحظة: throw new Error ما ياخذ باراميتر ثاني، الأفضل تضمين الرسالة داخل النص
    throw new Error(`Error in chack_company_subscription: ${error.message}`);
  }
};

/**
 * ربط مشروع بباقة اشتراك شركة (project_subscriptions)
 * - يدخل سجل ربط: (company_subscriptions_id, project_id)
 * - ثم يحدث اشتراك الشركة (عادة لزيادة عدد المشاريع المستخدمة)
 */
const project_subscription = async (project_id, company_subscriptions_id) => {
  try {
    // ربط المشروع بالاشتراك
    await insert_table_project_subscription([
      company_subscriptions_id,
      project_id,
    ]);

    // تحديث الاشتراك (مثلاً: project_count_used + 1)
    await update_company_subscription(company_subscriptions_id);
  } catch (error) {
    throw new Error(`Error in project_subscription: ${error.message}`);
  }
};

/**
 * جلب جميع أنواع الباقات المتاحة
 * - يتأكد من وجود session
 * - يرجع قائمة subscription_types
 */
const Bring_Subscription_typs = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid session" });
      }

      const data = await SELECT_Table_subscription_types();
      return res.status(200).json({
        data,
        success: true,
        message: "Project subscription record inserted successfully.",
      });
    } catch (error) {
      console.error("Error inserting project subscription record:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};

/**
 * تحويل اشتراك مشروع إلى اشتراك شركة (ربط/نقل)
 * - يأخذ: project_id, company_subscriptions_id
 * - ينفذ UPDATE على جدول project_subscriptions
 */
const convert_project_subscription_to_company_subscription = () => {
  return async (req, res) => {
    try {
      const { project_id, company_subscriptions_id } = req.body;
      let value = project_id === 0 ? project_id : company_subscriptions_id;

      if (value === 0)
        return res.status(200).json({
          success: true,
          message: `يجب تحديد <المشروع والباقة>.`,
        });

      const chack_boucket = await Select_table_company_subscriptions_onObject(
        company_subscriptions_id
      );

      if (
        chack_boucket.length > 0 &&
        chack_boucket[0].project_count_used < chack_boucket[0].project_count
      ) {
        const chack_project = await Select_table_company_subscriptionsChack(
          project_id
        );
        let message;
        if (chack_project?.length > 0) {
          // تحديث ربط المشروع بالاشتراك
          await UPDATE_project_subscriptions([
            company_subscriptions_id,
            project_id,
          ]);
          await update_company_subscription(chack_project[0]?.id, "-");
          message = await update_company_subscription(company_subscriptions_id);
        } else {
          await insert_table_project_subscription([
            company_subscriptions_id,
            project_id,
          ]);
          message = await update_company_subscription(company_subscriptions_id);
        }

        return res.status(200).json({
          success: true,
          message: message,
        });
      } else {
        
        return res.status(200).json({
          success: false,
          message:
           `
           فشل العملية بسبب اكتمال عدد المشاريع في الباقة او انتهاء تاريخ الباقة
           المشاريع المتاحه :${chack_boucket[0].project_count}
           المشاريع المستخدمه: ${chack_boucket[0].project_count_used}
           تاريخ الانتهاء: ${chack_boucket[0].end_date}
           `,
        });
      };
    } catch (error) {
      console.error("Error inserting project subscription record:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};

/**
 * جلب اشتراكات الشركة الحالية
 * - يتأكد من وجود session
 * - يرجع اشتراكات الشركة حسب company_id
 */
const Bring_company_subscription = () => {
  return async (req, res) => {
    try {
            const { type = 1 } = req.query;

      const userSession = req.session.user;
      if (!userSession) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid session" });
      }


      const typeStatus = type == 1 ? "AND status='active'" : ""; // نوع الجلب: حسب company_id أو حسب id الاشتراك نفسه
      // جلب اشتراكات الشركة (على حسب company_id)
      const data = await Select_table_company_subscriptions_onObject(
        userSession?.IDCompany,
        typeStatus,
        "company_id"
      );
      console.log(data);

      return res.status(200).json({
        data,
        success: true,
        message: "Project subscription record inserted successfully.",
      });
    } catch (error) {
      console.error("Error inserting project subscription record:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};

/**
 * تحديث حالة اشتراك الشركة (مثلاً active / inactive / expired)
 * - يأخذ: status, company_subscriptions_id
 * - ينفذ update على DB
 */
const update_company_subscription_status = () => {
  return async (req, res) => {
    try {
      const { status, company_subscriptions_id } = req.body;

      // تحديث حالة الاشتراك
      await update_company_subscription(status, company_subscriptions_id);

      return res.status(200).json({
        success: true,
        message: "Project subscription record inserted successfully.",
      });
    } catch (error) {
      console.error("Error inserting project subscription record:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error." });
    }
  };
};

/**
 * استخراج فاتورة تفاصيل اشتراك الشهر السابق PDF ورفعها على Google Cloud Storage
 * - يتأكد من session
 * - يجيب بيانات اشتراك الشهر السابق
 * - يحول HTML إلى PDF ويحفظه محلياً
 * - يرفع الملف إلى Cloud Storage
 * - يرجع رابط الملف النهائي
 *
 * ملاحظة: uploadQueue غير مستخدم داخل الدالة حالياً
 */
const bringInvoicedetails = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        return res.status(401).send("Invalid session");
      }

      // تاريخ بداية الشهر السابق (أو اليوم قبل شهر حسب moment)
      const prevMonth = moment().subtract(1, "month").format("YYYY-MM-DD");

      // جلب بيانات الفاتورة للشهر السابق
      const data = await SelectInvoicesubscripation(
        userSession.IDCompany,
        prevMonth
      );

      if (!data || data.length === 0) {
        return res.status(404).send("No subscription data found");
      }

      // تحويل الشهر لنص عربي/إنجليزي حسب دالتك convertTimeToMonth
      const month = convertTimeToMonth(prevMonth);

      // اسم الملف: رقم السجل التجاري + اسم الشهر
      const namefile = `${data[0].CommercialRegistrationNumber}_${month}_.pdf`;
      const filePath = path.join(__dirname, "../../upload", namefile);

      // توليد HTML ثم تحويله إلى PDF
      const htmlContent = await HtmlStatmentSubscription(data);
      await convertHtmlToPdf(htmlContent, filePath);

      // مسار الرفع داخل البكت
      const outputPrefix = `${data[0].CommercialRegistrationNumber}/invoice/${namefile}`;

      // إذا تم توليد الملف فعلاً، ارفعه للبكت
      if (fs.existsSync(filePath)) {
        await uploadFile(outputPrefix, filePath);

        // تنفيذ عملية تسجيل/تنظيف حسب دالتك
        implmentOpreationSingle("upload", namefile);
      }

      // رابط الملف بعد الرفع
      const fileUrl = `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${outputPrefix}`;

      return res.status(200).send({
        success: "Inactive",
        url: fileUrl,
      });
    } catch (err) {
      console.error("❌ Error in bringInvoicedetails:", err);
      return res.status(500).send({
        success: "Inactive",
        error: "Internal server error",
        details: err.message,
      });
    }
  };
};

module.exports = {
  bringInvoicedetails,
  insert_subscription_types,
  insert_Subscripation_New,
  chack_company_subscription,
  project_subscription,
  Bring_Subscription_typs,
  convert_project_subscription_to_company_subscription,
  Bring_company_subscription,
  update_company_subscription_status,
  opreation_update_subscription,
  Subscripation_new,
  Delete_subscription_types
};
