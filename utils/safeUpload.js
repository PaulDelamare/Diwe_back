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
exports.cryptDocument = async (buffer, secretKey, user, pathApi, pathAfter) => {
    // Initalize vector
    const iv = crypto.randomBytes(16);

    // Creates a Cipher object using the AES-256-CBC algorithm, secret key, and vector initialization
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    // Encrypts the document buffer
    let encryptedBuffer = cipher.update(buffer);
    encryptedBuffer = Buffer.concat([encryptedBuffer, cipher.final()]);

    // Combines vector initialization and encrypted buffer
    const encryptedDocument = Buffer.concat([iv, encryptedBuffer]);

    // Create date for pass get time for have only one file with the same name
    const date = new Date();

    // Creates a path to save the encrypted document to disk
    const encryptedFilePath = path.join(__dirname, '..', pathApi, `${date.getTime()}${user._id}${pathAfter}`);

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
exports.decryptFunction = async (encryptedFilePath, secretKey) => {
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

/**
+ * Decrypts a file using a secret key and returns the decrypted buffer.
+ *
+ * @param {string} pathApi - The path of the API.
+ * @param {string} cryptPath - The path of the crypt file.
+ * @return {Promise<Buffer>} The decrypted buffer.
+ */
exports.decryptFile = async (pathApi, cryptPath) => {

    // Transform the secret key in a buffer
    const secretKey = Buffer.from(process.env.FILE_SECRET, 'hex');

    // Get the path of the crypt file
    const prescriptionPath = path.join(__dirname, '..', pathApi, path.basename(cryptPath));

    // Decrypt the file
    const decryptedBuffer = await this.decryptFunction(prescriptionPath, secretKey);

    // return file
    return decryptedBuffer
}