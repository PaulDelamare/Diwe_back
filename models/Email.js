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
    recipients: {
        type: [String],
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

const Email = mongoose.model('Email', EmailSchema, 'mail');

//////////
//////////

//////////
//FUNCTIONS

/**
+ * Create a new email and save it in the database.
+ *
+ * @param {Object} newEmail - The new Email object containing image_path and text
+ * @param {Object} resulte - The resulte object
+ * @return {Promise} A promise that resolves to the saved daily_Email object
+ */
Email.create = async (newEmail, resulte) => {
    //Get body information
    const {subject, sender, recipients, body, attachment} = newEmail;

    //Create Email object
    const email = new Email({
        subject,
        sender,
        recipients,
        body,
        attachment
    });

    //Push in data base
    return email.save();
}

//////////
//////////

//////////
//EXPORT
module.exports = Email;
//////////