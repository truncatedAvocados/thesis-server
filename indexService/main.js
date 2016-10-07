//Main.js file

//Useful SQL queries
//select count(*) from posts;
//select "inLinks", title, url  from posts where array_length("inLinks",1) > 0 order by array_length("inLinks",1) desc;

var db = require('../db/database');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');


//This ranking function is for getting the h-factor of an author, as defined here:
//https://en.wikipedia.org/wiki/H-index
var findH = function(array) {

  //Assume the input array is sorted (algo doesn't work otherwise)
  var h = array.length;

  for (var i = 0; i < array.length; i++) {
    if (i + 1 >= array[i].inLinks.length) {
      h = Math.min(array[i].inLinks.length, i + 1);
      break;
    }
  }

  return h;
};

//This ranking function checks all the authors for a list of posts assigned to one tag,
//and gives back the ranking of authors by hIndex, but only if they have more than
// 5 articles in that tag
var sortAuthors = function(posts) {

  var results = [];

  posts.forEach(post => {
    //get at authors for each post
    post.authors.forEach(author => {
      
      var i = results.map(result => result.id).indexOf(author.id); 
      //if its in our results array already
      if (i !== -1) {
        results[i].count++;
      //else it is not yet in the array
      } else {
        author.count = 1;
        results.push(author);
      }
    });
  });

  // console.log('Pre-filter: ', results.map(result => result.id), results.map(result => result.count));
  //filter out authors who have less than 5 posts on the subject
  results = results.filter(result => result.count > 4);
  // console.log('Post-filter: ', results.map(result => result.id));
  //sort the results by highest h-index first 
  results.sort((a, b) => b.hIndex - a.hIndex);
  // console.log('Post-sorting: ', results.map(result => result.id), results.map(result => result.hIndex));
  //return a mapped array of just their ids
  return results.map(result => result.id);
};

//attrs is an object of attributes and the ranking functions used to calculate their values
//options is used when fetching posts from tags in order to include authors for author ranking
var rank = function(Model, attrs, cb, options) {

  var start = new Date();

  Model.findAll().then(results => {

    return Promise.all(results.map(instance => {
      return instance.getPosts(options).then(posts => {

        //FOR PETE - CHANGE THIS TO SORT ON b.rank - a.rank ONCE PAGERANK IS IMPLEMENTED
        posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

        var obj = {};
        for (var key in attrs) {
          obj[key] = attrs[key](posts);
        }

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

var rankAuthors = function(cb) {
  //We fetch all authors, get their related posts, sort them, then use the sorted array to
  //find and assign their h-index score
  var attrs = {
    hIndex: findH
  };

  rank(Authors, attrs, cb);
};

var rankPosts = function(cb) {
  //We fetch all tags, then get their related posts, then get their postIds and
  //then update the tag "postRank" attribute to a list of post Ids
  
  //building up the args
  var attrs = {
    postRank: (posts) => posts.map(post => post.postId),
    authRank: sortAuthors
  };

  var options = {
    include: [Authors]
  };

  rank(Tags, attrs, cb, options);
};


exports.initRebalance = function(cb) {

  //FOR PETE:
  //re-computing PageRank should come first, then re-make the rankings using values from PageRank


  rankAuthors((err, updatedAuthors, time) => {

    console.log('Time to assign h-index to author: ', time / 1000 + ' seconds');
    //now we have each author and their h-index
    rankPosts((err, updatedTags, time) => {

      console.log('Time to rank posts and authors and add lists to tags: ', time / 1000 + ' seconds');
      console.log('\nUpdated Author: ', updatedAuthors.length, '\nUpdated Tag: ', updatedTags.length);

      cb();
    });
  });
};

//TESTING THE METHODS

// this.initRebalance(() => {
//   console.log('\nDONE');
// });
