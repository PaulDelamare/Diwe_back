const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname : {
        type: String,
        default : ""
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    birthday:{
        type: Date,
        required : true
    },
    phone:{
        type: String,
        default : ""
    },
    secret_pin:{
        type: Number,
        required: true
    },
    last_connection:{
        type: Date,
        default : null
    },
    created_at:{
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default : null
    }
});

const User = mongoose.model('User', UserSchema, 'user');

User.create = async (newUser, resulte) => {
    //Get body information
    const {email,password, firstname, lastname, role, birthday, phone, secret_pin} = newUser;

    //Create user object
    const user = new User({
        firstname,
        lastname,
        email,
        password,
        role,
        birthday,
        phone,
        secret_pin,
        created_at : new Date()
    });

    //Push in data base
    return user.save();
}

module.exports = User;