//////////
//REQUIRE
const Email = require('../models/Email');
const User = require('../models/User');
const { decryptFile, cryptDocument } = require('../utils/safeUpload');
const sendEmail = require('../utils/sendEmail');
const ValidateBody = require('../utils/validateBody');
//////////
//////////

//////////
//FUNCTION CONTROLLER

/**
+ * Sends an email with attachments to the specified email address.
+ *
+ * @param {Object} req - The request object containing the user information and email details.
+ * @param {Object} res - The response object used to send the email status.
+ * @return {Promise} A promise that resolves to the status of the email sending process.
+ */
exports.sendEmail = async (req, res) => {

    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'utilisateur non trouvé', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

     //Check if link code is correct
    validateBody.pdfValidator('files', false);
    if (user.role === "user") {
        validateBody.booleanFieldsValidator('prescription');
    }
    validateBody.emailValidator('email', true, false, true);
    validateBody.textValidator('subject', true, 3, 255, 'L\'objet', true);
    validateBody.textValidator('body', true, 20, 10000, 'Le contenu', true);
 
     //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);
 
    // Check if body is valid
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }
    try {

        // Transform the secret key in a buffer
        const secretKey = Buffer.from(process.env.FILE_SECRET, 'hex');

        // Pass the custom data to email template
        const emailData = { 
            body: req.body.body,
            emailService : process.env.EMAIL_SERVICE
        };
        // Attchment variable
        const attachments = [];

        // For each file in req.files
        for (const file of req.files) {
            // Crypt file before upload
            const fileCrypt = await cryptDocument(file.buffer, secretKey, user, 'uploads/attachments','_attachments.enc');
            // Push it in attachments
            attachments.push({
                filename: file.originalname,
                content: file.buffer,
                encoding: 'base64',
                encryptedPath: fileCrypt,
            });
        }

        // If prescription is true (user want to send his prescription)
        if ( req.body.prescription === 'true' && user.role === "user") {
            // Decrypt file
            const file = await decryptFile('uploads/prescriptions', user.prescription);
            // And send file decrypt in attchments
            attachments.push({
                filename: `ordonance-${user.firstname.toLowerCase()}.pdf`,
                content: file.toString('base64'),
                encoding: 'base64',
                encryptedPath: user.prescription,
            });
        }
        
        // Send email
        await sendEmail(req.body.email, user.email, req.body.subject, 'global/basic-email', emailData, attachments);
        // If email is send return succes message
        res.status(201).json({ message: 'E-mail envoyé avec succès', status : 201 });
    } catch (error) {
        // If an error occurs, send an error message
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail' });
    }
}

exports.getEmail = async (req, res) => {
    // Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);
    if (!user) {
        // If the user does not exist, return an error
        return res.status(404).json({ error: 'utilisateur non trouvé', status : 404 });
    }

    try {
        // Find email
        const emails = await Email.find({ sender: user.email });
       
        // If succes, return emails
        res.status(200).json({ emails: emails, status : 200 });
    } catch (error) {
        // If an error occurs, send an error message
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail', status : 500 });
    }
}

//////////
//////////