//////////
//REQUIRE
//Require nodemailer for email
const nodemailer = require('nodemailer');
//Require email compil html
const handlebars = require('handlebars');
//Require fs (file system)
const fs = require('fs');
const emailConfig = require('../config/email-config');
const Email = require('../models/Email');
//Require .env for email sender
require('dotenv').config();
//////////
//////////

/**
+ * Sends an email with the specified content and attachments.
+ *
+ * @param {string} to - The email address to send the email to
+ * @param {string} subject - The subject line of the email
+ * @param {string} templateName - The name of the email template to use
+ * @param {object} data - The data to insert into the email template
+ * @param {array} attachments - (Optional) An array of file attachments
+ * @return {Promise} A Promise that resolves after the email is sent
+ */
async function sendEmail(to, sender, subject, templateName, data, attachments = []) {

    // Create a transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Compile the footer and header email
    const headerSource = fs.readFileSync('./email/layout/header.hbs', 'utf8');
    const footerSource = fs.readFileSync('./email/layout/footer.hbs', 'utf8');
    const headerTemplate = handlebars.compile(headerSource);
    const footerTemplate = handlebars.compile(footerSource);

    // Compile the template email
    const templateSource = fs.readFileSync(`./email/templates/${templateName}.hbs`, 'utf8');
    const template = handlebars.compile(templateSource);

    //Defined body for data base
    const body = data.body ?? 'Automatic email';
    //Split recipients 
    const recipients = to.split(',').map(email => email.trim());

    // Stock attchments path in variable 
    const attachmentsPath = attachments.map(attachment => attachment.path);

    // For each recipient send an email
    for (const recipient of recipients) {

        // Save email in data base
        const email = await Email.create({subject, sender, recipient, body, attachment: attachmentsPath });

        // Check is successfully created
        if (!email) {
            throw new Error('Email not created');
        }

        // Receive id email for tracking pixel 
        data.trackingPixel  = `http://localhost:3000/api/read.gif${email._id}`;

        // Parameters to pass to the template
        // Header and footer are necessary for the style 
        const html = template({
            header: headerTemplate(),
            footer: footerTemplate(),
            ...data
        });

        //Mail option for send
        const mailOptions = {
            from: sender,
            to : recipient,
            subject,
            html,
            attachments
        };

        // Send Email
        await transporter.sendMail(mailOptions);
    }  
}

module.exports = sendEmail;