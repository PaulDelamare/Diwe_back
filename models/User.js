//////////
//REQUIRE
const mongoose = require('mongoose');
//Import uuid for create token 
const { v4: uuidv4 } = require('uuid');
//////////
//////////

//////////
//SCHEMA
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
        enum: ['user', 'blog', 'health'],
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
    profile_picture:{
        type: String,
        default : ''
    },
    created_at:{
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default : null
    },
    active:{
        type: Boolean,
        default: false
    },
    request_deletion:{
        type: Date,
        default : null
    },
    doctors_link:{
        type: Array,
        default: []
    },
    token: {
        type: String,
        default: uuidv4()
    }
});

//////////
//////////

//////////
//MODEL

const User = mongoose.model('User', UserSchema, 'user');

//////////
//////////

//////////
//FUNCTIONS

/**
+ * Create a new user with the given information.
+ *
+ * @param {Object} newUser - the new user information
+ * @param {Function} resulte - the callback function
+ * @return {Promise} a promise that resolves to the saved user object
+ */
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
        created_at : new Date(),
        active : false
    });

    //Push in data base
    return user.save();
}

//////////
//////////

//////////
//EXPORT
module.exports = User;
//////////