var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// mongoose
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/exam';
mongoose.connect(dbUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static('./bower_components'));
app.use(express.static('./node_modules'));
app.use(express.static('./public'));
app.use(express.static('./assets'));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'exam',
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}));

app.locals.moment = require('moment');
app.locals.pretty = true;

// router
var student = require('./routes/student');
var teacher = require('./routes/teacher');
var admin = require('./routes/admin');
app.use('/', student);
app.use('/teacher', teacher);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error/error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
