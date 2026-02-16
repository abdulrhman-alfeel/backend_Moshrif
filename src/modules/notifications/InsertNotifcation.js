const { insertTableNavigation } = require('../../../sql/INsertteble');
const {
  SELECTTableIDcompanytoPost,
  SELECTTableNavigation,
  SELECTTableNavigationObjectOne,
  SelectVerifycompanyexistence,
} = require('../../../sql/selected/selected');

const InsertNotifcation = async (
  token,
  notification,
  notification_type,
  navigationId,
  data,
  id,
  type = 'pr.id',
  select = 'pr.id',
) => {
  try {
    // await DeleteTableNotifcation();
    let result;
    if (type === true) {
      result = await SelectVerifycompanyexistence(id);
    } else {
      result = await SELECTTableIDcompanytoPost(id, type, select);
    }
    const endData = [
      type === true ? result?.id : result?.NumberCompany,
      type === true ? id : result?.id,
      JSON.stringify(notification),
      token.length > 0 ? JSON.stringify(token) : null,
      JSON.stringify({
        notification_type: notification_type,
        navigationId: navigationId,
        data: JSON.stringify(data),
      }),
      new Date().toUTCString(),
    ];
    await insertTableNavigation(endData);
    const maxData = await SELECTTableNavigationObjectOne(
      parseInt(type === true ? result?.id : result?.NumberCompany),
    );
    return maxData?.id;
  } catch (error) {
    console.log(error);
  }
};

// جلب بيانات الاشعارات لليوم
const BringDataNotifcation = () => {
  return async (req, res) => {
    try {
      const LastID = req.query.LastID;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      const result = await SELECTTableNavigation([
        parseInt(LastID),
        parseInt(userSession.IDCompany),
      ]);

      const arrayNotifcation = await Sortdatauserfromnotification(result, userSession.userName);
      res.send({ success: 'تمت العملية بنجاح', data: arrayNotifcation }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ العملية العملية بنجاح' }).status(401);
    }
  };
};

// جلب بيانات الاشعارات حسب الفلتر
const FilterNotifcation = () => {
  return async (req, res) => {
    try {
      try {
        const { LastID, from, to } = req.query;
        const userSession = req.session.user;
        if (!userSession) {
          res.status(401).send('Invalid session');
          console.log('Invalid session');
        }
        const result = await SELECTTableNavigation(
          [parseInt(LastID), parseInt(userSession.IDCompany), from, to],
          `AND Date(DateDay) BETWEEN ?  AND ?`,
        );
        const arrayNotifcation = await Sortdatauserfromnotificationv2(result, userSession.userName);

        res.send({ success: 'تمت العملية بنجاح', data: arrayNotifcation }).status(200);
      } catch (error) {
        console.log(error);
        res.send({ success: 'فشل تنفيذ العملية العملية بنجاح' }).status(401);
      }
    } catch (error) {
      console.log(error);
    }
  };
};

async function kind_opreation(IDCompanySub, ProjectID, type) {
  return type === 'bransh'
    ? `AND ca.IDCompanySub=${IDCompanySub}`
    : type === 'project'
      ? `AND ca.ProjectID=${ProjectID}`
      : type === 'chat'
        ? '='
        : '!=';
}

const BringDataNotifcationv2 = () => {
  return async (req, res) => {
    try {
      const { LastID, type = 'notifc', ProjectID = 0, IDCompanySub = 0 } = req.query;
      const userSession = req.session.user;

      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      const kind = await kind_opreation(IDCompanySub, ProjectID, type);

      const result = await SELECTTableNavigation(
        [parseInt(LastID), parseInt(userSession.IDCompany)],
        [userSession.userID],
        '',
        kind,
      );
      const arrayNotifcation = await Sortdatauserfromnotificationv2(result);
      res.send({ success: 'تمت العملية بنجاح', data: arrayNotifcation }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ العملية العملية بنجاح' }).status(401);
    }
  };
};

// جلب بيانات الاشعارات حسب الفلتر
const FilterNotifcationv2 = () => {
  return async (req, res) => {
    try {
      const { LastID, from, to, ProjectID = 0, IDCompanySub = 0, type = 'notifc' } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send('Invalid session');
        console.log('Invalid session');
      }
      const kind = await kind_opreation(IDCompanySub, ProjectID, type);

      const result = await SELECTTableNavigation(
        [parseInt(LastID), parseInt(userSession.IDCompany), from, to],
        [userSession.userID],
        `AND Date(DateDay) BETWEEN ?  AND ?`,
        kind,
      );

      const arrayNotifcation = await Sortdatauserfromnotificationv2(result, userSession.userName);
      res.send({ success: 'تمت العملية بنجاح', data: arrayNotifcation }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: 'فشل تنفيذ العملية العملية بنجاح' }).status(401);
    }
  };
};

const Sortdatauserfromnotification = (result, userName) => {
  let arrayNotifcation = [];
  if (result.length > 0) {
    result.forEach(async (pic) => {
      // console.log(pic.tokens, userSession?.IDCompany);

      let Token = pic.tokens ? JSON.parse(pic.tokens) : [];
      // console.log(pic,Token);
      Token.forEach(async (item) => {
        if (item === userName) {
          const dataNotifction = JSON.parse(pic.data);

          arrayNotifcation.push({
            notification: JSON.parse(pic.notification),
            data: {
              id: pic.id,
              Date: pic.Date,
              notification_type: dataNotifction?.notification_type,
              navigationId: dataNotifction?.navigationId,
              data: JSON.stringify(dataNotifction?.data),
            },
          });
        }
      });
    });
  }
  return arrayNotifcation;
};
const Sortdatauserfromnotificationv2 = (result) => {
  let arrayNotifcation = [];
  if (result.length > 0) {
    result.forEach(async (pic) => {
      const dataNotifction = JSON.parse(pic.data);
      const data = JSON.parse(dataNotifction?.data);
      const color = await switchColor(data?.jobUser);
      arrayNotifcation.push({
        id: pic.id,
        ...data,
        title: JSON.parse(pic.notification)?.title,
        discrption: JSON.parse(pic.notification)?.body,
        navigationId: dataNotifction?.navigationId,
        page: dataNotifction?.notification_type,
        color: color,
        IDcompanySub:
          dataNotifction?.notification_type === 'CovenantBrinsh'
            ? dataNotifction?.navigationId
            : JSON.parse(dataNotifction?.data)?.IDcompanySub,
        Date: pic.Date,
        view: false,
      });
    });
  }
  return arrayNotifcation;
};

const switchColor = (job) => {
  const arrayRed = ['مالك', 'Admin', 'مدير عام'];
  if (arrayRed.includes(job)) return '#FF0F0F';
  if (job === 'مدير الفرع') return '#10B982';
  return '#f6f8fe';
};
module.exports = {
  InsertNotifcation,
  BringDataNotifcation,
  FilterNotifcation,
  BringDataNotifcationv2,
  FilterNotifcationv2,
};
// {"notification_type":"PublicationsBransh","navigationId":"17201/1/navigation","data":"{\"ProjectID\":198,\"userName\":\"علي المطيري\",\"kind\":\"تعليق\",\"type\":\"Comment\",\"data\":{\"CommpanyID\":1,\"CommentID\":292,\"PostId\":17201,\"commentText\":\"أبد اللي تشوفه مناسب\",\"Date\":\"2025-11-02T14:46:20.336Z\",\"userName\":\"علي المطيري\"},\"PostID\":17201,\"count\":1}"}

// {"notification_type":"Finance","navigationId":"247","data":"{\"ProjectID\":247,\"userName\":\"محمد العبيد\",\"kind\":\"عهد\",\"type\":\"إضافة\",\"data\":{\"NumberCompany\":1,\"RevenueId\":1757,\"projectID\":247,\"Amount\":40000,\"Date\":\"2025-11-02\",\"Data\":\"حوالة على الانماء ( عهدة ) لأعمال المشروع\",\"Bank\":\"حوالة مالية\",\"Image\":null},\"IDcompanySub\":1,\"jobUser\":\"مدير الفرع\"}"}
