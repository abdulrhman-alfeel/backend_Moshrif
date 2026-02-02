const express = require('express')

const {
  Loginuser,
  LoginVerification, 
  BringAllLoginActvity, 
  CheckUserispresentornot, 
  LoginVerificationv2, 
  loginOut, 
  Login_Verification_visit} = require('../src/modules/companies/select/userCompanyselect');
  
const { verifyJWT } = require("../middleware/jwt");


const Login = ({ uploadQueue }) => {
  // This function is not used in this file, but it might be used in other files.
  // It is a placeholder for future use or for other modules that might require it.
  const router = express.Router();
  // router.use(verifyJWT);
  
  router.route('/').get(Loginuser(uploadQueue));
  router.route('/Login_Verification_visit').get(Login_Verification_visit(uploadQueue));

  router.route('/verification').get(LoginVerification(uploadQueue));
  router.route('/v2/verification').get(LoginVerificationv2(uploadQueue));
  router.route('/BringAllLoginActvity').get(verifyJWT,BringAllLoginActvity(uploadQueue));
  router.route('/Checkfinduser').get(verifyJWT,CheckUserispresentornot(uploadQueue));
  router.route('/loginOut').get(verifyJWT,loginOut(uploadQueue));

  return router;
}

module.exports = Login