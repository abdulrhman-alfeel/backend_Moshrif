const { DeleteTablecompanySubProjectall } = require("../../../sql/delete");



const DeletStageHome = (uploadQueue) =>{
    return async (req, res) => {
        try {
            const { StageID } = req.query;
            if (!StageID) {
                return res.status(400).send({ error: "StageID is required" });
            }
            // Logic to delete the stage home template by StageIDtemplet
            // This is a placeholder; replace with actual database query
            await DeleteTablecompanySubProjectall('StagesTemplet',"StageID",StageID);
            await DeleteTablecompanySubProjectall('StagesSubTemplet',"StageID",StageID);
            res.send({ success: "تم حذف القالب بنجاح" }).status(200);
        } catch (error) {
            console.error("Error deleting stage home template:", error);
            res.status(500).send({ error: "حدث خطأ أثناء حذف القالب" });
        }
    }
}

const DeletStageSub = (uploadQueue) => {
    return async (req, res) => {
        try {
            const { StageSubID } = req.query;
            if (!StageSubID) {
                return res.status(400).send({ error: "StageSubID is required" });
            }
            // Logic to delete the stage sub template by StageSubID
            // This is a placeholder; replace with actual database query
            await DeleteTablecompanySubProjectall('StagesSubTemplet',"StageSubID",StageSubID);
            res.send({ success: "تم حذف القالب الفرعي بنجاح" }).status(200);
        } catch (error) {
            console.error("Error deleting stage sub template:", error);
            res.status(500).send({ error: "حدث خطأ أثناء حذف القالب الفرعي" });
        }
    }   
}

module.exports = {
    DeletStageHome,
    DeletStageSub
};