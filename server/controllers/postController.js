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
    res.json(results);
  }).catch(function(err) {
    console.log('Error in find tags: ', err);
    res.status(500).send(err);
  });
  
};


exports.findOne = function(req, res) {

  Post.findOne({
    where: {
      postId: req.params.number
    }
  }).then(function(result) {
    //Get all of these infos

    console.log('We found the post: ', result);
    var linkedPosts = result.inLinks;

    return Promise.all(linkedPosts.map(function(linkId) {
      return Post.findOne({
        where: {
          postId: linkId
        }
      });
    }));
  }).then(function(allStuff) {
    console.log(allStuff.dataValues);
    res.send(allStuff);
  }).catch(function(err) {
    console.log('Error in findOne: ', err);
    res.status(500).send(err);    
  });
  //Finds one post, then finds all info for links to it.

};

