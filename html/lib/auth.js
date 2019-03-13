//Configure the authentication providers used by passport.
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

//A function to identify the user of a session by putting the user ID into the session cookie
passport.serializeUser(function(user,done){
    done(null, user);
});

passport.deserializeUser(function(id,done){
    done(null,"jsmith")
});



module.exports = function(app, options) {
    // if success and failure redirects aren't specified
    // set some reasonable defaults
    if( !options.successRedirect)
        options.successRedirect='/';
    if( !options.failureRedirect)
        options.failureRedirect='/login';
    return {
        init: function() {
            var env = app.get('env');
            var config=options.providers;

            passport.use(new LocalStrategy(
                function(username, password, done) {
                    console.log("Looking up username:",username)

                    if (username != "jsmith") {
                        console.log("Incorrect username")
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (password != "password") {
                        console.log("Incorrect password")
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    user="jsmith"
                    console.log("Successfully logged in")
                    return done(null, user);
                }
            ));


            app.use(passport.initialize());
            app.use(passport.session());
        },

        registerRoutes: function() {
            app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
                function(req, res) {
                    console.log("Redirecting to userarea")
                    res.redirect('/userarea');
                }
            );
        }
    };

};



