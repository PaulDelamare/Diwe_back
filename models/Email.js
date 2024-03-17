//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA

const EmailSchema = new mongoose.Schema({
    sender:{
        type: String,
        required: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type : String,
        required: true
    },
    attachment: {
        type: [String],
        default: []
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

EmailSchema.index({ sender: 1, createdAt: -1 });

//////////
//////////

//////////
//MODEL

const Email = mongoose.model('Email', EmailSchema, 'email');

//////////
//////////

//////////
//EXPORT
module.exports = Email;
//////////