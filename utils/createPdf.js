//////////
// Import
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const {cryptDocument, decryptFile} = require ('./safeUpload');
//////////
//////////

//////////
//Function

/**
+ * Create and upload a PDF document for a given order, product, and user.
+ *
+ * @param {Object} order - the order object
+ * @param {Object} product - the product object
+ * @param {Object} user - the user object
+ * @return {Promise<Object>} A promise that resolves with the decrypted file object
+ */
exports.createAndUploadPdf = async (order, product, user) => {

    // Add path for stock the pdf
    const pdfPath = path.join(__dirname, '..', 'uploads/pdfs', `Order_${order._id}.pdf`);

    // Create the pdf
    const doc = new PDFDocument();

    // Create a write stream to write the PDF file to disk
    const stream = fs.createWriteStream(pdfPath);

    // Pipe the PDF document to the write stream
    doc.pipe(stream);

    // Set the font size to 16 and write the text "Détails de la Commande" with an underline
    doc.fontSize(16).text('Détails de la Commande', { underline: true });
    // Set the font size to 12 and write the order ID
    doc.fontSize(12).text(`ID de Commande: ${order._id}`);
    // Write the order date and time
    doc.text(`Date et Heure: ${order.created_at.toLocaleString()}`);
    // Write the user ID
    doc.text(`Utilisateur ID: ${order.id_user}`);
    // Add some vertical space
    doc.moveDown();

    // Set the font size to 14 and write the text "Fournitures" with an underline
    doc.fontSize(14).text('Fournitures:', { underline: true });

    // Loop through the supply details and write the name and image link for each one
    doc.fontSize(12).text(`Nom: ${product.name}`);

    // Build full link for image
    const imagePath = path.join(__dirname, '..', product.image_path);
    // Read the image file
    const image = fs.readFileSync(imagePath);

    // Add image ot pdf
    doc.image(image, {
        width: 150,
        height: 150,
    });

    // Add some vertical space
    doc.moveDown();

    // End the PDF document
    doc.end();

    // Create a promise to wait for the PDF file to be written to disk
    return new Promise((resolve, reject) => {
        // Listen for the 'finish' event on the write stream
        stream.on('finish', async () => {
            try {
                // Read the PDF file
                const fileBuffer = fs.readFileSync(pdfPath);

                // Create the file object
                const file = {
                    originalname: `Order_${order._id}.pdf`,
                    buffer: fileBuffer,
                    mimetype: 'application/pdf',
                };

                // Transform the secret key in a buffer
                const secretKey = Buffer.from(process.env.FILE_SECRET, 'hex');
                // Encrypt the PDF file
                const encryptedFile = await cryptDocument(file.buffer, secretKey, user, 'uploads/orders', '_orders.enc');
                // Decrypt for send the PDF file
                const decrypt = await decryptFile('uploads/orders', encryptedFile);

                /// Update the file object with the decrypted buffer and encryptedPath
                file.buffer = decrypt;
                file.encryptedPath = encryptedFile;

                // Resolve with the decrypted file object
                resolve(file);
            } catch (error) {
                // If an error occurs, reject the promise
                reject(error);
            } finally {
                // Delete the PDF file
                fs.unlinkSync(pdfPath);
            }
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
}
//////////
//////////