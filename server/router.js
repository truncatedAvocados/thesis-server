var router = require('express').Router();
var postController = require('./controllers/postController');
var authController = require('./controllers/authController');

router.get('/posts', function(req, res) {
  console.log('In the GET query for blog posts route: ', req.query.tags);
  if (req.query.tags) {
    req.query.tags = JSON.parse(req.query.tags);
  }
  postController.findTags(req, res);
});

router.get('/posts/:number', function(req, res) {
  console.log('In the GET query for individual job posts route: ', req.params.number);
  postController.findOne(req, res);
});

router.get('/authors', function(req, res) {
  console.log('In the GET query for authors route');
  if (req.query.tags) {
    req.query.tags = JSON.parse(req.query.tags);
  }
  authController.findTags(req, res, req.number);
});

router.get('/authors/:number', function(req, res) {
  console.log('In the GET query for an individual author route: ', req.params.number);
  authController.findOne(req, res);
});

router.get('/stats', function(req, res) {
  console.log('GET statistics');
  postController.findStats(req, res);
});

module.exports = router;