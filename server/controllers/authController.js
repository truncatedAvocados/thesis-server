var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');
var stable = require('stable');
var query = require('../utils/tagQuery.js');


//Finds one all posts matching a tag, sorting them by inLinks
exports.findTags = function(req, res) {

  var options = {
    tagRank: 'authRank',
    model: Authors,
    id: 'id',
    include: [Post]
  };

  query(req, res, options);

};


//Finds one post, then finds all info for links to it.
exports.findOne = function(req, res) {

  Authors.findOne({
    where: {
      id: req.params.number
    },
    include: [Post]
  }).then(function(result) {

    //Get all of these infos
    console.log(result);
    var authorPosts = result.posts;
    authorPosts.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.send(authorPosts);

  }).catch(function(err) {

    console.log('Error in findOne: ', err);
    res.status(500).send(err);    

  });

};

