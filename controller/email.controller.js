//////////
//REQUIRE
const sendEmail = require('../utils/sendEmail');
//////////
//////////

//////////
//FUNCTION CONTROLLER

exports.sendEmail = async (req, res) => {
    try {
        const html = { username: 'Jessica', url: 'https://example.com'};
        const attachments = [{
            filename: 'document.png',
            path: 'https://img.freepik.com/vecteurs-libre/fond-degrade-ambre_52683-112331.jpg'
        }]
        await sendEmail('paulodela2006@gmail.com, jesss@gmail.com', 'jess@gmail.com', 'Bienvenue sur notre site !', 'first-email', html, attachments);
        res.status(200).json({ message: 'E-mail envoyé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail' });
    }
}

//////////
//////////