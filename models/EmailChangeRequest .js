//////////
//REQUIRE
const mongoose = require('mongoose');
//Import uuid for create token 
const { v4: uuidv4 } = require('uuid');
//////////
//////////

//////////
//SCHEMA
const EmailChangeRequestSchema = new mongoose.Schema({
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    newEmail: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      default: uuidv4(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  });

//////////
//////////

//////////
//MODEL

const EmailChange = mongoose.model('EmailChange', EmailChangeRequestSchema, 'email_change_request');

//////////
//////////

//////////
//EXPORT
module.exports = EmailChange;
//////////