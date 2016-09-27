var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Promise = require('bluebird');

exports.findTags = function(req, res) {

  Post.findAll({
    where: {
      keys: {
        $contains: req.query.tags
      }
    }
  }).then(function(results) {

    res.send(results);
  }).catch(function(err) {
    res.status(500).send(err);
  });
};


exports.findOne = function(req, res) {

  Post.findOne({
    where: {
      url: req.url
    }
  }).then(function(result) {
    //Get all of these infos
    var linkedPosts = result.inLinks;

    return Promise.all(linkedPosts.map(function(linkId) {
      return Post.findOne({
        where: {
          postId: linkId
        }
      });
    }));
  }).then(function(allStuff) {
    console.log(allStuff);
    res.send(allStuff);
  });
  //Finds one post, then finds all info for links to it.

};

