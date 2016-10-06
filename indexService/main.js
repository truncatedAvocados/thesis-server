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

// exports.rankPosts = function(cb) {
  
//   var start = new Date();

//   Tags.findAll().then(tagResults => {

//     return Promise.all(tagResults.map(tag => {
//       return tag.getPosts().then(posts => {

//         posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

//         return tag.updateAttributes({
//           postRank: posts.map(post => post.postId)
//         });
//       });
//     }));

//   }).then(updated => {

//     var end = new Date();
//     cb(null, updated, end - start);

//   }).catch(err => {

//     cb(err);

//   });

// };

// exports.rankAuthors = function(cb) {

//   var start = new Date();

//   Authors.findAll().then(authResults =>{

//     return Promise.all(authResults.map(author => {
//       return author.getPosts().then(posts => {

//         posts.sort((a, b) => b.inLinks.length - a.inLinks.length);
//         return author.updateAttributes({
//           hIndex: findH(posts)
//         });
//       });
//     }));

//   }).then(updated => {

//     var end = new Date();
//     cb(null, updated, end - start);

//   }).catch(err => {

//     cb(err);

//   });
// };

rank = function(Model, attr, rankingFunc, cb) {

  var start = new Date();

  Model.findAll().then(results => {

    return Promise.all(results.map(instance => {
      return instance.getPosts().then(posts => {

        posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

        var obj = {};
        obj[attr] = rankingFunc(posts);
        return instance.updateAttributes(obj);
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
  //We fetch all authors, get their related posts, sort them, then use the sorted array to
  //find and assign their h-index score
  rank(Authors, 'hIndex', findH, cb);
};

exports.rankPosts = function(cb) {
  //We fetch all tags, then get their related posts, then get their postIds and
  //then update the tag "postRank" attribute to a list of post Ids
  rank(Tags, 'postRank', (posts) => posts.map(post => post.postId), cb);
};


//TESTING THE METHODS

this.rankPosts((err, updated, time) => {
  console.log(time / 1000 + ' seconds');
});

// this.rankAuthors((err, updated, time) => {
//   console.log(time / 1000 + ' seconds');
// });