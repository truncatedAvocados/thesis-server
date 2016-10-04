var db = require('../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Promise = require('bluebird');

exports.findOrCreateOne = function(postData, cb) {

  var createdPost;
  var createdAuthors;
  var createdTags;

  //create post
    //if it was created, have to add many to many relations
    //find or create all authors passed
    //add those models to the post created with model.addAuthors(author_models)

    //find or create all tags passed
    //add those models to the post created with model.addTags(tag_models)

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
        author: postData.author,
        publishDate: postData.date
      });
    } else {
      cb(null, found);
    }
  }).then(function(created) {
    // console.log('Here: ', created);

    //return created.addAuthors()
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

exports.createOneWithEdge = function(postData, parentUrl, cb) {

  //parentUrl is the thing we would like to add an
  //edge pointing FROM
  var postToAddEdge, parent;

  this.findOrCreateOne(postData, function(err, success) {

    if (success) {

      postToAddEdge = success;

      //This SHOULD already exist. So the else statement is just to handle edge cases but hopefully would never be called
      Post.findOne({
        where: {
          url: parentUrl
        }
      }).then(function(linkFrom) {
        //We don't want to add the same ID more than once, otherwise the validity of our ranking algorithm becomes diluted
        //This is an edge case, just in case the post being linked has already been linked
        
        if (linkFrom) {
          parent = linkFrom;
          var temp = postToAddEdge.inLinks ? postToAddEdge.inLinks.slice() : [];
          if (temp.includes(linkFrom.postId)) {

            cb(null, postToAddEdge, linkFrom);

          } else {

            temp.push(linkFrom.postId);
            return postToAddEdge.updateAttributes({
              inLinks: temp
            });
          }
        } else {
          cb(null, postToAddEdge);
        }
     // }

      }).then(function(updated) {
        if (updated) {
          cb(null, updated, parent);
        }
      }).catch(function(err) {
        console.log(err);
        cb(err);
      });

    } else {
      console.log(err);
      cb(err);
    }
  });
};
