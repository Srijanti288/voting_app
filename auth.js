const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');


passport.use(new LocalStrategy ({
    usernameField: 'aadharCardNumber',
    passwordField: 'password',
}, async (aadharCardNumber, password, done) => {
    try {
        const user = await User.findOne({aadharCardNumber});
        if(!user){
            return done(null, false, {message: 'Invalid Aadhar Card Number or Password'});
        }
        const isPasswordMatch = await user.comparePassword(password);
        if(isPasswordMatch){
            return done(null, user);
        } else {
            return done (null, false, {message: 'Incorrect password'});
        }
    } catch (err){
        return done(err);
    }
}))



module.exports = passport;