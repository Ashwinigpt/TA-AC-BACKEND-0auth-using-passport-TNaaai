var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

var User = require('../models/User');

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
    scope: [ 'user:email' ]
    },
    async (accessToken, refreshToken, profile, cb)=>  {
        var profileData = {
            name : profile._json.name,
            email: profile.emails[0].value,
        };
        try {
            const user = await User.findOne({email :  profile.emails[0].value });
            if(!user){
                const addedUser = await User.create(profileData);
                return cb(null, addedUser);
            }
            return cb(null,user);
        } catch (error) {
            return cb(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, "name email username", function (err, user) {
        done(err, user);
    });
});