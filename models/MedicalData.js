//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA

const MedicalSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date:{
        type : Date,
        default: Date.now
    },
    pulse:{
        type: Number,
        required: true
    },
});

//////////
//////////

//////////
//MODEL

const MedicalData = mongoose.model('MedicalData', MedicalSchema, 'medicalData');

//////////
//////////

//////////
//EXPORT
module.exports = MedicalData;
//////////