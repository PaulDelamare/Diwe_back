/**
+ * Middleware function to check the API key in the request header.
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @param {Function} next - The next function in the middleware chain
+ * @return {Promise} - A Promise that resolves if the API key is valid, or rejects with a 401 status and an error message
+ */

const apiKey = process.env.API_KEY;
const checkApiKey = async (req, res, next) => {
    let api_key_header = req.header("x-api-key");
    if (api_key_header === apiKey) {
        next();
    } else {
        return res.status(401).json({ error: 'Non authentifié. Vous devez utiliser votre clef API.', status : 401 });
    }
}

module.exports = checkApiKey