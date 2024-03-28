//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA
const PopupSchema = new mongoose.Schema({
    image_path: {
        type: String,
        required: true,
    },
    text: {
        type : String,
        required: true
    }
});

//////////
//////////

//////////
//MODEL

const Popup = mongoose.model('Popup', PopupSchema, 'daily_popup');

//////////
//////////

//////////
//EXPORT
module.exports = Popup;
//////////