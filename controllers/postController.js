var Post = require('../database');


exports.createOne = function(postData) {

  Post.create({
    url: postData.url,
    title: postData.title,
    keys: postData.tags,
    description: postData.description
  }).then(function(success) {
    console.log(success);
    //
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
  });
};

exports.addEdge = function(fromId, toId) {


};

exports.findOne = function(req, res) {

  Post.findAll({
    where: {
      url: req.url
    }
  }).then(function(result) {
    //Get all of these infos
    var linkedPosts = result.inLinks;
    return AsyncPromisGet(result.inLinks);
  }).then(function(allStuff) {

    res.send(allStuff);
  });
  //Finds one post, then finds all info for links to it.

};