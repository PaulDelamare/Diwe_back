//////////
//REQUIRE
//Import user model
const User = require('../models/User');
//Come get passport logic to manage JWTs
const JwtStrategy = require('passport-jwt').Strategy;
// Get the JWT extraction logic
const ExtractJwt = require('passport-jwt').ExtractJwt;
//////////
//////////

//////////
//Jwt options

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

//////////
//////////

//////////
//Passport

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async(jwt_payload,done) => {
            const user = await User.findOne({ email: jwt_payload.email });
            if(user) {
                return done(null, user);
            }

            return done(null,false);
        })
    )
}

//////////
//////////