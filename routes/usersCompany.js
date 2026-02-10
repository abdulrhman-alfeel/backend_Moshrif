const express = require("express");
const { userCompany } = require("../src/modules/companies/insert/insertuserCompany");
const { BringUserCompany, BringvalidityuserinBransh, BringUserCompanyinv2, BringUserChatProject } = require("../src/modules/companies/select/userCompanyselect");
const { userCompanyUpdat, UpdatUserCompanyinBrinsh,DeletUser,UpdateToken, InsertmultipleProjecsinvalidity, UpdatUserCompanyinBrinshV2, userCompanyUpdatdashbord } = require("../src/modules/companies/insert/UpdatuserCompany");
const { verifyJWT } = require("../middleware/jwt");
const { BringDataNotifcation,FilterNotifcation, FilterNotifcationv2, BringDataNotifcationv2 } = require("../src/modules/notifications/InsertNotifcation");

const usersCompany = ({ uploadQueue }) => {
const router = express.Router();

router.use(verifyJWT)

router.route('/')
.post(userCompany(uploadQueue))
router.route('/updat')
.put(userCompanyUpdat(uploadQueue))
router.route('/v2/updat')
.put(userCompanyUpdatdashbord(uploadQueue))
router.route('/updat/userBrinsh')
.put(UpdatUserCompanyinBrinsh(uploadQueue))
router.route('/updat/userBrinshv2')
.put(UpdatUserCompanyinBrinshV2(uploadQueue))
router.route('/DeletUser')
.put(DeletUser(uploadQueue))
router.route('/UpdateToken')
.put(UpdateToken(uploadQueue))


router.route('/InsertmultipleProjecsinvalidity')
.put(InsertmultipleProjecsinvalidity(uploadQueue))
router.route('/BringvalidityuserinBransh')
.get(BringvalidityuserinBransh(uploadQueue))

router.route('/BringUserCompanyinv2')
.get(BringUserCompanyinv2(uploadQueue))

router.route('/BringUserChatProject')
.get(BringUserChatProject(uploadQueue))


router.route('/BringUserCompany')
.get(BringUserCompany(uploadQueue))

router.route('/BringDataNotifcation')
.get(BringDataNotifcation(uploadQueue))
router.route('/FilterNotifcation')
.get(FilterNotifcation(uploadQueue))
router.route('/BringDataNotifcationv2')
.get(BringDataNotifcationv2(uploadQueue))
router.route('/FilterNotifcationv2')
.get(FilterNotifcationv2(uploadQueue))
return router;
}
module.exports = usersCompany