//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA

const OrderSchema = new mongoose.Schema({
    id_product:{
        type: String,
        required: true,
    },
    id_user: {
        type: String,
    },
    product_name: {
        type: String,
        required: true,
    },
    email_doctor: {
        type: String,
        required: true,
    },
    status: {
        type : String,
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

//////////
//////////

//////////
//MODEL

const Order = mongoose.model('Order', OrderSchema, 'orders');

//////////
//////////

//////////
//EXPORT
module.exports = Order;
//////////