var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var routes = require('./router');
//var limiter = require('./middleware/rateLimiter');

// Create the Express application:
var app = express();

// Attach middleware:
app.use(bodyParser.json()); //Or something similar
app.use(morgan('combined'));

app.use(express.static('./client'));
//Include rate limiting middleware
//app.use(limiter);

// Import the outer and assign it to the correct route:
app.use('/api', routes);

app.get('/', function (req, res) {
  res.json({ message: 'Welcome to the BlogRanks RESTful API!' });
});

module.exports = app;