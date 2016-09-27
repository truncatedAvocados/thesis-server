var router = require('express').Router();
var postController = require('./controllers/postController');

// Create route handlers for each of the six methods in postController

// router.route('/:number')
//   .all(function(req, res, next) {
//     console.log('In the middleware: ', req.url);
//     req.number = parseInt(req.url.slice(1));
//     console.log('this is working: ', req.number, typeof req.number);
//     next();
//     //grab the number, put it in the req, and continue
//     //brb
//   });

router.get('/posts', function(req, res) {
  console.log('In the GET query for blog posts route');
  postController.findTags(req, res);
});

router.get('/posts/:number', function(req, res) {
  console.log('In the GET query for individual job posts route');
  postController.findOne(req, res);
});

router.get('/authors', function(req, res) {
  console.log('In the GET query for authors route');
  postController.retrieveOne(req, res, req.number);
});

router.get('/authors/:number', function(req, res) {
  console.log('In the GET query for an individual author route');
  postController.retrieveOne(req, res, req.number);
});

module.exports = router;