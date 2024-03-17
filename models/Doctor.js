//////////
//REQUIRE
const mongoose = require('mongoose');

//////////
//////////

//////////
//SCHEMA

const DoctoSchema = new mongoose.Schema({
    id_user:{
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    firstname: {
        type: String,
        required: true
    },
    lastname : {
        type: String,
        default: ""
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        default: ""
    },
    binding_code:{
        type: Number,
        required: true
    },
    created_at:{
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default: null
    },
    users_link:{
        type: Array,
        default: [],
    }
});

//////////
//////////

//////////
//MODEL

const Doctor = mongoose.model('Doctor', DoctoSchema, 'doctor');

//////////
//////////

//////////
//EXPORT
module.exports = Doctor;

//////////
//////////