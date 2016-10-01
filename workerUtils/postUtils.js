var db = require('../db/database.js');
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
        tags: postData.tags,
        description: postData.desc,
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

exports.findUrl = (url, cb) => {
  Post.findOne({
    where: {
      url: url
    }
  }).then((found) => {
    cb(null, found);
  });
};

exports.createOneWithEdge = function(postData, currUrl, cb) {

  //currUrl is the thing we would like to add an
  //edge pointing towards
  var postToLink;

  this.findOrCreateOne(postData, function(err, success) {

    if (success) {

      postToLink = success;

      //If currUrl is undefined we know the crawler is at the top level
      //if (currUrl) {
        //We know that this will exist
      Post.findOne({
        where: {
          url: currUrl
        }
      }).then(function(linkee) {
        //We don't want to add the same ID more than once, otherwise the validity of our ranking algorithm becomes diluted
        //This is an edge case, just in case the post being linked has already been linked
        if (linkee) {
          var temp = linkee.inLinks ? linkee.inLinks.slice() : [];
          if (temp.includes(postToLink.postId)) {

            cb(null, postToLink, linkee);

          } else {

            temp.push(postToLink.postId);
            return linkee.updateAttributes({
              inLinks: temp
            });
          }
        } else {
          cb(null, postToLink);
        }
     // }

      }).then(function(updated) {
        if (updated) {
          cb(null, postToLink, updated);
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
