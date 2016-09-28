var router = require('express').Router();
var postController = require('./controllers/postController');


router.get('/posts', function(req, res) {
  console.log('In the GET query for blog posts route: ', req.query.tags);
  req.query.tags = JSON.parse(req.query.tags);
  postController.findTags(req, res);
});

router.get('/posts/:number', function(req, res) {
  console.log('In the GET query for individual job posts route: ', req.params.number);
  postController.findOne(req, res);
});

router.get('/authors', function(req, res) {
  console.log('In the GET query for authors route');
  postController.retrieveOne(req, res, req.number);
});

router.get('/authors/:number', function(req, res) {
  console.log('In the GET query for an individual author route: ', req.params.number);
  postController.retrieveOne(req, res);
});

module.exports = router;