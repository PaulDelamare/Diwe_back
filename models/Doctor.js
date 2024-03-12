//////////
//REQUIRE
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        required: true
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
//FUNCTIONS

/**
 * Creates a new Doctor in the database.
 *
 * @param {Object} newDoctor - The new doctor information
 * @param {Function} resulte - The callback function
 * @return {Promise} A Promise that resolves to the saved Doctor object
 */
Doctor.create = async (newDoctor, resulte) => {
    //Get body information
    const {email, firstname, lastname, binding_code, id_user, phone} = newDoctor;

    //Create Doctor object
    const doctor = new Doctor({
        firstname,
        lastname,
        email,
        phone,
        binding_code,
        id_user,
        created_at : new Date()
    });

    //Push in data base
    return doctor.save();
}

//////////
//////////

//////////
//EXPORT
module.exports = Doctor;

//////////
//////////