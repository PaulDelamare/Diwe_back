const passport = require('passport');

/**
+ * Middleware function to check JWT authentication and user role.
+ *
+ * @param {string} role - The role required for access
+ * @return {function} Express middleware function
+ */
const checkAuthAndRole = (role = "") => {
    return (req, res, next) => {
        // Check JWT authentication
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }
            
            // If no user is authenticated or the JWT is invalid, return an error
            if (!user) {
                return res.status(401).json({ error: 'Non authentifié. Vous devez vous connecter.' });
            }

            // Check if the user has the required role
            if (role && user.role !== role) {
                return res.status(403).json({ error: 'Accès interdit. Vous n\'avez pas le rôle nécessaire.' });
            }

            // If the user has the required role or no role is specified, continue to the next middleware
            next();
        })(req, res, next);
    };
};

module.exports = checkAuthAndRole;
