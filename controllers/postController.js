var Post = require('../database').Post;
var Edges = require('../database').Edges;
var Promise = require('bluebird');

exports.createOne = function(postData, cb) {

  Post.findOrCreate({
    url: postData.url,
    title: postData.title,
    keys: postData.tags,
    description: postData.description
  }).then(function(success) {
    //console.log(success);
    cb(null, success);
  }).catch(function(err) {
    //console.log(err);
    cb(err);
  });

};

exports.createOneWithEdge = function(postData, currUrl, cb) {

  //currUrl is the thing we would like to add an 
  //edge pointing towards
  var postToLink;

  Post.findOrCreate({
    url: postData.url,
    title: postData.title,
    keys: postData.tags,
    description: postData.description
  }).then(function(success) {

    postToLink = success;
    //Since this function is called once a page has 
    //already been added, this lookup should always work
    return Post.findOne({
      where: {
        url: currUrl
      }
    });
  }).then(function(linkee) {
    //
    return linkee.update({
      inLinks: linkee.inLinks.push(postToLink.postId)
    });

  }).then(function(updated) {
    cb(null, updated, postToLink);
  }).catch(function(err) {
    cb(err);
  });

};

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

