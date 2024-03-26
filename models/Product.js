//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    price: {
        type: String,
        required: true,
    },
    image_path: {
        type : String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

ProductSchema.index({ sender: 1, createdAt: -1 });

//////////
//////////

//////////
//MODEL

const Product = mongoose.model('Product', ProductSchema, 'products');

//////////
//////////

//////////
//EXPORT
module.exports = Product;
//////////