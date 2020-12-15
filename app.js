var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var socket_io = require("socket.io");

var app = express();
var io = socket_io();
app.io = io;

var indexRouter = require('./routes/index');
var playlistRouter = require('./routes/p/playlist')(app.io);

app.use(cookieParser());
app.use((req, res, next) => {
  let user = req.cookies.user;
  if (!user) {
    let user = new Date().getTime().toString();
    res.cookie('user', user, {
      expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 10))
    });
  }
  next();
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use('/bulma', express.static(__dirname + '/node_modules/bulma/css'));
app.use('/fa', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/p', playlistRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(err.status || 500);
  res.render('error', {
    title: "Error 404",
    page: "error"
  });
});

module.exports = app;