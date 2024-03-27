//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA
const RequestLinkSchema = new mongoose.Schema({
    id_user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
    },
    id_doctor: {
        type :  mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'doctor'
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'refuse'],
        default: "pending"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    reponse_date:{
        type: Date,
        default: null
    }
});

//////////
//////////

//////////
//MODEL

const RequestLink = mongoose.model('RequestLink', RequestLinkSchema, 'request_link');

//////////
//////////

//////////
//EXPORT
module.exports = RequestLink;
//////////