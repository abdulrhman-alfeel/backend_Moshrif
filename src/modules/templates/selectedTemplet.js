const {
  SELECTFROMTableStageTempletall,
  SELECTFROMTableSubStageTempletall,
  selectStagestypeTemplet,
  selectStagestypeforProject,
} = require("../../../sql/selected/selected");

const BringStageHomeTemplet = (uploadQueue) => {
  return async (req, res) => {
    try {
      const {Type, StageIDtemplet = 0 } = req.query;
      if (
        typeof StageIDtemplet === "undefined" ||
        StageIDtemplet === null ||
        StageIDtemplet === ""
      ) {
        return res.status(400).send({ error: "StageIDtemplet is required" });
      }

      // Logic to fetch the stage home template by StageIDtemplet
      // This is a placeholder; replace with actual database query
      const stageHomeTemplate = await SELECTFROMTableStageTempletall(
        Type,
        StageIDtemplet
      );
      res
        .send({ success: "تمت العملية بنجاح", data: stageHomeTemplate })
        .status(200);
    } catch (error) {
      console.error("Error fetching stage home template:", error);
      res
        .status(500)
        .send({ error: "An error occurred while fetching the template" });
    }
  };
};

const BringStageSubTemplet = (uploadQueue) => {
  return async (req, res) => {
    try {
      const { StageID, Stagestype_id, StageSubID } = req.query;
      if (
        typeof StageSubID === "undefined" ||
        StageSubID === null ||
        StageSubID === ""
      ) {
        return res.status(400).send({ error: "StageSubID is required" });
      }
      // Logic to fetch the stage sub template by StageSubID
      // This is a placeholder; replace with actual database query
      const stageSubTemplate = await SELECTFROMTableSubStageTempletall(
        StageID,
        Stagestype_id,
        StageSubID
      );
      res
        .send({ success: "تمت العملية بنجاح", data: stageSubTemplate })
        .status(200);
    } catch (error) {
      console.error("Error fetching stage sub template:", error);
      res
        .status(500)
        .send({ error: "An error occurred while fetching the template" });
    }
  };
};
const BringxlsxsheetTemplet = () => {
  return async (req, res) => {
    try {
      res
        .send({
          success: true,
          data: {
            Image1:
              "https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Templet/excalsheet.png",
            Image2:
              "https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Templet/excalsheet2.png",

            file: "https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Templet/StagesTempletEXcel.xlsx",
          },
        })
        .status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};


const BringStagestypeforTemplet = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        return res.status(401).send("Invalid session");
      };

      const data = await selectStagestypeTemplet(userSession?.IDCompany);
      res.send({ success: true, data }).status(200);
    } catch (err) {
      console.log(err);
      res.send({ success: false }).status(400);
    }
  };
};

const BringStageSubTempletforProject = (uploadQueue) => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        return res.status(401).send("Invalid session");
      }
      const data = await selectStagestypeforProject(userSession?.IDCompany);
      res.send({ success: true, data }).status(200);

    } catch (error) {
      console.log(error);
      return res.send({ success: "حدث خطأ" }).status(400);
    }
  };
};

module.exports = {
  BringStageHomeTemplet,
  BringStageSubTemplet,
  BringxlsxsheetTemplet,
  BringStagestypeforTemplet,
  BringStageSubTempletforProject,
};
