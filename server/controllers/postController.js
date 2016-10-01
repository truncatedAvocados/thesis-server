var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Promise = require('bluebird');

//Finds one all posts matching a tag, sorting them by inLinks
exports.findTags = function(req, res) {

  Post.findAll({
    where: {
      tags: {
        $contains: req.query.tags
      }
    }
  }).then(function(results) {
    results.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.json(results);
  }).catch(function(err) {
    console.log('Error in find tags: ', err);
    res.status(500).send(err);
  });

};


//Finds one post, then finds all info for links to it.
exports.findOne = function(req, res) {

  Post.findOne({
    where: {
      postId: req.params.number
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

  }).then(function(inLinks) {
    inLinks.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.send(inLinks);

  }).catch(function(err) {

    console.log('Error in findOne: ', err);
    res.status(500).send(err);    

  });

};

