const express = require("express");
const {
  ClassChackTableChat,
  ClassViewChat,
  ClassreceiveMessageViews,
  PostFilemassage,
  Chackarrivedmassage,
  initializeUpload,
  insertdatafile,
  generateResumableUrl,
  filterTableChat,
} = require("../src/modules/chat/ChatJobsClass");
const { verifyJWT } = require("../middleware/jwt");
const { BringDataprojectAndStages } = require("../src/modules/chat/ChatJobs");
const { uploads } = require("../middleware/uploads");



const chatroute = ({ uploadQueue }) => {
  // This function is not used in this file, but it might be used in other files.
  // It is a placeholder for future use or for other modules that might require it.
  const router = express.Router();
  router.use(verifyJWT);
  router.route("/").get(ClassChackTableChat(uploadQueue));
  router.route("/v2/file").post(uploads.single("filechate"), PostFilemassage(uploadQueue));
  router.route("/ChateView").get(ClassViewChat(uploadQueue));
  router.route("/filterTableChat").get(filterTableChat(uploadQueue));
  router.route("/Viewed").post(ClassreceiveMessageViews(uploadQueue));
  router.route("/BringDataprojectAndStages").get(BringDataprojectAndStages(uploadQueue));
  router.route("/Chackarrivedmassage").get(Chackarrivedmassage(uploadQueue));
  router.route("/initializeUpload").get(initializeUpload(uploadQueue));
  router.route("/insertdatafile").post(insertdatafile(uploadQueue));
  router.route("/generate-resumable-url").post(generateResumableUrl(uploadQueue));
  return router;
};

module.exports = chatroute;
