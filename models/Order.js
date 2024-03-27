//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA

const OrderSchema = new mongoose.Schema({
    id_product:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' 
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product_name: {
        type: String,
        required: true,
    },
    id_doctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor'
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