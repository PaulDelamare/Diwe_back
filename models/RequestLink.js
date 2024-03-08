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
//FUNCTIONS

/**
+ * Create a new RequestLink and save it in the database.
+ *
+ * @param {Object} newRequestLink - The new RequestLink object containing image_path and text
+ * @param {Object} resulte - The resulte object
+ * @return {Promise} A promise that resolves to the saved daily_RequestLink object
+ */
RequestLink.create = async (newRequestLink, resulte) => {
    //Get body information
    const {id_user, id_doctor} = newRequestLink;

    //Create RequestLink object
    const new_requestLink = new RequestLink({
        id_user,
        id_doctor,
    });

    //Push in data base
    return new_requestLink.save();
}

//////////
//////////

//////////
//EXPORT
module.exports = RequestLink;
//////////