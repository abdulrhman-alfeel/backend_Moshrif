const express = require("express");
const { verifyJWTapi } = require("../middleware/jwtApi");
const {
  ProjectOpreationsinsert,
  ProjectOpreationsUpdate,
  FinancialOperationsDatainsert,
  FinancialOperationsDataUpdate,
  FinancialOperationsFile,
  DeleteOperationsFinancial,
  DeleteFileinFinancialOperationse,
  BringDatafileFinancial,
  FinancialUpdateInvoiceNo,
  AddfilesinArchives,
} = require("../src/modules/api/Opreation");
const uploadsapis = require("../middleware/uploadsapis");
const apiMoshrif = ({ uploadQueue }) => {
  // This function is not used in this file, but it might be used in other files.
  // It is a placeholder for future use or for other modules that might require it.

const router = express.Router();

router.use(verifyJWTapi);

router.route("/ProjectOpreations").post(ProjectOpreationsinsert(uploadQueue));
router.route("/ProjectOpreations").put(ProjectOpreationsUpdate(uploadQueue));
router.route("/AddfilesinArchives").post(uploadsapis.single("image"),AddfilesinArchives(uploadQueue));
router.route("/FinancialOperatios").post(FinancialOperationsDatainsert(uploadQueue));
router.route("/FinancialOperatios").put(FinancialOperationsDataUpdate(uploadQueue));
router.route("/FinancialUpdateInvoiceNo").put(FinancialUpdateInvoiceNo(uploadQueue));
router.route("/DeleteOperationsFinancial").delete(DeleteOperationsFinancial(uploadQueue));
router.route("/DeleteFileinFinancial").delete(DeleteFileinFinancialOperationse(uploadQueue));
router.route("/BringDatafileFinancial").get(BringDatafileFinancial(uploadQueue));
router.route("/FinancialOperatiosFile").post(uploadsapis.any("image"),FinancialOperationsFile(uploadQueue));
return router;
}
module.exports = apiMoshrif;
