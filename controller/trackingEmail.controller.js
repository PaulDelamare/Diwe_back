//////////
//REQUIRE
const Email = require('../models/Email');
const sendTransparentImage = require('../utils/sendTransparentImage');
//////////
//////////

/**
+ * Async function to knwo if email is read
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise} A promise that resolves to a response
+ */
exports.readEmail = async (req, res) => {

    // Get id email from params
    const id_email = req.params.id_email;

    // Check if email exist
    const email = await Email.findById(id_email);
    if(!email) {
        // If email doesn't exist send transparent image
        return sendTransparentImage(res, 404);
    }
    // If email exist pass read to true
    try {

        // Update email
        await Email.findByIdAndUpdate(id_email, { read: true }, { new: true });

        // Send transparent image
        return sendTransparentImage(res, 200);
        
    }catch(error) {
        // If error send transparent image
        return sendTransparentImage(res, 200);
    }
}

//////////
//////////