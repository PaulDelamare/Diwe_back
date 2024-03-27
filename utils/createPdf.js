//////////
// Import
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const {cryptDocument} = require ('./safeUpload');
//////////
//////////

//////////
//Function
exports.createAndUploadPdf = async (order, supplieDetails) => {

    // Add path for stock the pdf
    const pdfPath = path.join(__dirname, '..', 'pdfs', `Order_${order._id}.pdf`);

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
    doc.text(`Date et Heure: ${order.dateTime.toLocaleString()}`);
    // Write the user ID
    doc.text(`Utilisateur ID: ${order.user}`);
    // Add some vertical space
    doc.moveDown();

    // Set the font size to 14 and write the text "Fournitures" with an underline
    doc.fontSize(14).text('Fournitures:', { underline: true });

    // Loop through the supply details and write the name and image link for each one
    supplieDetails.forEach(supplie => {
        doc.fontSize(12).text(`Nom: ${supplie.name}`);
        doc.text(`Image: ${supplie.imageLink}`);
        doc.moveDown();
    });

    // End the PDF document
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', async () => {
            try {
                const fileBuffer = fs.readFileSync(pdfPath);

                const file = {
                    originalname: `Order_${order._id}.pdf`,
                    buffer: fileBuffer,
                    mimetype: 'application/pdf',
                };

                // Encrypt the PDF file
                const encryptedFile = await cryptDocument(file.buffer, process.env.ENCRYPTION_KEY, order.user);

                // Update the file object with the encrypted buffer
                file.buffer = encryptedFile;
                file.mimetype = 'application/octet-stream';

                // Resolve with the encrypted file object
                resolve(file);
            } catch (error) {
                reject(error);
            } finally {
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