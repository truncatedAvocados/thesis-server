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

var findH = function(array) {

  var h = array.length;

  for (var i = 0; i < array.length; i++) {
    if (i + 1 >= array[i].inLinks.length) {
      h = Math.min(array[i].inLinks.length, i + 1);
      break;
    }
  }

  return h;
  //see what's smaller, the max inlinks or the length of the array
  //we know the array is sorted
};

exports.rankPosts = function(cb) {
  
  var start = new Date();

  Tags.findAll().then(tagResults => {

    return Promise.all(tagResults.map(tag => {
      return tag.getPosts().then(posts => {

        posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

        return author.updateAttributes({
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

exports.rankAuthors = function(cb) {

  var start = new Date();

  Authors.findAll().then(authResults =>{

    return Promise.all(authResults.map(author => {
      return author.getPosts().then(posts => {
        return author.updateAttributes({
          hIndex: findH(posts)
        });
      });
    }));


  });
};

// this.rankPosts((err, updated, time) => {
//   console.log(time / 1000 + ' seconds');
// });

this.rankAuthors((err, updated, time) => {
  console.log(time / 1000 + ' seconds');
});