var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var routes = require('./router');
var limiter = require('express-limiter');

// Create the Express application:
var app = express();

// Attach middleware:
app.use(bodyParser.json());

//Common options: 
// - combined: standard apache with more info
// - common: standard apache with less info
// - dev: color coded information
app.use(morgan('dev'));
app.use(express.static('thesis-client'));

//Include rate limiting middleware, you can also specify it as a middleware function in any route,
//as well as customize many of the actions taken
limiter({
  path: '*',
  method: 'all',
  lookup: 'connection.remoteAddress', //IP address in request
  //200 requests per hour
  total: 200,
  expire: 1000 * 60 * 60
});

// Import the outer and assign it to the correct route:
app.use('/api', routes);

module.exports = app;