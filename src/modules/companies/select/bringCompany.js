const path = require('path');
const fs = require('fs');
const redis = require('../../../../middleware/cache');
const {
  SELECTTablecompany,
  SELECTTableFinancialCustody,
  SELECTTableMaxFinancialCustody,
  SELECTTablecompanyRegistrationall,
  SELECTTableUsernameBrinsh,
  SELECTTablecompanySubuser,
  selectdetailsFcialCustodforreport,
  selectCountFcialCustodforreport,
} = require('../../../../sql/selected/selected');
const { SELECTTableusersCompanyonObject } = require('../../../../sql/selected/selectuser');
const { generateRequestsReportPDF } = require('../../../../pdf/convertotpdf');
const { uploadFile } = require('../../../../bucketClooud');
const { deleteFileSingle } = require('../../../../middleware/Fsfile');

const bringDataCompanyRegistration = () => {
  return async (req, res) => {
    try {
      const { type = 'companyRegistration', LastID = 0 } = req.query;
      const company = await SELECTTablecompanyRegistrationall(type, LastID);
      res.send({ masseg: 'sucssfuly', data: company }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ masseg: 'sucssfuly' }).status(400);
    }
  };
};
const bringDataCompany = () => {
  return async (req, res) => {
    try {
      // console.log(req.query);
      const idCompany = req.query.idCompany;
      const company = await SELECTTablecompany(idCompany);
      res.send({ masseg: 'sucssfuly', data: company }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ masseg: 'فشل تنفيذ العملية' }).status(402);
    }
  };
};

const BringNameCompany = () => {
  return async (req, res) => {
    try {
      const IDCompany = req.query.IDCompany;
      const result = await SELECTTableUsernameBrinsh(IDCompany);

      res.send({ success: 'successfuly', data: result }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

// طلب بيانات الشركة والفروع

const biringDatabrinshCompany = () => {
  return async (req, res) => {
    try {
      const { IDCompany, type } = req.query;
      const userSession = req.session.user;

      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }

      const key = `Bransh:${userSession?.PhoneNumber}:${IDCompany}`;

      // const cached = await redis.get(key);
      // if (cached && type === 'cache') {
      //   const cachedData = JSON.parse(cached);
      //   // console.log("Data fetched from cache");
      //   return res.send({ masseg: 'succfuly', ...cachedData }).status(200);
      // }

      const result = await getCompanyBranchesForUser(IDCompany, userSession);
      
      res
        .send({
          masseg: 'succfuly',
          ...result,
        })
        .status(200);

      await redis.set(key, JSON.stringify(result), 'EX', 60 * 1000);
    } catch (error) {
      console.log(error);
    }
  };
};

// Standalone function to get company branches and related data for a user
async function getCompanyBranchesForUser(IDCompany, userSession) {
  // const Datausere = await SELECTTableusersCompanyonObject(
  //   userSession.PhoneNumber
  // );
  const arrayBrinsh = await SELECTTablecompanySubuser(userSession.PhoneNumber);
  const Covenantnumber = await SELECTTableMaxFinancialCustody(
    IDCompany,
    'count',
    'COUNT(idOrder) AS count',
  );
  const company = await SELECTTablecompany(
    IDCompany,
    'NameCompany,CommercialRegistrationNumber,Country',
  );

  return {
    data: arrayBrinsh,
    nameCompany: company?.NameCompany,
    CommercialRegistrationNumber: company?.CommercialRegistrationNumber,
    Country: company?.Country,
    Covenantnumber: Covenantnumber?.count,
    Subscription_available: company.is_limit_reached === 1,
  };
}

//  طلبات بيانات العهد

const BringDataFinancialCustody = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      const resultUser = await SELECTTableusersCompanyonObject(userSession.PhoneNumber);

      let Bringaway;
      const IDCompany = userSession.IDCompany;
      const {
        kindRequest = 'معلقة',
        IDCompanySub,
        LastID = 0,
        type = 'FinancialCustodyparty',
      } = req.query;

      const Validityuser = await KnowuserpermissioninCovenant(
        resultUser.Acceptingcovenant,
        IDCompanySub,
        userSession.PhoneNumber,
        resultUser.job,
        type,
      );

      let plase = parseInt(LastID) === 0 ? '>' : '<';
      switch (kindRequest) {
        case 'معلقة':
          Bringaway = `${Validityuser}  OrderStatus='false' AND RejectionStatus='false' AND fi.id ${plase} ${LastID}`;
          break;
        case 'مغلقة':
          Bringaway = `${Validityuser}  OrderStatus='true' AND RejectionStatus='false' AND fi.id ${plase} ${LastID}`;
          break;
        case 'مرفوضة':
          Bringaway = `${Validityuser}  RejectionStatus='true' AND fi.id ${plase} ${LastID}`;
          break;
      }
      const result = await SELECTTableFinancialCustody(IDCompany, Bringaway);

      res.send({ success: 'تمت العملية بنجاح', data: result }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ العملية' }).status(500);
    }
  };
};

const KnowuserpermissioninCovenant = (Acceptingcovenant, IDCompanySub, userName, job, type) => {
  try {
    if (type !== 'FinancialCustodyparty') {
      if (job !== 'Admin' && job !== 'مالية') {
        return `trim(Requestby)=trim(${userName}) AND`;
      }
    } else {
      if (Acceptingcovenant === 'true' || job === 'Admin' || job === 'مالية') {
        return `IDCompanySub=${IDCompanySub} AND`;
      } else {
        return `IDCompanySub=${IDCompanySub} AND trim(Requestby)=trim(${userName}) AND`;
      }
    }
    return '';
  } catch (error) {
    console.log(error);
  }
};

const BringreportFinancialCustody = () => {
  return async (req, res) => {
    let { IDCompanySub = 0, type = 'FinancialCustodyall' } = req.query;
    const userSession = req.session.user;
    if (!userSession) {
      res.status(401).send('Invalid session');
      return;
    }

    let job = ['Admin', 'مالية', 'مدير الفرع'];

    let where = '';

    if (type === 'FinancialCustodyparty') {
      if (job.includes(userSession?.job)) {
        where = `AND fy.IDCompanySub = ${IDCompanySub}`;
      } else {
        where = `AND fy.IDCompanySub = ${IDCompanySub} AND TRIM(fy.Requestby) = TRIM(${userSession.PhoneNumber})`;
      }
    }

    const resulttotal = await selectCountFcialCustodforreport(userSession?.IDCompany, where);
    const result = await selectdetailsFcialCustodforreport(userSession?.IDCompany, where);
    let namemin =
      type === 'FinancialCustodyall'
        ? result[0]?.NameCompany
        : !job.includes(userSession?.job)
          ? userSession.PhoneNumber
          : result[0].NameSub;
    let namefile = `${String(namemin).replace(/\s+/g, '')}_${type}.pdf`;
    const outputPrefix = `${result[0].CommercialRegistrationNumber}/report/${namefile}`;

    const filePath = path.join(__dirname, '../../upload', namefile);

    await generateRequestsReportPDF({
      result,
      count: resulttotal,
      company: result[0],
      outputPath: filePath,
      chunkSize: 500, // زِد/قلّل حسب الحجم
      landscape: false,
      type: type,
    })
      .then((info) => {
        // console.log("تم إنشاء التقرير:", info);
      })
      .catch(console.error);
    if (fs.existsSync(filePath)) {
      await uploadFile(outputPrefix, filePath);
      deleteFileSingle(namefile, 'upload');
    } else {
      return res
        .status(200)
        .send({ success: false, message: 'فشل في تنفيذ العملية - الملف غير موجود' });
    }
    res
      .status(200)
      .send({ success: true, message: 'تم انشاء التقرير بنجاح', namefile: outputPrefix });
  };
};

module.exports = {
  biringDatabrinshCompany,
  bringDataCompany,
  BringDataFinancialCustody,
  bringDataCompanyRegistration,
  BringNameCompany,
  BringreportFinancialCustody,
};
