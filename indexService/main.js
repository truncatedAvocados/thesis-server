//Main.js file

//Useful SQL queries!!

//select count(*) from posts;
//select "inLinks", title, url  from posts where array_length("inLinks",1) > 0 order by array_length("inLinks",1) desc;

var db = require('../db/database');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');

exports.rankPosts = function(cb) {
  
  var start = new Date();

  Tags.findAll().then(tagResults => {

    return Promise.all(tagResults.map(tag => {
      return tag.getPosts().then(posts => {

        posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

        return tag.updateAttributes({
          postRank: posts.map(post => post.postId)
        });
      });
    }));

  }).then(updated => {

    var end = new Date();
    cb(null, updated, end - start);

  }).catch(err => {

    cb(err);

  });

};

this.rankPosts((err, updated, time) => {
  console.log(time);
});