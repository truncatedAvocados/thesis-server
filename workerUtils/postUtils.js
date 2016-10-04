var db = require('../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;

var Promise = require('bluebird');

exports.findOrCreateOne = function(postData, cb) {

  var createdPost, createdAuthors, createdTags;

  postData.author = postData.author instanceof Array 
                      ? postData.author 
                      : [postData.author];

    //find or create all authors passed
    //add those models to the post created with model.addAuthors(author_models)

    //find or create all tags passed
    //add those models to the post created with model.addTags(tag_models)

  Post.findOne({
    where: {
      url: postData.url,
    }
  }).then(function(found) {

    if (!found) {
      //create post
      //if it was created, have to add many to many relations
      return Post.create({
        url: postData.url,
        title: postData.title,
        oldTags: postData.tags,
        description: postData.desc,
        author: postData.author[0],
        publishDate: postData.date
      });
    } else {
      cb(null, found);
    }
  }).then(function(created) {

    createdPost = created;
    if (createdPost) {
      return Promise.all(postData.author.map(function(auth) {
        return Authors.findOrCreate({
          where: {
            name: auth
          }
        }).spread(function(authorFound, authorCreated) {
          // console.log('Found: ', authorFound, 'Created: ', authorCreated);
          return createdPost.addAuthor(authorFound ? authorFound : authorCreated);
        });
      }));
    }

  }).then(function(authors) {

    if (createdPost) {
      return Promise.all(postData.tags.map(function(tag) {
        return Tags.findOrCreate({
          where: {
            name: tag
          }
        }).spread(function(tagFound, tagCreated) {
          console.log('Found: ', tagFound, 'Created: ', tagCreated);
          return createdPost.addTag(tagFound ? tagFound : tagCreated);
        });
      }));
    }

  }).then(function(tags) {

    if (createdPost) {
      cb(null, createdPost);
    }

  }).catch(function(err) {
    console.log(err);
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
