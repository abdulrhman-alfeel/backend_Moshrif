const {
  SELECTTablecompanySubProject,
  SELECTTablecompanySubProjectStageCUST,
  SELECTTablecompanySubProjectStagesSub,
  SELECTTablecompanySubProjectStageNotes,
  SELECTTablecompanySubProjectexpense,
  SELECTTablecompanySubProjectREVENUE,
  SELECTTablecompanySubProjectReturned,
  SELECTFROMTablecompanysubprojectStageTemplet,
  SELECTTablecompanySubProjectarchivesotherroad,
  SELECTTablecompanySubProjectarchives,
  SELECTSUMAmountandBring,
  SELECTTablecompanySubProjectStageCUSTSubCount,
  SELECTTablecompanybrinshStagesSubAll,
  SELECTTablecompanySubProjectStageCUSTONe,
  SELECTLastTableChateStage,
  SELECTTableSavepdf,
  SELECTTablecompanySubProjectexpenseObjectOneforArchif,
  SELECTSEARCHINFINANCE,
  SELECTTablecompanySubProjectREVENUEObjectOne,
  SELECTTablecompanySubProjectReturnedObjectOne,
  SELECTallDatafromTableRequests,
  SELECTDataAndTaketDonefromTableRequests,
  SELECTProjectStartdate,
  SELECTTablecompanySubProjectLast_id,
  SELECTTablecompany,
  SELECTTablecompanySubProjectFilter,
  SELECTallDatafromTableRequestsV2,
  SELECTDataAndTaketDonefromTableRequests2,
  SELECTTableStageNotesAllproject,
  SELECTTablecompanySubProjectStageCUSTv2,
  selecttablecompanySubProjectall,
  SelectReportTimeline,
  SelectOrdertabletotalreport,
  SelectdetailsOrders,
  SELECTTusersProjectProjectall,
  SELECTTableStageCUST_IMAGE,
  SELECTTableStagesCUST_Image,
  SELECTTableStageStageSub,
  select_table_company_subscriptions,
} = require("../../../../sql/selected/selected");
const fs = require("fs");
const path = require("path");
const {
  StatmentAllpdf,
  StatmentExpensePdf,
  convertHtmlToPdf,
  generateRequestsReportPDF,
} = require("../../../../pdf/convertotpdf");
const { bucket, uploadFile, checkIfFileExists } = require("../../../../bucketClooud");
const { insertTableSabepdf } = require("../../../../sql/INsertteble");
const { UPDATETableSavepdf } = require("../../../../sql/update");
const {
  SELECTTableusersCompanyonObject,
  SELECTTableusersCompanyVerificationobject,
  SELECTTableusersBranshmanger,
} = require("../../../../sql/selected/selectuser");
const { deleteFileSingle } = require("../../../../middleware/Fsfile");
const redis = require("../../../../middleware/cache");
const {
  HtmlStatmentTimline,
  HtmlStatmentStage,
} = require("../../../../pdf/writHtml");
const moment = require("moment-timezone");

// استيراد بيانات المشروع حسب الفرع

const BringProjectdashbord = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;

      if (!userSession) {
        return res.status(401).send("Invalid session");
      }
      const {  IDcompanySub, IDfinlty } = req.query;
      const PhoneNumber = userSession.PhoneNumber;
       const projects = await getProjectsForUser(
        PhoneNumber,
        IDcompanySub,
        IDfinlty
      );
      
      const data = { success: true, data: projects, boss: projects[0]?.job };
      res.status(200).send(data);
    } catch (err) {
      console.error(err);
      res.status(400).send({ success: false, error: err.message });
    }
  };
};

const BringProject = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;

      if (!userSession) {
        return res.status(401).send("Invalid session");
      };

      const { IDcompanySub, IDfinlty, type = "cache" } = req.query;
      const PhoneNumber = userSession.PhoneNumber;
      const projects = await getProjectsForUser(
        PhoneNumber,
        IDcompanySub,
        IDfinlty
      );
      
      const data = { success: true, data:projects[0]?.id ? projects: [], boss: projects[0]?.job };
      res.status(200).send(data);

    } catch (err) {
      console.error(err);
      res.status(400).send({ success: false, error: err.message });
    }
  };
};

async function getProjectsForUser(PhoneNumber, IDcompanySub, IDfinlty) {
  const result = await selecttablecompanySubProjectall(
    IDcompanySub,
    IDfinlty,
    PhoneNumber
  );
  return result;
};



//  فلتر المشاريع
const FilterProjectdashbord = () => {
  return async (req, res) => {
    try {
      const { search, IDCompanySub, IDCompany } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        // console.log("Invalid session");
      }

      const result = await SELECTTablecompanySubProjectFilter(
        search,
        IDCompanySub,
        0,
        'dashbord'
      );
      const arrayReturnProject = await BringTotalbalance(
        IDCompanySub,
        IDCompany,
        result
      );
      let findproject = false;

      const massage = !findproject
        ? "لاتوجد بيانات في اطار صلاحياتك بهذا الاسم "
        : "تمت العملية بنجاح";
      res.send({ success: massage, data: arrayReturnProject }).status(200);
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية", data: [] }).status(501);
      console.log(error);
    }
  };
};

const FilterProject = () => {
  return async (req, res) => {
    try {
      const { search, IDCompanySub } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        // console.log("Invalid session");
      }
    
      const result = await SELECTTablecompanySubProjectFilter(
        search,
        IDCompanySub,
        userSession.PhoneNumber
      );

      const massage =
        result.length === 0
          ? "لاتوجد بيانات في اطار صلاحياتك بهذا الاسم "
          : "تمت العملية بنجاح";
      res.send({ success: massage, data: result }).status(200);
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية", data: [] }).status(501);
      console.log(error);
    }
  };
};

const BringDataprojectClosed = () => {
  return async (req, res) => {
    try {
      const IDCompanySub = req.query.IDCompanySub;
      const IDfinlty = req.query.IDfinlty;
      const result = await SELECTTablecompanySubProject(
        IDCompanySub,
        "forchat",
        "false",
        `AND ca.id > ${IDfinlty} ORDER BY ca.id ASC LIMIT 15`
      );
      // "DESC"
      res.send({ success: "تمت العملية بنجاح", data: result }).status(200);
    } catch (error) {
      res.send({ success: "فشل تنفيذ العملية" }).status(401);

      console.log(error);
    }
  };
};

//  عملية رئيسية لجلب مشروع واحد
const BringProjectObjectone = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const idProject = req.query.idProject;
      const result = await SELECTTablecompanySubProjectLast_id(
        idProject,
        "party"
      );

      const data = await OpreationExtrinProject(
        result,
        userSession.IDCompany,
        result?.IDcompanySub
      );
      const datanew = data ? data : {};
      res.send({ success: "تم نجاح العملية", data: datanew }).status(200);
    } catch (error) {
      console.log(error);
      res.status(500).send({ success: "فشل تنفيذ العملية" });
    }
  };
};

// استيراد بيانات قالب المراحل
const BringStageTemplet = () => {
  return async (req, res) => {
    try {
      const Type = req.query.Type;
      const result = await SELECTFROMTablecompanysubprojectStageTemplet(Type);

      res.send({ success: true, data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

//  استيراد بيانات المراحل الاساسية
const BringStage = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;

      if (!userSession) {
        return res.status(401).send("Invalid session");
      }

      const { ProjectID, type } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }

      const key = `Stage:${userSession?.PhoneNumber}:${ProjectID}`;

      const cached = await redis.get(key);
      if (cached && type === "cache") {
        const cachedData = JSON.parse(cached);
        return res.send(cachedData).status(200);
      }

      const result = await SELECTTablecompanySubProjectStageCUSTv2(ProjectID);

      // استيراد صلاحية المستخدم للمشروع

      const userdata = await SELECTTableusersCompanyVerificationobject(
        userSession.PhoneNumber,
        ProjectID
      );

      let data = {
        success: true,
        data: result,
        Validity: userdata?.ValidityProject,
      };

      res.send(data).status(200);
      await redis.set(key, JSON.stringify(data), "EX", 60 * 1000);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};
const BringStagev2 = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;

      if (!userSession) {
        return res.status(401).send("Invalid session");
      }
      const { ProjectID, type, number } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };

      const Limit = type === "cache" ? `LIMIT 8` : "";
      const result = await SELECTTablecompanySubProjectStageCUSTv2(
        ProjectID,
        `AND cu.StageCustID > ${number}  ORDER BY cu.StageCustID ASC ${Limit} `
      );
      // استيراد صلاحية المستخدم للمشروع

      const userdata = await SELECTTableusersCompanyVerificationobject(
        userSession.PhoneNumber,
        ProjectID
      );

      let data = {
        success: true,
        data: result,
        Validity: userdata?.ValidityProject || [],
        countall: result[0]?.count || 0,
      };
      res.send(data).status(200);
      // await redis.set(key, JSON.stringify(data), "EX", 60 * 1000);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// استيراد كائن واحد من  المراحل ارئيسية
const BringStageOneObject = () => {
  return async (req, res) => {
    try {
      const ProjectID = req.query.ProjectID;
      const StageID = req.query.StageID;

      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }

      let result = await SELECTTablecompanySubProjectStageCUSTONe(
        ProjectID,
        StageID,
        "all",
        ""
      );

      res.send({ success: true, data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

const BringStageCustImage = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      const { StageID, ProjectID, count = 0 } = req.query;
      if (!StageID || !ProjectID) {
        return res
          .status(400)
          .json({ error: "يجب إدخال رقم المرحلة و رقم المشروع بشكل صحيح" });
      }
      const result = await SELECTTableStageCUST_IMAGE(
        StageID,
        ProjectID,
        count
      );
      res.send({ success: true, data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// استيراد بيانات المراحل الفرعية
const BringStagesub = () => {
  return async (req, res) => {
    try {
      const { ProjectID, StageID, type, number } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }

      let numberv2 = number ?? 0;
      // const key = `StageSub:${userSession?.PhoneNumber}:${ProjectID}:${StageID}:${numberv2}`;

      // const cached = await redis.get(key);
      // let typeCache = type || "update";
      // if (cached && typeCache === "cache") {
      //   const cachedData = JSON.parse(cached);
      //   return res
      //     .send({
      //       success: true,
      //       data: cachedData?.data, resultProject: cachedData?.resultProject
      //     })
      //     .status(200);
      // }

      const result = await SELECTTablecompanySubProjectStagesSub(
        ProjectID,
        StageID,
        "all",
        "",
        `AND StageSubID > ${numberv2}  ORDER BY StageSubID ASC LIMIT 7 `
      );
      const resultProject = await SELECTTablecompanySubProjectStageCUSTONe(
        ProjectID,
        StageID,
        "all",
        ""
      );

      res
        .send({ success: true, data: result, resultProject: resultProject })
        .status(200);
      // let data = {data: result, resultProject: resultProject}
      // await redis.set(key, JSON.stringify(data), "EX", 60 * 1000);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// استيراد ملاحظات المراحل الرئيسية للمشروع
const BringStageNotes = () => {
  return async (req, res) => {
    try {
      const { ProjectID, StageID } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(
        ProjectID
      );
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }

      let types = Number(StageID) ? parseInt(StageID) : StageID;
      const result = await SELECTTablecompanySubProjectStageNotes(
        parseInt(ProjectID),
        types
      );
      res.send({ success: true, data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// استيراد بيانات المصروفات
const BringExpense = () => {
  return async (req, res) => {
    try {
      const { idproject, lastID } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(idproject);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };

      const result = await SELECTTablecompanySubProjectexpense(
        idproject,
        "all",
        lastID
      );
      let array = [];
      result.forEach((pic) => {
        array.push({
          ...pic,
          Image: pic.Image !== null ? JSON.parse(pic.Image) : [],
        });
      });
      res.send({ success: true, data: array }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

//  استيراد بيانات العهد
const BringRevenue = () => {
  return async (req, res) => {
    try {
      const { idproject, lastID } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(idproject);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };


      const result = await SELECTTablecompanySubProjectREVENUE(
        idproject,
        lastID
      );
      let array = [];
      result.forEach((pic) => {
        array.push({
          ...pic,
          Image: pic.Image !== null ? JSON.parse(pic.Image) : [],
        });
      });
      res.send({ success: true, data: array }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

//  استيراد بيانات المرتجعات
const BringReturned = () => {
  return async (req, res) => {
    try {
      const { idproject, lastID } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(idproject);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };


      const result = await SELECTTablecompanySubProjectReturned(
        idproject,
        lastID
      );
      let array = [];
      result.forEach((pic) => {
        array.push({
          ...pic,
          Image: pic.Image !== null ? JSON.parse(pic.Image) : [],
        });
      });
      res.send({ success: true, data: array }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};
// استيراد المجموع لبيانات المالية

const BringTotalAmountproject = () => {
  return async (req, res) => {
    try {
      const ProjectID = req.query.ProjectID;

      const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }


      const result = await SELECTSUMAmountandBring(ProjectID);
      res.send(result).status(200);
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  };
};

// استيراد كشف حساب المالية للمشروع

const BringStatmentFinancialforproject = () => {
  return async (req, res) => {
    try {
      // === 1) Validate input/session ===
      const { ProjectID, type } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: "Subscription inactive" });
      }


      const isAll = type === "all";

      if (!ProjectID || !type) {
        return res
          .status(400)
          .send({ success: "فشل في تنفيذ العملية - معاملات غير مكتملة" });
      }

      const userSession = req.session?.user;
      if (!userSession) {
        console.log("Invalid session");
        return res.status(401).send("Invalid session");
      }

      // === 2) Fetch required data ===
      const company = await SELECTTablecompany(
        userSession.IDCompany,
        "NameCompany,CommercialRegistrationNumber"
      );

      const savePdf = await SELECTTableSavepdf(ProjectID);
      const totals = await SELECTSUMAmountandBring(ProjectID);

      // حقل الاسم المخزن وحقل الإجمالي المطابق حسب نوع التقرير
      const nameField = isAll ? "namefileall" : "namefileparty";
      const totalFieldInRow = isAll ? "Total" : "TotalExpense";
      const currentTotal = isAll
        ? Number(totals?.RemainingBalance)
        : Number(totals?.TotalExpense);

      // === 3) Try to reuse existing file if data unchanged ===
      const hasRow = !!(savePdf && savePdf !== 0);
      const storedPath = hasRow ? savePdf?.[nameField] : null;
      const savedTotal = hasRow ? Number(savePdf?.[totalFieldInRow]) : NaN;
      const canReuse =
        hasRow &&
        Number.isFinite(savedTotal) &&
        savedTotal === currentTotal &&
        !!storedPath;

      if (canReuse) {
        // نُعيد الرابط المخزن كما هو
        return res
          .status(200)
          .send({ success: "تمت العملية بنجاح", url: storedPath });
      }

      // === 4) If not reusable, regenerate ===
      // 4.a حاول حذف الملف السابق (إن وُجد) من التخزين

      // 4.b توليد اسم ملف جديد ثابت
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      const baseName = `${totals?.ProjectID || "project"}${rand4}${
        isAll ? "all" : "party"
      }financial.pdf`;

      const localFilePath = path.join(__dirname, "../../upload", baseName);
      const remotePath = `${company?.CommercialRegistrationNumber}/report/${baseName}`;
      if (storedPath) {
        try {
          const file = bucket.file(remotePath);
          await file.delete();
        } catch (err) {
          // لا نُفشل العملية بسبب فشل الحذف؛ نُسجل فقط
          console.log("Delete previous file error:", err?.message || err);
        }
      }
      // 4.c توليد الـ PDF حسب النوع
      if (isAll) {
        await StatmentAllpdf(ProjectID, localFilePath);
      } else {
        await StatmentExpensePdf(ProjectID, localFilePath);
      }

      // 4.d تحقق من وجود الملف محلياً ثم ارفعه واحذف المحلي
      const existsLocal = fs.existsSync(localFilePath);
      if (!existsLocal) {
        // console.error(`File ${localFilePath} does not exist for upload.`);
        return res
          .status(400)
          .send({ success: "فشل في تنفيذ العملية - الملف غير موجود" });
      }

      await uploadFile(remotePath, localFilePath);
      deleteFileSingle(baseName, "upload");

      // 4.e تحديث السجل (تحديث إذا كان موجوداً، وإلاّ إدراج)
      const kindTable = isAll ? "Total" : "TotalExpense";
      const nameColumn = nameField; // "namefileall" أو "namefileparty"

      if (hasRow) {
        await UPDATETableSavepdf(
          [remotePath, currentTotal, ProjectID],
          nameColumn,
          kindTable
        );
      } else {
        await insertTableSabepdf(
          [ProjectID, remotePath, currentTotal],
          nameColumn,
          kindTable
        );
      }

      // 4.f أعد الاستجابة برابط التخزين النهائي
      return res
        .status(200)
        .send({ success: "تمت العملية بنجاح", url: remotePath });
    } catch (error) {
      console.error("Error in processing:", error);
      return res.status(400).send({ success: "فشل في تنفيذ العملية" });
    }
  };
};
// عمليات البحث في قسم المالية
const SearchinFinance = () => {
  return async (req, res) => {
    try {
      const { projectID, type, from, to, fromtime, totime, count } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(projectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: "Subscription inactive" });
      }


      let array = [];

      let kind =
        type === "مصروفات" ? "Expense" : type === "عهد" ? "Revenue" : "Returns";
      const result = await SELECTSEARCHINFINANCE(
        kind,
        projectID,
        parseInt(from),
        parseInt(to),
        fromtime,
        totime,
        count
      );
      // console.log(result);
      if (result.length > 0) {
        result.forEach((pic) => {
          array.push({
            ...pic,
            Image: pic.Image !== null ? JSON.parse(pic.Image) : [],
          });
        });
      }
      res.send({ success: "تمت العملية بنجاح", data: array }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(400);
    }
  };
};

// *******************************************************************************************
//******************************** استيراد بيانات الارشيف************************************
const BringArchives = () => {
  return async (req, res) => {
    try {
      const idproject = req.query.idproject;

      const chack_for_subscription = await select_table_company_subscriptions(idproject);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };
      const result = await SELECTTablecompanySubProjectarchives(idproject);
      res.send({ success: true, data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};
// استيراد ملفات فرع مجلد الارشيف
const BringArchivesFolderdata = () => {
  return async (req, res) => {
    try {
      const { ArchivesID, idSub, type, idproject } = req.query;


      const chack_for_subscription = await select_table_company_subscriptions(idproject);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };

      let result;
      result = await SELECTTablecompanySubProjectarchivesotherroad(
        parseInt(ArchivesID)
      );

      const children = JSON.parse(result.children);

      if (verifyfromfiletname(result.FolderName)) {
        if (parseInt(ArchivesID) !== parseInt(idSub)) {
          const resultall = await BringchildeArchives(
            children,
            parseInt(idSub)
          );
          result = await ExtractDatafromFolderchilde(resultall);
        } else {
          // console.log(type, "type no archivesid !== idsub");
          result = await ExtractDatafromFolderchilde(children);
        }
      } else {
        result = await ExtractDatafromFolderHome(
          idproject,
          result.FolderName,
          type,
          idSub
        );
      }

      res.send({ success: true, data: result || [] }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// ************** استيرات بيانات الطلبيات ***************************************
const BringDataRequests = () => {
  return async (req, res) => {
    try {
      const { ProjectID, Type } = req.query;

      const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({  success: "Subscription inactive" });
      };


      const typeselect = String(Type).split(" ")[1];
      let querytype =
        typeselect === "خفيفة" || typeselect === "ثقيلة" ? typeselect : Type;
      const result = await SELECTallDatafromTableRequests(querytype, ProjectID);


      let arraynew = [];
      await Promise.all(
        result.map(async (pic) => {
          let InsertBy = null;
          let Implementedby = null;
          if (pic.InsertBy !== null) {
            const user = await SELECTTableusersCompanyonObject(pic.InsertBy);
            InsertBy = user.userName;
          }
          if (pic.Implementedby !== null) {
            const user = await SELECTTableusersCompanyonObject(
              pic.Implementedby
            );
            Implementedby = user.userName;
          }
          arraynew.push({
            ...pic,
            Image: pic.Image !== null ? JSON.parse(pic.Image) : [],
            InsertBy: InsertBy,
            Implementedby: Implementedby,
          });
        })
      );
      // console.log(arraynew);
      res.send({ success: "تمت العملية بنجاح", data: arraynew }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};

const BringCountRequsts = () => {
  return async (req, res) => {
    try {
      const ProjectID = req.query.ProjectID;

      const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: "Subscription inactive" });
      }

      const countCLOSE = await SELECTDataAndTaketDonefromTableRequests(
        ProjectID,
        "false"
      );
      const countOPEN = await SELECTDataAndTaketDonefromTableRequests(
        ProjectID,
        "true"
      );
      res.send({
        success: "تمت العملية النجاح",
        data: {
          Close: countCLOSE["COUNT(Done)"],
          Open: countOPEN["COUNT(Done)"],
        },
      });
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};
const BringDataRequestsV2 = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      };

      const { ProjectID, Type, kind, Done, lastID } = req.query;

      if(kind === 'part'){
        const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
        if (!chack_for_subscription) {
          return res
            .status(200)
            .send({success:"Subscription inactive" });
        };
      }

      let verifyUser = ["مدير الفرع", "Admin"].includes(userSession.job);
      let requstAdmin = String(userSession.job).includes("طلبيات");



      const typeselect = String(Type).split(" ")[1];
      let querytype = ["خفيفة", "ثقيلة"].includes(typeselect)
        ? typeselect
        : Type;

      const result = await SELECTallDatafromTableRequestsV2(
        querytype,
        ProjectID,
        kind,
        Done,
        lastID,
        !verifyUser && !requstAdmin
          ? `AND InsertBy=${userSession.PhoneNumber}`
          : ""
      );

      res.send({ success: "تمت العملية بنجاح", data: result }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};

const BringCountRequstsV2 = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const { ProjectID, type = "part" } = req.query;

      let verifyUser = ["مدير الفرع", "Admin"].includes(userSession.job);
      let requstAdmin = String(userSession.job).includes("طلبيات");
      const countCLOSE = await SELECTDataAndTaketDonefromTableRequests2(
        ProjectID,
        type,
        "false",
        !verifyUser && !requstAdmin
          ? " InsertBy='" + userSession.PhoneNumber + "' AND"
          : ""
      );
      const countOPEN = await SELECTDataAndTaketDonefromTableRequests2(
        ProjectID,
        type,
        "true",
        !verifyUser && !requstAdmin
          ? " InsertBy='" + userSession.PhoneNumber + "' AND"
          : ""
      );

      res.send({
        success: "تمت العملية النجاح",
        data: {
          Close: countCLOSE["COUNT(Done)"],
          Open: countOPEN["COUNT(Done)"],
        },
      });
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};

// *******************************************************************************
// *************************** انشاء تقرير للمشروع *****************************

const BringReportforProject = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const ProjectID = req.query.ProjectID;



      const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }


      const result = await SELECTTablecompanySubProjectStageCUST(ProjectID);
      let arrayresult = [];
      let arrayDelay = [];
      let arrayTrue = [];
      // console.log(result.length, ProjectID);
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        if (
          element.Done === "true" &&
          String(element.Difference).startsWith("-")
        ) {
          arrayDelay.push(index);
        }

        if (element?.rate === 0) {
          arrayresult.push(element?.rate);
        }
        if (element?.rate === 100) {
          arrayTrue.push(element?.rate);
        }
      }
      // اجمالي الهام
      const accountallStageProject = await SELECTTablecompanybrinshStagesSubAll(
        ProjectID
      );
      const countall = accountallStageProject["COUNT(StageSubName)"];

      // اجمالي المهام المنفذة
      const accountTrueStage = await SELECTTablecompanybrinshStagesSubAll(
        ProjectID,
        "true"
      );
      // اجمالي قيد الانتظار
      const accountFalseStage = await SELECTTablecompanybrinshStagesSubAll(
        ProjectID,
        "false"
      );

      // عدد المراحل المنجزة
      const countTrue = accountTrueStage["COUNT(StageSubName)"];

      // النسبة المئوية للمشروع
      const rateProject = await PercentagecalculationforProject(ProjectID);

      // قيد الانتظار
      //  عدد المهام قيد التنفيذ
      const StagesPending = accountFalseStage["COUNT(StageSubName)"];
      // المتأخرة
      //  عدد المراحل المتأخرة
      const LateStages = arrayDelay.length;

      const DelayProject = await SELECTTableStageNotesAllproject(ProjectID);

      // حساب الايام المتبقية
      const { TotalDay, ratematchtime } =
        await Numberofdaysremainingfortheproject(ProjectID);

      // استخراج تاخري نهاية اخر مرحلة رئيسية في المشروع
      const dataStage = await SELECTTablecompanySubProjectStageCUSTONe(
        ProjectID,
        0,
        "notifcation",
        "cu.ProjectID=?"
      );
      const EndDateProject = dataStage?.EndDate;

      // استخراج تاريخ بداية المشروع
      const DataProject = await SELECTTablecompanySubProject(
        ProjectID,
        "difference"
      );
      const startDateProject = new Date(DataProject[0]?.ProjectStartdate);

      // اجمالي المالية
      const Amount = await SELECTSUMAmountandBring(ProjectID);

      // الطلبات
      const countallRequests = await SELECTDataAndTaketDonefromTableRequests(
        ProjectID,
        "allCount"
      );
      //  عدد الطلبات المغلقة
      const countCLOSE = await SELECTDataAndTaketDonefromTableRequests(
        ProjectID,
        "false"
      );
      let RateRequests =
        (countCLOSE["COUNT(Done)"] / countallRequests["COUNT(Done)"]) * 100;
      if (isNaN(RateRequests)) {
        RateRequests = 0;
      }
      // عدد الطلبات المفتوحة
      const countOPEN = await SELECTDataAndTaketDonefromTableRequests(
        ProjectID,
        "true"
      );
      // اكثر مهندس متفاعل عبر معرفة اكثر المهام منجزة

      const userMostAccomplished = await ExtractTheMostAccomplished(
        ProjectID,
        countTrue
      );
      const itemProject = await SELECTProjectStartdate(ProjectID, "Const");
      const { daysDifference, Total } = await AccountCostProject(
        itemProject.id,
        itemProject.ConstCompany
      );

      // استخراج مدير الفرع
      const userdata = await SELECTTableusersBranshmanger([
        DataProject[0]?.IDcompanySub,
      ]);

      let data = {
        countSTageTrue: countTrue,
        countStageall: countall,
        rateProject: rateProject,
        StagesPending: StagesPending,
        LateStages: LateStages,
        countallRequests: countallRequests["COUNT(Done)"],
        countCLOSE: countCLOSE["COUNT(Done)"],
        countOPEN: countOPEN["COUNT(Done)"],
        RateRequests: RateRequests,
        MostAccomplished: userMostAccomplished,
        DaysUntiltoday: daysDifference,
        TotalcosttothCompany: Total,

        Nameproject: DataProject[0].Nameproject,
        TypeOFContract: DataProject[0].TypeOFContract,
        Daysremaining: TotalDay,
        ratematchtime: ratematchtime,
        EndDateProject: EndDateProject,
        startDateProject: startDateProject,
        TotalRevenue: Amount?.TotalRevenue,
        TotalExpense: Amount?.TotalExpense,
        TotalReturns: Amount?.TotalReturns,
        TotalDelayDay:
          DelayProject.length > 0
            ? DelayProject.map((item) => item.countdayDelay).reduce(
                (item, r) => item + r
              )
            : 0,
        DelayProject: DelayProject,
        boss: userdata.userName,
        NameCompany: userdata.NameCompany,
      };
      res.send({ success: "تمت العملية بنجاح", data: data }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(404);
    }
  };
};

// تقرير الجدول الزمني

const BringreportTimeline = () => {
  return async (req, res) => {
    const { ProjectID } = req.query;
    const userSession = req.session.user;
    if (!userSession) {
      res.status(401).send("Invalid session");
      return console.log("Invalid session");
    }


    const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
      if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      }


    const company = await SELECTTablecompany(
      userSession?.IDCompany,
      "NameCompany,CommercialRegistrationNumber"
    );
    let date = moment().tz("Asia/Riyadh").format("hh");
    let namefile = `${ProjectID}_${date}_BringreportTimeline.pdf`;
    const result = await SelectReportTimeline(
      ProjectID,
      moment.parseZone().format("yyy-MM-DD")
    );
    const outputPrefix = `${company.CommercialRegistrationNumber}/report/${namefile}`;

    if (await checkIfFileExists(outputPrefix)) {
      return res
        .status(200)
        .send({
          success: true,
          message: "تم انشاء التقرير بنجاح",
          namefile: outputPrefix,
        });
    }

    const filePath = path.join(__dirname, "../../upload", namefile);
    const html = await HtmlStatmentTimline(result, company);
    await convertHtmlToPdf(html, filePath);
    if (fs.existsSync(filePath)) {
      await uploadFile(outputPrefix, filePath);
      deleteFileSingle(namefile, "upload");
    } else {
      return res
        .status(400)
        .send({
          success: false,
          message: "فشل في تنفيذ العملية - الملف غير موجود",
        });
    }

    res
      .status(200)
      .send({
        success: true,
        message: "تم انشاء التقرير بنجاح",
        namefile: outputPrefix,
      });
  };
};
const BringreportRequessts = () => {
  return async (req, res) => {
    const { id, type = "part" } = req.query;
    const userSession = req.session.user;
    if (!userSession) {
      res.status(401).send("Invalid session");
      return console.log("Invalid session");
    }
    const company = await SELECTTablecompany(
      userSession?.IDCompany,
      "NameCompany,CommercialRegistrationNumber"
    );
    let job = ["Admin", "طلبيات", "مدير الفرع"];
    let jobdiscrption = userSession.jobdiscrption === "موظف";

    let namemin = !job.includes(userSession.PhoneNumber)
      ? userSession.PhoneNumber
      : "admin";
    let date = moment().tz("Asia/Riyadh").format("hh");
    let namefile = `${String(namemin).replace(
      /\s+/g,
      ""
    )}${type}_${id}_${date}_requests.pdf`;
    const outputPrefix = `${company.CommercialRegistrationNumber}/report/${namefile}`;

    if (await checkIfFileExists(outputPrefix)) {
      return res
        .status(200)
        .send({ success: "تم انشاء التقرير بنجاح", namefile: outputPrefix });
    }

    let ProjectID = [];
    if (!jobdiscrption) {
      const dataproject = await SELECTTusersProjectProjectall(
        userSession.PhoneNumber
      );
      ProjectID =
        dataproject.length > 0 &&
        dataproject.map((item) => item.ProjectID).join(", ");
    }

    let typeuser = "";

    if (!job.includes(userSession.job)) {
      if (jobdiscrption) {
        typeuser = `AND u1.PhoneNumber = ${userSession.PhoneNumber}`;
      } else if (type === "all") {
        typeuser = `AND cs.id IN (${ProjectID})`;
      } else {
        typeuser = "";
      }
    }
    let where =
      type === "all"
        ? `cs.IDcompanySub=${id} ${typeuser} `
        : `cs.id=${id} ${typeuser}`;

    const resulttotal = await SelectOrdertabletotalreport(where);
    const result = await SelectdetailsOrders(where);
    if (result.length === 0) {
      return res
        .status(200)
        .send({
          success: false,
          message: "فشل في تنفيذ العملية - لا توجد بيانات لعرضها",
        });
    }

    const filePath = path.join(__dirname, "../../upload", namefile);
    await generateRequestsReportPDF({
      result,
      count: resulttotal,
      company,
      outputPath: filePath,
      chunkSize: 300, // زِد/قلّل حسب الحجم
      landscape: false,
      type: type,
    })
      .then((info) => {
        // console.log("تم إنشاء التقرير:", info);
      })
      .catch(console.error);
    if (fs.existsSync(filePath)) {
      await uploadFile(outputPrefix, filePath);
      deleteFileSingle(namefile, "upload");
    } else {
      return res
        .status(200)
        .send({
          success: false,
          message: "فشل في تنفيذ العملية - الملف غير موجود",
        });
    }
    res
      .status(200)
      .send({
        success: true,
        message: "تم انشاء التقرير بنجاح",
        namefile: outputPrefix,
      });
  };
};

const BringreportStage = () => {
  return async (req, res) => {
    const { ProjectID, StageID } = req.query;
    const userSession = req.session.user;
    if (!userSession) {
      res.status(401).send("Invalid session");
      return console.log("Invalid session");
    };

    const chack_for_subscription = await select_table_company_subscriptions(ProjectID);
    if (!chack_for_subscription) {
        return res
          .status(200)
          .send({ success: false, message: "Subscription inactive" });
      };



    const company = await SELECTTablecompany(
      userSession?.IDCompany,
      "NameCompany,CommercialRegistrationNumber"
    );
    let date = moment().tz("Asia/Riyadh").format("hh");
    let namefile = `${ProjectID}_${StageID}_${date}_BringreportStage.pdf`;

    const result = await SELECTTablecompanySubProjectStageCUSTONe(
      ProjectID,
      StageID
    );
    const StageSub = await SELECTTableStageStageSub(ProjectID, StageID);
    const stage_image = await SELECTTableStagesCUST_Image(ProjectID, StageID);
    const outputPrefix = `${company.CommercialRegistrationNumber}/report/${namefile}`;
    if (await checkIfFileExists(outputPrefix)) {
      return res
        .status(200)
        .send({
          success: true,
          message: "تم انشاء التقرير بنجاح",
          namefile: outputPrefix,
        });
    }

    if (!result) {
      return res
        .status(400)
        .send({ success: "فشل في تنفيذ العملية - لا توجد بيانات لعرضها" });
    }

    const filePath = path.join(__dirname, "../../upload", namefile);
    try {
      const file = bucket.file(outputPrefix);
      await file.delete();
    } catch (err) {
      // لا نُفشل العملية بسبب فشل الحذف؛ نُسجل فقط
      // console.log("Delete previous file error:", err?.message || err);
    }

    const html = HtmlStatmentStage(stage_image, result, company, StageSub);
    await convertHtmlToPdf(html, filePath);

    if (fs.existsSync(filePath)) {
      await uploadFile(outputPrefix, filePath);
      deleteFileSingle(namefile, "upload");
    } else {
      return res
        .status(200)
        .send({
          success: false,
          message: "فشل في تنفيذ العملية - الملف غير موجود",
        });
    }
    res
      .status(200)
      .send({
        success: true,
        message: "تم انشاء التقرير بنجاح",
        namefile: outputPrefix,
      });
  };
};

// عملية استخراج بيانات المشروع ككائان واحد
const OpreationExtrinProject = async (element, IDCompany, IDcompanySub) => {
  try {
    if (element?.id !== undefined) {
      const { daysDifference, Total } = await AccountCostProject(
        element.ProjectID !== undefined ? element.ProjectID : element.id,
        element.ConstCompany
      );
      const { TotalDay } = await Numberofdaysremainingfortheproject(
        element.ProjectID !== undefined ? element.ProjectID : element.id
      );

      const data = {
        ...element,
        DaysUntiltoday: daysDifference,
        TotalcosttothCompany: Total,
        Daysremaining: TotalDay,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

// حساب تكاليف المشروع حسب الايام
const AccountCostProject = async (id, ConstCompany) => {
  const DataProject = await SELECTTablecompanySubProject(id, "difference");
  let Total = 0;
  let daysDifference;
  if (DataProject[0]?.ProjectStartdate !== null) {
    let StartDate = new Date(DataProject[0]?.ProjectStartdate);
    const date2 = new Date();
    daysDifference = await differenceInDays(StartDate, date2);
    // console.log(daysDifference);
    Total = parseInt(ConstCompany) * daysDifference;
  }
  if (isNaN(Total) || Total <= 0) {
    Total = 0;
    daysDifference = 0;
  }
  return { daysDifference, Total };
};

// const d = 328
// const b = -124
// console.log((b / d) * 100 )
// const percentageDifference = ((d - Math.abs(b)) / d) * 100;
// console.log(percentageDifference);
// حساب عدد الايام المتبقية للمشروع
const Numberofdaysremainingfortheproject = async (id) => {
  const DataProject = await SELECTTablecompanySubProject(id, "difference");
  let TotalDay = 0;
  let ratematchtime = 0;

  const days = await SELECTTablecompanySubProjectStageCUST(
    id,
    "all",
    "SUM(Days)"
  );
  if (!isNaN(DataProject[0]?.ProjectStartdate)) {
    TotalDay = days[0]["SUM(Days)"];
  } else {
    const DAYSOFStage = days[0]["SUM(Days)"];
    const currentDate = new Date();
    const startDate = new Date(DataProject[0]?.ProjectStartdate);
    startDate.setDate(startDate.getDate() + DAYSOFStage); // إضافة الأيام

    const timeDiff = startDate - currentDate; // الفرق بين التواريخ بالمللي ثانية
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // تحويل الفرق إلى أيام

    TotalDay = dayDiff;
  }
  ratematchtime =
    ((TotalDay + days[0]["SUM(Days)"]) / days[0]["SUM(Days)"]) * 100;
  // ratematchtime = (TotalDay / days[0]['SUM(Days)']) * 100;

  return { TotalDay, ratematchtime };
};

// حساب فارق الايام
function differenceInDays(startDate, endDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24; // Milliseconds in one day
  const differenceInMilliseconds = endDate - startDate; // Difference in milliseconds
  return Math.floor(differenceInMilliseconds / millisecondsPerDay); // Convert to days
}

// استيراد النسبئة المئوية للمشروع

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

//  استيراد النسبئة المئوية للمرحلة
const PercentagecalculationforSTage = async (StageID, ProjectID) => {
  try {
    const accountallStageSub =
      await SELECTTablecompanySubProjectStageCUSTSubCount(StageID, ProjectID);
    const countall = accountallStageSub["COUNT(StageSubName)"];
    const accountTrueStageSub =
      await SELECTTablecompanySubProjectStageCUSTSubCount(
        StageID,
        ProjectID,
        "true"
      );
    const countTrue = accountTrueStageSub["COUNT(StageSubName)"];
    let rate = (countTrue / countall) * 100;

    if (isNaN(rate)) {
      rate = 0;
    }
    return rate;
  } catch (error) {
    console.log(error);
  }
};

// طلب ملفات الفرعية في الارشيف
const BringchildeArchives = async (children, idSub) => {
  return new Promise(async (resolve, reject) => {
    try {
      const folder = children?.find(
        (folder) => parseInt(folder.id) === parseInt(idSub)
      );

      if (folder) {
        resolve(folder.children);
      } else {
        children?.forEach(async (pic) => {
          if (pic.children) {
            const childrenNew = await BringchildeArchives(pic.children, idSub);
            // if(childrenNew !== undefined){
            resolve(childrenNew);
            // }
          }
        });
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
// استخراج الملفات والصورة من المجلد الفرعي
const ExtractDatafromFolderchilde = async (children) => {
  return new Promise((resolve, reject) => {
    let array = [];
    try {
      children?.forEach((pic, index) => {
        array.push({
          id: pic.id,
          namefile: `${pic.Date}(${index + 1})`,
          name: pic.name,
          type: pic.type,
          size: pic?.size !== undefined ? pic.size : null,
        });
      });
      resolve(array);
    } catch (error) {
      console.log(error);
    }
  });
};

//  التحقق ان المطلوب ليس من الملفات الرئيسية
const verifyfromfiletname = (folder) => {
  try {
    if (
      folder !== "المراحل" &&
      folder !== "العهد" &&
      folder !== "المرتجعات" &&
      folder !== "الفواتير والسندات"
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

// استخراج ملفات الفرعية للملفات الرئيسية للنظام
const ExtractDatafromFolderHome = async (
  idproject,
  FolderName,
  type = "Home",
  idSub = 0
) => {
  // console.log(FolderName);
  try {
    switch (FolderName) {
      case "المراحل":
        return await ExtractDatafromStage(idproject, type, idSub);
      case "الفواتير والسندات":
        return await ExtractDatafromExpense(idproject, type, idSub);
      case "العهد":
        return await ExtractDatafromRevenue(idproject, type, idSub);
      case "المرتجعات":
        return await ExtractDatafromReturn(idproject, type, idSub);
    }
  } catch (error) {
    console.log(error);
  }
};

// استخراج ملفات المراحل

const ExtractDatafromStage = async (idproject, type, idSub) => {
  try {
    let arrayfolder = [];
    const StagesCUST = await SELECTTablecompanySubProjectStageCUST(idproject);
    if (type === "Home") {
      StagesCUST.forEach((pic) => {
        arrayfolder.push({
          id: pic.StageID,
          idproject: idproject,
          name: pic.StageName,
          type: "folder",
        });
      });
    } else {
      let kind = idSub === "A1" ? "Chat" : "ChatSTAGE";
      const fileArray = await SELECTLastTableChateStage(
        idproject,
        idSub,
        1,
        "files",
        kind
      );
      // console.log(fileArray);
      for (let index = 0; index < fileArray.length; index++) {
        const element = fileArray[index];
        const Files = JSON.parse(element.File);
        if (Files.name !== undefined && Files.name !== "") {
          arrayfolder.push({
            id: index + 1,
            namefile: `${element.Date}(${index + 1})`,
            name: Files.name,
            type: Files.type,
            size: Files.size,
          });
        }
      }
    }

    return arrayfolder;
  } catch (error) {
    console.log(error);
  }
};

// استخراج الفواتير والسندات

const ExtractDatafromExpense = async (idproject, type, idSub) => {
  const dataHome = await SELECTTablecompanySubProjectexpense(
    idproject,
    "InvoiceNO"
  );
  // console.log(dataHome);
  let arrayfolder = [];
  if (type === "Home") {
    dataHome.forEach((pic, index) => {
      arrayfolder.push({
        id: pic.InvoiceNo,
        idproject: idproject,
        name: pic.InvoiceNo,
        type: "folder",
      });
    });
  } else {
    const datasub = await SELECTTablecompanySubProjectexpenseObjectOneforArchif(
      idSub,
      idproject
    );
    const Images = datasub.Image !== null ? JSON.parse(datasub.Image) : [];
    for (let index = 0; index < Images.length; index++) {
      const element = Images[index];
      arrayfolder.push({
        id: index + 1,
        namefile: `${datasub.InvoiceNo}-(${index + 1})`,
        name: element,
        type: "image/jpeg",
        size: 0,
      });
    }
    arrayfolder.push({
      id: arrayfolder.length + 1,
      Data: datasub,
      type: "Data",
      kindPage: "BringExpense",
      size: 0,
    });
  }
  return arrayfolder;
};

//
const ExtractDatafromReturn = async (idproject, type, idSub) => {
  try {
    const dataHome = await SELECTTablecompanySubProjectReturned(idproject);
    let arrayfolder = [];
    if (type === "Home") {
      dataHome.forEach((pic) => {
        arrayfolder.push({
          id: pic.ReturnsId,
          name: pic.ReturnsId,
          type: "folder",
        });
      });
    } else {
      const datasub = await SELECTTablecompanySubProjectReturnedObjectOne(
        idSub
      );
      const Images = datasub.Image !== null ? JSON.parse(datasub.Image) : [];
      for (let index = 0; index < Images.length; index++) {
        const element = Images[index];
        arrayfolder.push({
          id: index + 1,
          namefile: `${datasub.ReturnsId}-(${index + 1})`,
          name: element,
          type: "image/jpeg",
          size: 0,
        });
      }
      arrayfolder.push({
        id: arrayfolder.length + 1,
        Data: datasub,
        type: "Data",
        kindPage: "Return",
        size: 0,
      });
    }
    return arrayfolder;
  } catch (error) {
    console.log(error);
  }
};
const ExtractDatafromRevenue = async (idproject, type, idSub) => {
  try {
    const dataHome = await SELECTTablecompanySubProjectREVENUE(idproject);
    let arrayfolder = [];
    if (type === "Home") {
      dataHome.forEach((pic) => {
        arrayfolder.push({
          id: pic.RevenueId,
          name: pic.RevenueId,
          type: "folder",
        });
      });
    } else {
      const datasub = await SELECTTablecompanySubProjectREVENUEObjectOne(idSub);
      const Images = datasub.Image !== null ? JSON.parse(datasub.Image) : [];
      for (let index = 0; index < Images.length; index++) {
        const element = Images[index];
        arrayfolder.push({
          id: index + 1,
          namefile: `${datasub.RevenueId}-(${index + 1})`,

          name: element,
          type: "image/jpeg",
          size: 0,
        });
      }
      arrayfolder.push({
        id: arrayfolder.length + 1,
        Data: datasub,
        type: "Data",
        kindPage: "BringRevenue",

        size: 0,
      });
    }
    return arrayfolder;
  } catch (error) {
    console.log(error);
  }
};

// استخراج اكثر المهندسين انجازاً
const ExtractTheMostAccomplished = (ProjectID, countTrue) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await SELECTTablecompanySubProjectStagesSub(
        ProjectID,
        0,
        "accomplished"
      );
      let arrayNew = [];
      // console.log(result);
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let arrayClosing = [];
        let Operations =
          element.closingoperations !== null
            ? JSON.parse(element.closingoperations)
            : [];
        for (let P = 0; P < Operations.length; P++) {
          const item = Operations[P];
          if (item.type === "تم الانجاز") {
            arrayClosing.push(item);
          }
        }
        arrayNew.push(arrayClosing[arrayClosing.length - 1]);
      }
      const similarPhoneNumbers = await countOccurrences(
        arrayNew,
        "PhoneNumber"
      );
      // console.log(similarPhoneNumbers);
      const largestNumber = await extractLargestNumber(similarPhoneNumbers);
      let arrayUser = [];
      for (let index = 0; index < largestNumber?.user.length; index++) {
        const items = largestNumber?.user[index];
        const DataUser = await SELECTTableusersCompanyonObject(items);
        let rate = (largestNumber.maxNumber / countTrue) * 100;
        if (isNaN(rate)) {
          rate = 0;
        }
        arrayUser.push({
          id: DataUser.id,
          userName: DataUser.userName,
          IDNumber: DataUser.IDNumber,
          PhoneNumber: DataUser.PhoneNumber,
          image: DataUser.image,
          job: DataUser.job,
          Count: largestNumber.maxNumber,
          rate: rate,
        });
      }
      resolve(arrayUser);
    } catch (error) {
      console.log(error);
    }
  });
};

// const data = { Alice: 4, Bob: 2,Bobd: 4, Charlie: 1 };

// Function to extract the largest number
function extractLargestNumber(obj) {
  const maxNumber = Math.max(...Object.values(obj));
  const user = Object.entries(obj)
    .filter(([key, value]) => value === maxNumber)
    .map((item) => item[0]);
  return { user, maxNumber };
}

// const largestNumber = extractLargestNumber(data);
// console.log(largestNumber); // Output: 4

// Sample data array
// let array = [
//   { id: 1001, userName: 'Alice', PhoneNumber: '1234567890', Date: new Date().toDateString() },
//   { id: 1002, userName: 'Bob', PhoneNumber: '1234567891', Date: new Date().toDateString() },
//   { id: 1003, userName: 'Alice', PhoneNumber: '1234567890', Date: new Date().toDateString() },
//   { id: 1004, userName: 'Charlie', PhoneNumber: '1234567892', Date: new Date().toDateString() },
//   { id: 1005, userName: 'Bob', PhoneNumber: '1234567891', Date: new Date().toDateString() },
// ];
function countOccurrences(arr, key) {
  return arr.reduce((acc, item) => {
    const value = item[key];
    if (acc[value]) {
      acc[value] += 1; // Increment count if already exists
    } else {
      acc[value] = 1; // Initialize count
    }
    return acc;
  }, {});
}

// const phoneNumberCounts = countOccurrences(array, 'userName');
// console.log(phoneNumberCounts);

// Function to extract duplicates based on userName or PhoneNumber
// function extractSimilarElements(arr, key) {
//     const seen = new Set();
//     const duplicates = arr.filter(item => {
//         const value = item[key];
//         if (seen.has(value)) {
//             return true; // Found a duplicate
//         }
//         seen.add(value);
//         return false;
//     });
//     return [...new Set(duplicates)]; // Remove duplicates from the result
// }

// Extract duplicates based on PhoneNumber

// const similarPhoneNumbers = extractSimilarElements(array, 'PhoneNumber');
// console.log(similarPhoneNumbers);
module.exports = {
  BringProject,
  BringStageTemplet,
  BringStage,
  BringStagesub,
  BringStageNotes,
  BringExpense,
  BringRevenue,
  BringReturned,
  BringArchives,
  BringArchivesFolderdata,
  PercentagecalculationforSTage,
  BringStageOneObject,
  BringArchivesFolderdata,
  BringTotalAmountproject,
  BringStatmentFinancialforproject,
  SearchinFinance,
  BringDataRequests,
  BringCountRequsts,
  BringReportforProject,
  BringProjectObjectone,
  BringDataprojectClosed,
  FilterProject,
  BringDataRequestsV2,
  BringCountRequstsV2,
  BringStagev2,
  BringProjectdashbord,
  FilterProjectdashbord,
  BringreportTimeline,
  BringreportRequessts,
  BringStageCustImage,
  BringreportStage,
};
