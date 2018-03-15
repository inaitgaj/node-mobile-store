
/**
 * Module dependencies.
 */

var express = require('express')
  , session = require('express-session')
  , routes = require('./routes')
  , productRoutes = require('./routes/products')
  , userRoutes = require('./routes/users')
  , cartRoutes = require('./routes/carts')
  , http = require('http')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser');



  // Database
  var mongo = require('mongodb');
  var monk = require('monk');
  // var db = monk('localhost:27017/NAGP');
  var db = monk('mongodb://admin:admin@ds215019.mlab.com:15019/nagp-ng');

var app = express();

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
// all environments


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.use(favicon);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(
  {
    secret: 'ssshhhhh',
    cookie: {
        secure: false
    }
  }
));
require('./config/passport.js')(app, db);


//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/carts', cartRoutes);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
