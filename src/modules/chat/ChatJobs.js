const {
  SELECTTablecompanySubProjectStageCUST,
  selecttablecompanySubProjectall,
} = require("../../../sql/selected/selected");
const {
  SELECTTableusersCompanyonObject,
} = require("../../../sql/selected/selectuser");
const { ClassChatOpration, ClassChatOprationView } = require("./ChatJobsClass");

//   عمليات استقبال وارسال ومشاهدة شات المراحل

// عملية ارسال واستقبال لشات المراحل
const ChatOpration = async (Socket,io) => {
  ClassChatOpration(Socket, io);
};
// عملية مشاهدة لرسائل شات المراحل
const ChatOprationView = async (Socket,io) => {
  Socket.on("view_message", async (data) => {
    await ClassChatOprationView(data);
  });
};

// عمليات جلب بيانات المشاريع والمراحل

const BringDataprojectAndStages = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const PhoneNumber = userSession.PhoneNumber;
      const numberData = req.query.numberData;

      const arrayData = await filterProjectforaddinsertArray(
        PhoneNumber,
        parseInt(numberData)
      );
      // طلب بيانات المشاريع والمراحل
      const ListData = await BringStageforfilterProject(arrayData);
      res.send({ success: "تمت العملية بنجاح", data: ListData }).status(200);
      // جلب بيانات المشاريع
      // جلب بيانات المراحل الخاص بكل مشروع
      // ادخال المراحل في مصفوفة داخل المشروع
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(200);
    }
  };
};
// فلترة بيانات المشاريع حسب المستخدم وضمها داخل مصفوفة
const filterProjectforaddinsertArray = (PhoneNumber, IDfinlty = 0) => {
  try {
    return new Promise(async (resolve, reject) => {
      const Datausere = await SELECTTableusersCompanyonObject(PhoneNumber);
      const result = await selecttablecompanySubProjectall(
        0,
        IDfinlty,
        Datausere.id,
        "true",
        "LIMIT 3",
        "forchatAdmin"
      );

      resolve(result);
    });
  } catch (error) {
    console.log(error);
  }
};

//  جلب بيانات المراحل حسب المشروع المطلوب للدردشة
const BringStageforfilterProject = (dataPorject) => {
  let ListData = [];

  return new Promise(async (resolve, reject) => {
    await Promise.all(
      dataPorject?.map(async (pic) => {
        const dataStage = await SELECTTablecompanySubProjectStageCUST(
          pic.ProjectID,
          "all",
          "StageID,StageName"
        );

        ListData.push({
          id: pic.ProjectID,
          ProjectID: pic.ProjectID,
          Nameproject: pic.Nameproject,
          arrayStage: dataStage,
        });
        // await DeleteTableProjectdataforchat(pic.id ,"id=?");
      })
    );

    resolve(ListData);
  });
};

module.exports = {
  ChatOpration,
  ChatOprationView,
  BringDataprojectAndStages,
  filterProjectforaddinsertArray,
  BringStageforfilterProject,
};
