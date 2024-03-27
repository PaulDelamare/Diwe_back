//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA
const VerificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

//////////
//////////

//////////
//MODEL

const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema, 'verification_code');

//////////
//////////

//////////
//EXPORT
module.exports = VerificationCode;
//////////