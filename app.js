const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sslRedirect = require('heroku-ssl-redirect');

const app = express();

app.use(sslRedirect(['production']));

app.use('/', express.static(path.join(__dirname, 'dist')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/about', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'dist', 'about.html'));
});

app.get('/methods', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'dist', 'methods.html'));
});

app.get('/*', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

module.exports = app;
