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
//FUNCTIONS

Popup.create = async (newPopup, resulte) => {
    //Get body information
    const {image_path, text} = newPopup;

    //Create popup object
    const daily_popup = new Popup({
        image_path,
        text,
    });

    //Push in data base
    return daily_popup.save();
}

//////////
//////////

//////////
//EXPORT
module.exports = Popup;
//////////