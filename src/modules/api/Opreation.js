const { uploaddata, DeleteBucket } = require("../../../bucketClooud");
const { deleteFileSingle } = require("../../../middleware/Fsfile");
const { DeleteTablecompanySubProjectallapi } = require("../../../sql/delete");
const {
  insertTablecompanySubProjectexpenseapi,
  insertTablecompanySubProjectREVENUEapi,
  insertTablecompanySubProjectReturnedapi,
} = require("../../../sql/INsertteble");
const {
  SELECTTableFinanceapi,
  SELECTProjectStartdateapis,
  SELECTTablearchivesNamefolder,
} = require("../../../sql/selected/selected");
const {
  UPDATETablecompanySubProjectexpenseapi,
  UPDATETablecompanySubProjectREVENUEapi,
  UPDATETablecompanySubProjectReturnedapi,
  UPDATETablecompanySubProjectFinancial,
  UpdateTablecompanySubProjectapi,
  UPDATETablecompanySubProjectexpenseInvoiceNoapi,
  UPDATETablecompanySubProjectarchivesFolderinChildern,
} = require("../../../sql/update");
const { OpreationProjectInsertv2 } = require("../companies/insert/insertProject");
const {
  Switchbetweendeleteorupdatefiles,
  UpdaterateCost,
} = require("../companies/insert/UpdateProject");
const {
  Projectinsert,
  Financeinsertnotification,
} = require("../notifications/NotifcationProject");

const ProjectOpreationsinsert =  () => {
  return async (req, res) => {
  try {
        const dataCampny = req.session.data;

    const {
      IDcompanySub,
      Nameproject,
      Note,
      TypeOFContract,
      GuardNumber,
      LocationProject,
      numberBuilding,
      Referencenumber,
      userName,
    } = req.body;
    const Contractsigningdate = new Date();
    await OpreationProjectInsertv2(
      IDcompanySub,
      Nameproject,
      Note,
      TypeOFContract,
      GuardNumber,
      LocationProject,
      numberBuilding,
      Referencenumber,
      Contractsigningdate,
      dataCampny?.id

    );
    await Projectinsert(IDcompanySub, userName);
    res
      .send({
        success: "تم انشاء مشروع بنجاح",
      })
      .status(200);
  } catch (error) {
    console.log(error);
  }
}
};

const ProjectOpreationsUpdate =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      IDcompanySub,
      Nameproject,
      Note,
      GuardNumber,
      LocationProject,
      numberBuilding,
      Referencenumber,
      userName,
    } = req.body;
    const StartDate = await SELECTProjectStartdateapis(
      Referencenumber,
      IDcompanySub
    );
    await UpdateTablecompanySubProjectapi(
      [
        Nameproject,
        Note,
        GuardNumber,
        LocationProject,
        numberBuilding,
        IDcompanySub,
        Referencenumber,
        dataCampny?.id,
      ],
      "Referencenumber"
    );
    if (StartDate?.numberBuilding !== numberBuilding) {
      // await RearrangeStageID(StartDate.id, StartDate, numberBuilding);
    }
    await Projectinsert(StartDate.IDcompanySub, userName, "تعديل");
    res
      .send({
        success: "تم تعديل مشروع بنجاح",
      })
      .status(200);
  } catch (error) {
    console.log(error);
  }
}
};

// ادخال المالية
const FinancialOperationsDatainsert =  () => {
  return async (req, res) => {
  try {
    const {
      IDcompanySub,
      Referencenumber,
      Amount,
      Data,
      SectionType,
      Referencenumberfinanc,
      Date,
      userName,
      notifcation,
      Taxable,
      InvoiceNo,
    } = req.body;
    let Taxables = Taxable ? 1 : 0;
    const dataCampny = req.session.data;
    const NumberCompany = dataCampny.id;

    const result = await SELECTTableFinanceapi(
      SectionType,
      Referencenumberfinanc,
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      Referencenumber
    );
    if (!Boolean(result)) {
      const Amountconvert = `${Amount}`.toString().replace(/,/g, "");
      const dataProject = await SELECTProjectStartdateapis(
        Referencenumber,
        IDcompanySub
      );
      const projectID = dataProject?.id;
      if (Boolean(dataProject)) {
        switch (SectionType) {
          case "Expense":
            const ClassificationName = req.body.ClassificationName;
            await OpreationExpensedatainsert(
              Referencenumberfinanc,
              projectID,
              Amountconvert,
              Data,
              ClassificationName,
              Date,
              Taxables,
              InvoiceNo
            );
            notifcation === true &&
              (await Financeinsertnotification(
                projectID,
                "مصروفات",
                "إضافة",
                userName
              ));
            break;
          case "Revenue":
            const Bank = req.body.Bank;
            await insertTablecompanySubProjectREVENUEapi([
              Referencenumberfinanc,
              projectID,
              Amountconvert,
              Data,
              Bank,
              Date,
            ]);
            notifcation === true &&
              (await Financeinsertnotification(
                projectID,
                "عهد",
                "إضافة",
                userName
              ));
            break;
          case "Returns":
            await insertTablecompanySubProjectReturnedapi([
              Referencenumberfinanc,
              projectID,
              Amountconvert,
              Data,
              Date,
            ]);
            notifcation === true &&
              (await Financeinsertnotification(
                projectID,
                "مرتجعات",
                "إضافة",
                userName
              ));
            break;
        }
        res
          .send({
            success: "تم اضافة البيانات  بنجاح",
          })
          .status(200);
          await UpdaterateCost(projectID,'cost');
      } else {
        res
          .send({
            success: "المشروع غير موجود",
          })
          .status(200);
      }
      // Expense
    } else {
      res
        .send({
          success: "البيانات موجودة بالفعل",
        })
        .status(200);
    }
  } catch (error) {
    res
      .send({
        success: "فشل تنفيذ العملية",
      })
      .status(402);
    console.log(error);
  }
}
};

const OpreationExpensedatainsert = async (
  Referencenumberfinanc,
  projectID,
  Amount,
  Data,
  ClassificationName,
  Date,
  Taxables,
  InvoiceNo
) => {
  if (Boolean(Amount) && Boolean(Data)) {
    // const totaldataproject = await SELECTTablecompanySubProjectexpenseObjectOne(
    //   projectID,
    //   "count"
    // );
    // const InvoiceNo = totaldataproject["COUNT(*)"] + 1;
    await insertTablecompanySubProjectexpenseapi([
      Referencenumberfinanc,
      projectID,
      Amount,
      Data,
      ClassificationName,
      InvoiceNo,
      Taxables,
      Date,
    ]);
    
  }
};

// تعديل الملية
const FinancialOperationsDataUpdate =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      IDcompanySub,
      Referencenumber,
      Amount,
      Data,
      SectionType,
      Referencenumberfinanc,
      Date,
      Taxable,
      InvoiceNo,
    } = req.body;
    let Taxables = Taxable ? 1 : 0;

    const Amountconvert = `${Amount}`.toString().replace(/,/g, "");
    // Expense
    switch (SectionType) {
      case "Expense":
        const ClassificationName = req.body.ClassificationName;
        await UPDATETablecompanySubProjectexpenseapi([
          Amountconvert,
          Data,
          ClassificationName,
          Date,
          Taxables,
          InvoiceNo,
          Referencenumberfinanc,
          dataCampny?.id,
          IDcompanySub,
          Referencenumber,
        ]);
        break;
      case "Revenue":
        const Bank = req.body.Bank;
        await UPDATETablecompanySubProjectREVENUEapi([
          Amountconvert,
          Data,
          Bank,
          Date,
          Referencenumberfinanc,
          dataCampny?.id,
          IDcompanySub,
          Referencenumber,
        ]);
        break;
      case "Returns":
        await UPDATETablecompanySubProjectReturnedapi([
          Amountconvert,
          Data,
          Date,
          Referencenumberfinanc,
          dataCampny?.id,
          IDcompanySub,
          Referencenumber,
        ]);
        break;
    }
    res
      .send({
        success: "تم تعديل  بنجاح",
      })
      .status(200);
      await UpdaterateCost(Referencenumber,'cost',"Referencenumber");
  } catch (error) {
    console.log(error);
    res
      .send({
        success: "فشل تنفيذ العملية",
      })
      .status(402);
  }
}
};
const FinancialUpdateInvoiceNo =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const { IDcompanySub, Referencenumber, Referencenumberfinanc, InvoiceNo } =
      req.body;

    // Expense
    await UPDATETablecompanySubProjectexpenseInvoiceNoapi([
      InvoiceNo,
      Referencenumberfinanc,
      dataCampny?.id,
      IDcompanySub,
      Referencenumber,
    ]);
    res
      .send({
        success: "تم تعديل  بنجاح",
      })
      .status(200);
  } catch (error) {
    console.log(error);
    res
      .send({
        success: "فشل تنفيذ العملية",
      })
      .status(402);
  }
}
};

// ادخال الملفات
const FinancialOperationsFile =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      IDcompanySub,
      Referencenumber,
      Referencenumberfinanc,
      SectionType,
    } = req.body;
    const NumberCompany = dataCampny.id;

    const result = await SELECTTableFinanceapi(
      SectionType,
      Referencenumberfinanc,
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      Referencenumber
    );
    let arrayImage =
      SectionType === "Revenue"
        ? []
        : Boolean(result?.Image)
        ? JSON.parse(result?.Image)
        : [];
    if (req.files && req.files.length > 0) {
      for (let index = 0; index < req.files.length; index++) {
        const element = req.files[index];
        await uploaddata(element);
        deleteFileSingle(element.filename, "upload");
        arrayImage?.push(element.filename);
      }
    }
    if (Boolean(SectionType) && req.files.length > 0) {
      await UPDATETablecompanySubProjectFinancial(
        [
          JSON.stringify(arrayImage),
          Referencenumberfinanc,
          dataCampny?.id,
          IDcompanySub,
          Referencenumber,
        ],
        SectionType
      );
      res
        .send({
          success: "تم اضافة الملفات  بنجاح",
        })
        .status(200);
    } else {
      res
        .send({
          success: "فشل تنفيذ العملية",
        })
        .status(402);
    }
  } catch (error) {
    res
      .send({
        success: "فشل تنفيذ العملية",
      })
      .status(402);
  }
}
};
// جلب بيانات الملفات للمالية
const BringDatafileFinancial =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      IDcompanySub,
      Referencenumber,
      Referencenumberfinanc,
      SectionType,
    } = req.query;
    const NumberCompany = dataCampny.id;
    const result = await SELECTTableFinanceapi(
      SectionType,
      parseInt(Referencenumberfinanc),
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      parseInt(Referencenumber)
    );
    let arrayImage = Boolean(result?.Image) ? JSON.parse(result?.Image) : [];
    let arraynew = [];
    for (const item of arrayImage) {
      const data = {
        url: `https://storage.googleapis.com/demo_backendmoshrif_bucket-1`,
        nameFile: item,
      };
      arraynew.push(data);
    }
    res.send({ success: "تمت العملية بنجاح", data: arraynew }).status(200);
  } catch (error) {
    res.send({ success: "فشل تنفيذ العملية" }).status(402);
    console.log(error);
  }
}
};
// حذف الملفات
const DeleteFileinFinancialOperationse =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      IDcompanySub,
      Referencenumber,
      Referencenumberfinanc,
      SectionType,
      nameFile,
    } = req.query;
    const NumberCompany = dataCampny.id;
    const result = await SELECTTableFinanceapi(
      SectionType,
      parseInt(Referencenumberfinanc),
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      parseInt(Referencenumber)
    );
    let arrayImage = Boolean(result.Image) ? JSON.parse(result.Image) : [];
    let arraynew = [];
    if (req.files && arrayImage.length > 0) {
      for (let index = 0; index < arrayImage.length; index++) {
        const element = req.arrayImage[index];
        if (element !== nameFile) {
          arraynew.push(element);
        } else {
          await DeleteBucket(element);
        }
      }
    }

    if (Boolean(SectionType)) {
      await UPDATETablecompanySubProjectFinancial(
        [
          JSON.stringify(arraynew),
          Referencenumberfinanc,
          parseInt(NumberCompany),
          parseInt(IDcompanySub),
          parseInt(Referencenumber),
        ],
        SectionType
      );
      res
        .send({
          success: "تمت العملية بنجاح",
        })
        .status(200);
    } else {
      res
        .send({
          success: "فشل تنفيذ العملية",
        })
        .status(402);
    }
  } catch (error) {
    console.error(error);
    res
      .send({
        success: "فشل تنفيذ العملية",
      })
      .status(402);
  }
}
};

const DeleteOperationsFinancial =  () => {
  return async (req, res) => {
  try {
    const dataCampny = req.session.data;
    const {
      SectionType,
      Referencenumberfinanc,
      IDcompanySub,
      Referencenumber,
    } = req.query;
    const NumberCompany = dataCampny.id;
    const result = await SELECTTableFinanceapi(
      SectionType,
      Referencenumberfinanc,
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      Referencenumber
    );
    let Images = Boolean(result.Image) ? JSON.parse(result.Image) : [];
    for (let index = 0; index < Images.length; index++) {
      const element = Images[index];
      await Switchbetweendeleteorupdatefiles(element, "", "delete");
    }
    await DeleteTablecompanySubProjectallapi(
      SectionType,
      Referencenumberfinanc,
      parseInt(NumberCompany),
      parseInt(IDcompanySub),
      Referencenumber
    );
    res.status(200).send({ success: "تمت العملية بنجاح" });
  await UpdaterateCost(Referencenumber,'cost',"Referencenumber");
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
};

const AddfilesinArchives =  () => {
  return async (req, res) => {
  try {
    const { IDcompanySub, Referencenumber } = req.body;
    const project = await SELECTProjectStartdateapis(
      Referencenumber,
      IDcompanySub
    );
    if (Boolean(project)) {
      const ProjectID = project?.id;
      await uploaddata(req.file);
      const dataFolder = await SELECTTablearchivesNamefolder(
        "العقود والضمانات",
        ProjectID
      );
      if(Boolean(dataFolder)){
        let Children =
          dataFolder?.children !== null ? JSON.parse(dataFolder?.children) : [];
        Children.push(
          {
            id: Math.floor(100000 + Math.random() * 900000),
            Date: new Date().toISOString(),
            name: req.file?.filename,
            type: req.file?.mimetype,
            size: req.file?.size,
          }
        );
  
        await UPDATETablecompanySubProjectarchivesFolderinChildern([
          JSON.stringify(Children),
          dataFolder?.ArchivesID,
        ]);
      }
    res.send({ success: "تمت العملية بنجاح" }).status(200);
    }else{
    res.send({ success: "المشروع غير موجود" }).status(200);
    }
  } catch (error) {
    console.log(error);
    res.send({ success: "تمت العملية بنجاح" }).status(200);

  }
}
};

module.exports = {
  ProjectOpreationsinsert,
  ProjectOpreationsUpdate,
  FinancialOperationsDatainsert,
  FinancialOperationsDataUpdate,
  FinancialOperationsFile,
  DeleteOperationsFinancial,
  DeleteFileinFinancialOperationse,
  BringDatafileFinancial,
  FinancialUpdateInvoiceNo,
  AddfilesinArchives
};
