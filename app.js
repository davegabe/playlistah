var createError = require('http-errors');
var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var playlistRouter = require('./routes/p/playlist');

var app = express();

app.use(cookieParser());
app.use((req, res, next) => {
  let id = req.cookies._id;
  if (!id) {
    let id = new Date().getTime().toString();
    res.cookie('_id', id);
  }
  next()
})

var hbs = exphbs.create();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
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
  res.render('error');
});

module.exports = app;