const express = require('express');
const { verifyJWT } = require('../middleware/jwt');
const { 
bringInvoicedetails, 
insert_subscription_types, 
insert_Subscripation_New, 
Bring_Subscription_typs, 
convert_project_subscription_to_company_subscription,
Bring_company_subscription,
update_company_subscription_status, 
opreation_update_subscription, 
Delete_subscription_types} = require('../src/modules/subscriptions/opreationSubscripation');


// insert_subscription_types

// "http://192.168.1.81:8080/api/subScription/Delete_subscription_types?id=1"
// "http://192.168.1.81:8080/api/subScription/opreation_update_subscription"
// {
//     id:1
//     "name":"ثلاثة اشهر", 
//     "duration_in_months":3, 
//     "price_per_project":115,
//     "discraption":""
// }

// "http://192.168.1.81:8080/api/subScription/Bring_Subscription_typs"

const subScription = ({ uploadQueue }) => {
  const router = express.Router();
  
  router.use(verifyJWT);
  router.get('/',bringInvoicedetails(uploadQueue));
  router.post('/insert_subscription_types',insert_subscription_types(uploadQueue));
  router.post('/insert_Subscripation_New',insert_Subscripation_New(uploadQueue));
  router.get('/Bring_Subscription_typs',Bring_Subscription_typs(uploadQueue));
  router.get('/Bring_company_subscription',Bring_company_subscription(uploadQueue));
  router.put('/convert_project_subscription_to_company_subscription',convert_project_subscription_to_company_subscription(uploadQueue));
  router.put('/update_company_subscription_status',update_company_subscription_status(uploadQueue));
  router.put('/opreation_update_subscription',opreation_update_subscription(uploadQueue));
  router.delete('/Delete_subscription_types',Delete_subscription_types(uploadQueue));

  return router;
}


module.exports = subScription;



