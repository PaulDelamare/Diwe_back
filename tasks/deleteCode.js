const cron = require('node-cron');
const VerificationCode = require('../models/VerificationCode');

/**
+ * Deletes all validation codes that are no longer valid and not used
+ *
+ * @param {None} None
+ * @return {None} None
+ */
function deleteCode() {
    // Task is execute every day at midnight
    cron.schedule('10 0 * * *', async () => {
        try {
            // Get the actually time
            const now = new Date();

            // Find users created two weeks ago and not active and delete them
            await VerificationCode.deleteMany({ expiresAt: { $lt: now } });

            console.log('Tous les codes de validation expirés ont été supprimés.');
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la suppression des codes de validation expirés', error);
        }
    });
}

module.exports = deleteCode