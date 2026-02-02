const express = require("express");
const {
  Commentinsert,
  Likesinsert,
} = require("../src/modules/posts/insertPost");
const {
  CommentUpdate,
  CommentDelete,
} = require("../src/modules/posts/updatPost");
const {
  BringPost,
  BringCommentinsert,
  SearchPosts,
  BringObjectOnefromPost,
  BringDatabrachCompany,
} = require("../src/modules/posts/post");
const { verifyJWT } = require("../middleware/jwt");
const postpublic = ({ uploadQueue }) => {
  // This function is not used in this file, but it might be used in other files.
  // It is a placeholder for future use or for other modules that might require it.
  const router = express.Router();
  router.use(verifyJWT);
  
  router.route("/Commentinsert").post(Commentinsert(uploadQueue));
  router.route("/CommentUpdate").put(CommentUpdate(uploadQueue));
  router.route("/CommentDelete").delete(CommentDelete(uploadQueue));
  
  router.route("/Likesinsert").get(Likesinsert(uploadQueue));
  router.route("/BringPost").get(BringPost(uploadQueue));
  router.route("/BringObjectOnefromPost").get(BringObjectOnefromPost(uploadQueue));
  router.route("/BringCommentinsert").get(BringCommentinsert(uploadQueue));
  router.route("/SearchPosts").get(SearchPosts(uploadQueue));
  router.route("/BringDatabrachCompany").get(BringDatabrachCompany(uploadQueue));
  return router;
}

module.exports = postpublic;
