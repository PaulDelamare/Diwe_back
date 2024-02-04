// Venir chercher la logique de passport pour gerez les JWT
const JwtStrategy = require('passport-jwt').Strategy;
// Venir chercher la logique d'extraction des JWT
const ExtractJwt = require('passport-jwt').ExtractJwt;

const users = require('../routes/auth.routes').users;


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts,(jwt_payload,done) => {
            // si username = timmy veut ce connecte a l'espace de jimmy, le token envoyer doit comprendre un payload avec le bon username
            const user = users.find(u => u.username === jwt_payload.username);

            if(user) {
                return done(null, user);
            }

            return done(null,false);
        })
    )
}