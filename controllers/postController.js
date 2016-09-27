var db = require('../database');
var Post = db.Post;
var Edges = db.Edges;
var Promise = require('bluebird');

exports.findOrCreateOne = function(postData, cb) {

  Post.findOne({
    where: {
      url: postData.url,
    }
  }).then(function(found) {
    // console.log('I found a post: ', found);
    if (!found) {
      return Post.create({
        url: postData.url,
        title: postData.title,
        keys: postData.keys,
        description: postData.description,
        author: postData.author
      });
    } else {
      cb(null, found);      
    }
  }).then(function(created) {
    // console.log('Here: ', created);
    if (created) {
      cb(null, created);    
    }
  }).catch(function(err) {
    // console.log(err);
    cb(err);
  });

};

exports.createOneWithEdge = function(postData, currUrl, cb) {

  //currUrl is the thing we would like to add an 
  //edge pointing towards
  var postToLink;

  this.findOrCreateOne(postData, function(err, success) {
    if (success) {

      postToLink = success;
    
      //We should know that this post exists, since the web crawler just created it
      Post.findOne({
        where: {
          url: currUrl
        }
      }).then(function(linkee) {
        //We don't want to add the same ID more than once, otherwise the validity of our ranking algorithm becomes diluted
        //This is an edge case, just in case the post being linked has already been linked
        var temp = linkee.inLinks ? linkee.inLinks.slice() : [];
        if (temp.includes(postToLink.postId)) {

          cb(null, linkee, postToLink);   
                 
        } else {

          temp.push(postToLink.postId);
          return linkee.updateAttributes({
            inLinks: temp
          });

        }    

      }).then(function(updated) {
        if (updated) {
          cb(null, updated, postToLink);
        }
      }).catch(function(err) {
        cb(err);
      });

    } else {
      console.log(err);
      cb(err);
    }
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

