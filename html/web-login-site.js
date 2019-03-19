var express=require('express');
var app=express();
var Cookies = require('cookies')

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


function logInfo(req,res) {
    console.log('Requested page:',req.url)
    console.log('Headers',JSON.stringify(req.headers))
    console.log('Parsed cookies')
	console.log('Cookies: ', req.cookies)
	console.log('Signed Cookies: ', req.signedCookies)

	console.log('\n\n')

}

//Log out the user and put them back to the login page
app.get('/logout',function(req,res){
    logInfo(req,res)
    req.logout();
    res.redirect('/');
});

app.get('/unauthorized',function(req,res){
    logInfo(req,res)

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
    var cookies = new Cookies(req, res)
	//Start the initialization of all the cache data

    logInfo(req,res)
	cookies.set("James","Test value")
	//cookies.set('LastVisit', new Date().toISOString(), { signed: true })
    res.render('home');
});


//Dummy page 1
app.get('/uniquesig51a7b40fe568f32d40f5cb9a34ea4b4e/uniquesig0/InternalSite/Login.asp',publicNotLoggedIn,function(req,res) {
	//Start the initialization of all the cache data
    logInfo(req,res)
    res.redirect(302,'/uniquesig51a7b40fe568f32d40f5cb9a34ea4b4e/uniquesig0/InternalSite/InitParams.aspx?referrer=/InternalSite/Login.asp&resource%5Fid=329672D807B8417B990E00D284CAB21F&login%5Ftype=2&site%5Fname=oakvilleportals&secure=1&URLHASH=0468ed40%2D55a0%2D4af4%2Db019%2D3039103a7a68&orig%5Furl=https%3A%2F%2Fportico%2Eoakville%2Eca%2F');
});

//Dummy page 1
app.get('/uniquesig51a7b40fe568f32d40f5cb9a34ea4b4e/uniquesig0/InternalSite/InitParams.aspx',publicNotLoggedIn,function(req,res) {
	//Start the initialization of all the cache data
    logInfo(req,res)

    //Test if we respond with anything other than a 3xx, will it start with the cookies?
    //res.render('home');
    res.redirect(302,'/uniquesig51a7b40fe568f32d40f5cb9a34ea4b4e/uniquesig0/InternalSite/Login.asp?resource_id=329672D807B8417B990E00D284CAB21F&login_type=2&site_name=oakvilleportals&secure=1&URLHASH=0468ed40-55a0-4af4-b019-3039103a7a68&orig_url=https://portico.oakville.ca');
});



//Declare home page route
app.get('/userarea',userLoggedIn,function(req,res) {
	//Start the initialization of all the cache data
    logInfo(req,res)
    res.render('userarea');
});




//Error handling
app.use(function(req,res,next) {
  logInfo(req,res)
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
