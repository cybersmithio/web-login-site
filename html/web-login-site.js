var express=require('express');
var app=express();

//So we can read configuration files, load the file module
var fs=require('fs');

//Load the https module so we can generate queries to Tenable.io
// and so we can run a secure server
var https=require('https');

//Define the location of the certificate and private key
var httpsServerOptions = {
	key: fs.readFileSync(__dirname + '/ssl/key.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/cert.crt'),
}
app.set('httpsServerPort', process.env.PORT || 443);

//Load the error logging libraries and set the debug level
var errorLog = require('./lib/errorLog.js');
var debugLog = require('./lib/debugLog.js');
debugLogFlag=true;


//Read in the configuration file
var configuration = require('./configuration/config.js');




//This section is required for session management using a cookie session id
const session = require('express-session');
app.use(require('cookie-parser')(configuration.cookieSecret));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: configuration.cookieSecret,
}));


//Setup handlebars
var handlebars=require('express-handlebars').create({
	defaultLayout:'default',
});
debugLog("Loading handlebars engine")
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


//Setup a public directory for static content
app.use(express.static(__dirname + '/public'));



debugLog("Loading body-parser")
app.use(require('body-parser').urlencoded({extended: true}));


//This section covers adding authentication providers using Passport
debugLog("Loading Passport")
var auth = require('./lib/auth.js')(app, {
    // baseURL is optional; it will defualt to localhost if you omit it;
    // it can be helpful to set this if you're not working on
    // your local machine.  For example if you were using a staging server,
    // you might set the BASE_URL environment variable to
    // https://staging.domainname.com
    baseURL: process.env.BASE_URL,
    providers: configuration.authProviders,
    successRedirect: '/userarea',
    failureRedirect: '/login',
});
auth.init();
auth.registerRoutes();
app.get('/login',function(req,res){
    res.status(200).render('login');
});

//Log out the user and put them back to the login page
app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

app.get('/unauthorized',function(req,res){
    res.status(403).render('unauthorized');
});

//This section defines authorization roles
//There are two levels available currently:
//  observer - can only view things
//  analyst - can do most operations but cannot add or modify customers
//  admin - can do anything
function publicNotLoggedIn(req,res,next) {
    debugLog("Anyone can access this page")
    return next();
}

function userLoggedIn(req,res,next) {
	if(!req.user) {
        debugLog('No authenticated user')
	    return res.redirect(303,'/login');
	}
	//debugLog('Authenticated user is ',req.user)

    if(req.user === "jsmith") {
        debugLog("User is authorized for this page")
        return next();
    }
    debugLog("User is not authorized for this page")

    res.redirect(303,'/unauthorized');
}

debugLog("Setting up main routes")

//Declare home page route
app.get('/',publicNotLoggedIn,function(req,res) {
	//Start the initialization of all the cache data

	console.log('Cookies: ', req.cookies)
	console.log('Signed Cookies: ', req.signedCookies)
	cookies.set('LastVisit', new Date().toISOString(), { signed: true })
    res.render('home');
});

//Declare home page route
app.get('/userarea',userLoggedIn,function(req,res) {
	//Start the initialization of all the cache data

    res.render('userarea');
});



//Error handling
app.use(function(req,res,next) {
  res.status(404);
  res.render('404');
});

app.use(function(err,req,res,next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

https.createServer(httpsServerOptions, app).listen(app.get('httpsServerPort'), function () {
	console.log('Express started in '+app.get('env') + ' mode on port ' + app.get('httpsServerPort') + ' using HTTPS. ;press CTRL-C to terminate.');
});
