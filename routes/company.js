const express = require("express");
const {
  insertDataCompany,
  inseertCompanybrinsh,
  InsertLinkevaluation,
  OpenOrCloseopreationStopfinance,
  insertRequestFinancialCustody,
} = require("../src/modules/companies/insert/insertCompany");
const {
  biringDatabrinshCompany,
  bringDataCompany,
  BringDataFinancialCustody,
  bringDataCompanyRegistration,
  BringNameCompany,
  BringreportFinancialCustody,
} = require("../src/modules/companies/select/bringCompany");
const {
  UpdateCompanybrinsh,
  UpdateDataCompany,
  Acceptandrejectrequests,
  Updatecovenantrequests,
  Deletecovenantrequests,
  UpdateApiCompany,
  AgreedRegistrationCompany,
  UpdatedataRegistration,
  DeleteCompanyRegistration,
  Branchdeletionprocedures,
  Implementedbyopreation,
} = require("../src/modules/companies/insert/UpdateCompany");

const { verifyJWT } = require("../middleware/jwt");

const company = ({ uploadQueue }) => {
  const router = express.Router();
  // router.use(verifyJWT);

  router.route("/").post(insertDataCompany(uploadQueue));
  router
    .route("/AgreedRegistrationCompany")
    .get(verifyJWT,AgreedRegistrationCompany(uploadQueue));
  router
    .route("/UpdatedataRegistration")
    .put(verifyJWT,UpdatedataRegistration(uploadQueue));
  router
    .route("/bringCompanyRegitration")
    .get(verifyJWT,bringDataCompanyRegistration(uploadQueue));
  router
    .route("/DeleteCompanyRegistration")
    .delete(verifyJWT,DeleteCompanyRegistration(uploadQueue));

  router.route("/").get(verifyJWT,bringDataCompany(uploadQueue));
  router
    .route("/OpenOrCloseopreationStopfinance")
    .get(verifyJWT,OpenOrCloseopreationStopfinance(uploadQueue));
  router.route("/").put(verifyJWT,UpdateDataCompany(uploadQueue));

  router.route("/brinshName").get(verifyJWT,BringNameCompany(uploadQueue));
  router.route("/UpdateApiCompany").get(verifyJWT,UpdateApiCompany(uploadQueue));

  router.route("/brinsh").post(verifyJWT,inseertCompanybrinsh(uploadQueue));
  router.route("/brinsh/bring").get(verifyJWT,biringDatabrinshCompany(uploadQueue));
  router.route("/brinsh/Update").put(verifyJWT,UpdateCompanybrinsh(uploadQueue));
  router
    .route("/brinsh/InsertLinkevaluation")
    .post(verifyJWT,InsertLinkevaluation(uploadQueue));

  // عمليات العهد
  router
    .route("/brinsh/insertRequestFinancialCustody")
    .post(verifyJWT,insertRequestFinancialCustody(uploadQueue));
  router
    .route("/brinsh/BringDataFinancialCustody")
    .get(verifyJWT,BringDataFinancialCustody(uploadQueue));
  router
    .route("/BringreportFinancialCustody")
    .get(verifyJWT,BringreportFinancialCustody(uploadQueue));
  router
    .route("/brinsh/Acceptandrejectrequests")
    .put(verifyJWT,Acceptandrejectrequests(uploadQueue));
  router
    .route("/brinsh/Deletecovenantrequests")
    .get(verifyJWT,Deletecovenantrequests(uploadQueue));
  router
    .route("/brinsh/Updatecovenantrequests")
    .put(verifyJWT,Updatecovenantrequests(uploadQueue));

  // حذف فرع
  router
    .route("/brinsh/deleteBranch")
    .get(verifyJWT,Branchdeletionprocedures(uploadQueue));
  router
    .route("/brinsh/Implementedbyopreation")
    .delete(verifyJWT,Implementedbyopreation(uploadQueue));
  return router;
};

module.exports = company;
