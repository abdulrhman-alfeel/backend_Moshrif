const axios = require('axios');
require("dotenv").config();

const url = 'https://secure.clickpay.com.sa/payment/request';
const data = {
  profile_id:48263, // Replace with your actual profile ID
  tran_type: 'sale',
  tran_class: 'ecom',
  cart_id: '4244b9fd-c7e9-4f16-8d3c-4fe7bf6c48ca',
  cart_description: 'Dummy Order 35925502061445345',
  cart_currency: 'SAR',
  cart_amount: 46.17,
  callback: `${process.env.BASE_URL}/payments/clickpay/ipn`,
  return: 'https://yourdomain.com/yourpage'
};

const headers = {
  'Authorization': 'S6JNMN6KZD-JM696MTZZ6-M9JZGBNRBD', // Replace with your actual profile server key
  'Content-Type': 'application/json'
};

axios.post(url, data, { headers })
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
