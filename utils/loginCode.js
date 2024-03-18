//////////
//REQUIRE
const VerificationCode = require("../models/VerificationCode");
//Speakeasy for generate secret code
const speakeasy = require('speakeasy');
//Import bcypt for hash password
const bcrypt = require('bcryptjs');
//////////
//////////

//////////
//FUNCTION
//Generate code
const generateCode = async (user) => {
    // If there is already one code, remove it
    await VerificationCode.findOneAndDelete({ email: user.email });

    //generate secret for the code
    const secret = speakeasy.generateSecret({ length: 20 });
    // Generate code
    const verificationCode = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
    });

    // Hash the verification code
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

    // Add expiration time in the next 10 minutes
    const codeExpiration = new Date();
    codeExpiration.setMinutes(codeExpiration.getMinutes() + 10);

    // Create code in data base
    await VerificationCode.create({
        email: user.email,
        code: hashedVerificationCode,
        expiresAt: codeExpiration,
    });

    // Stock variable to pass in email
    const emailData = {
        firstname: user.firstname,
        email: user.email,
        code: verificationCode
    }
    return { emailData };
}
//////////
//////////

//////////
//EXPORT
module.exports = generateCode;
//////////
//////////
