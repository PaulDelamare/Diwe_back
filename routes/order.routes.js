//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
// Import order Controller
const OrderController = require('../controller/order.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//////////
//////////

//////////
//API ROUTES

//Create order
router.post('/order', checkConnection(['user']), OrderController.create);
//Get all order
router.get('/order', checkConnection(['user']), OrderController.getAllOrders);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////