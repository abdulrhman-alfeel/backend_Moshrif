const { calculateHoursBetween } = require("../../../middleware/Aid");
const { DeleteUserPrepare } = require("../../../sql/delete");
const {
  inserttableAvailabilityday,
  insertTablecheckPreparation,
  inserttableUserPrepare,
} = require("../../../sql/INsertteble");
const {
  SELECTTABLEHRuser,
  SELECTTableusersCompanyonObject,
  SelectTableUserPrepareObject,
} = require("../../../sql/selected/selectuser");
const {
  UPDATETableprepareOvertimeassignment,
  UPDATETablecheckPreparation,
} = require("../../../sql/update");

const opreationPreparation = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      // Assuming you have a function to insert HR data into the database
      const {
        PhoneNumber,
        Overtimeassignment,
        DateDay,
        DateDayfalse,
        type,
        Checktime,
        CheckFile,
      } = req.body; // Get HR data from request body
      // Insert the HR data into the database (this is a placeholder, replace with actual DB logic)
      if (String(type).includes("Check")) {
        // Handle CheckPreparation type
        const user = await SELECTTableusersCompanyonObject(PhoneNumber, "id");
        await CheckPreparation(
          userSession?.IDCompany,
          user.id,
          DateDay,
          Checktime,
          CheckFile,
          type
        );
      } else if (type === "Overtimeassignment") {
        // Handle Overtimeassignment type
        for (let i = 0; i < DateDay.length; i++) {
          await Overtimeassignmentopreation(
            userSession?.IDCompany,
            PhoneNumber,
            Overtimeassignment,
            DateDay[i]
          );
        }
        if (DateDayfalse && DateDayfalse.length > 0) {
          for (let i = 0; i < DateDayfalse.length; i++) {
            await Overtimeassignmentopreation(
              userSession?.IDCompany,
              PhoneNumber,
              "false",
              DateDayfalse[i]
            );
          }
        }
      } else {
        return res.status(400).send({ error: "Invalid type provided" });
      }

      res.status(200).send({ success: "تمت العملية بنجاح" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "فشل تنفيذ العملية" });
    }
  };
};

const Overtimeassignmentopreation = async (
  IDCompany,
  idUser,
  Overtimeassignment,
  DateDay
) => {
  try {
    const resultuser = await SELECTTABLEHRuser(IDCompany, idUser, DateDay);
    if (
      !resultuser ||
      typeof resultuser !== "object" ||
      !resultuser?.id
    ) {
      await inserttableAvailabilityday([
        IDCompany,
        idUser,
        Overtimeassignment,
        DateDay,
      ]); // Replace with actual DB logic
    } else {
      await UPDATETableprepareOvertimeassignment(
        Overtimeassignment,
        resultuser.id,
        DateDay
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("فشل في تحديث أو إدخال بيانات التوافر");
  }
};

const CheckPreparation = async (
  IDCompany,
  idUser,
  DateDay,
  Checktime,
  CheckFile,
  type
) => {
  try {
    const resultuser = await SELECTTABLEHRuser(IDCompany, idUser, DateDay);

    const check = type === "CheckIn" ? "CheckIntime" : "CheckOUTtime";
    const checkfile = type === "CheckIn" ? "CheckInFile" : "CheckoutFile";
    if (
      !resultuser ||
      typeof resultuser !== "object" ||
      !resultuser?.id
    ) {
      await insertTablecheckPreparation(
        [IDCompany, idUser, Checktime, JSON.stringify(CheckFile)],
        check,
        checkfile
      ); // Replace with actual DB logic
    } else {
      let Numberofworkinghours = "";
      if (type === "CheckOut" && resultuser.CheckIntime) {
        const hoursBetween = calculateHoursBetween(
          resultuser.CheckIntime,
          Checktime
        );
        // console.log(`Hours between: ${hoursBetween.toFixed(2)}`); // Output: 9.50
        if (hoursBetween < 0) {
          throw new Error("الوقت غير صالح");
        }
        Numberofworkinghours = `,Numberofworkinghours=${hoursBetween.toFixed(
          2
        )}`;

        if (
          resultuser.Overtimeassignment === "true" &&
          hoursBetween.toFixed(2) > 8
        ) {
          Numberofworkinghours = `,Numberofworkinghours=${hoursBetween.toFixed(
            2
          )},Numberofovertimehours=${hoursBetween.toFixed(2) - 8}`;
        }
      }
      // const checkfileStr = JSON.stringify(CheckFile).replace(/'/g, "''"); // Escape single quotes
      await UPDATETablecheckPreparation(
        Checktime,
        JSON.stringify(CheckFile),
        resultuser.id,
        check,
        checkfile,
        Numberofworkinghours
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("فشل في تحديث أو إدخال بيانات التحقق من الإعداد");
  }
};



const addOrcansleUserfromuserPrepare =  () =>{
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const  idArray  = req.body.idArray; // Get parameters from request body
      if (idArray?.length <= 0 ) {
        return res.status(400).send({ error: "Missing required parameters" });
      }
      // Perform the action based on the provided action type
        // Logic to add user to userPrepare
        for (let i = 0; i < idArray.length; i++) {
          const element = idArray[i];
          if(element.action === "cancel") {
          await DeleteUserPrepare([element.id]);  

          }else{
            const user = await SelectTableUserPrepareObject(userSession.IDCompany,element.id);
            if (user) 
              return;
            
            await inserttableUserPrepare([element.id, userSession.IDCompany])
          };

        }
        res.status(200).send({ success: "User added successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Failed to process request" });
    }
  };
}

module.exports = { opreationPreparation,addOrcansleUserfromuserPrepare };
