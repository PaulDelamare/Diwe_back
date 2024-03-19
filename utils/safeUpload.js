const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
+ * Encrypts a document buffer using AES-256-CBC encryption and saves the encrypted document to disk.
+ *
+ * @param {Buffer} buffer - The document buffer to encrypt
+ * @param {string} secretKey - The secret key for encryption
+ * @param {Object} user - The user object associated with the document
+ * @return {string} The path to the encrypted document saved on disk
+ */
exports.cryptDocument = async (buffer, secretKey, user) => {
    // Initalize vector
    const iv = crypto.randomBytes(16);

    // Creates a Cipher object using the AES-256-CBC algorithm, secret key, and vector initialization
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    // Encrypts the document buffer
    let encryptedBuffer = cipher.update(buffer);
    encryptedBuffer = Buffer.concat([encryptedBuffer, cipher.final()]);

    // Combines vector initialization and encrypted buffer
    const encryptedDocument = Buffer.concat([iv, encryptedBuffer]);

    // Creates a path to save the encrypted document to disk
    const encryptedFilePath = path.join(__dirname, '..', 'uploads', 'prescriptions', `${user._id}_prescription.enc`);

    // Saves the encrypted document to disk
    await fs.promises.writeFile(encryptedFilePath, encryptedDocument);

    // Returns the path to the encrypted document
    return encryptedFilePath;
}

/**
+ * Decrypts a document using the provided secret key.
+ *
+ * @param {string} encryptedFilePath - The path to the encrypted file.
+ * @param {string} secretKey - The secret key used for decryption.
+ * @return {Buffer} The decrypted document buffer.
+ */
exports.decryptDocument = async (encryptedFilePath, secretKey) => {
    // Reads the encrypted document from disk
    const encryptedDocument = await fs.promises.readFile(encryptedFilePath);
  
    // Splits the encrypted document into vector initialization and encrypted buffer
    const iv = encryptedDocument.slice(0, 16);
    const encryptedBuffer = encryptedDocument.slice(16);
  
    // Creates a Cipher object using the AES-256-CBC algorithm, secret key, and vector initialization
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
  
    // Decrypts the document buffer
    let decryptedBuffer = decipher.update(encryptedBuffer);
    decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);
  
    // Returns the decrypted document buffer
    return decryptedBuffer;
}