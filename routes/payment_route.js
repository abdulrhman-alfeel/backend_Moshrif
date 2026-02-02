const express = require('express');
const { verifyJWT } = require('../middleware/jwt');
const { Creat_payment, clickpay_ipn, clickpay_validate, clickpay_return } = require('../src/modules/subscriptions/payment');




const payment_route = ({ uploadQueue }) => {

    const router = express.Router();
    // router.use(verifyJWT);
    router.post('/clickpay/create',verifyJWT,Creat_payment(uploadQueue));
    router.post('/clickpay/ipn',clickpay_ipn(uploadQueue));
    router.post('/clickpay/validate',clickpay_validate(uploadQueue));
    router.use('/clickpay/return',clickpay_return(uploadQueue));
    
    return router


};


module.exports = payment_route;