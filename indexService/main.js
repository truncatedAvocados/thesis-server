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
var rank = function(Model, attrs, cb, options) {

  var start = new Date();

  Model.findAll().then(results => {

    return Promise.all(results.map(instance => {
      return instance.getPosts(options).then(posts => {

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

exports.rankAuthors = function(cb) {
  //We fetch all authors, get their related posts, sort them, then use the sorted array to
  //find and assign their h-index score
  rank(Authors, { hIndex: findH }, cb);
  // rank(Authors, 'hIndex', findH, cb);
};

exports.rankPosts = function(cb) {
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


exports.tagAuthors = function(cb) {

  this.rankAuthors((err, updatedAuthors, time) => {

    console.log('Time to assign h-index to author: ', time / 1000 + ' seconds');
    //now we have each author and their h-index
    this.rankPosts((err, updatedTags, time) => {

      console.log('Time to rank posts and authors and add lists to tags: ', time / 1000 + ' seconds');
      console.log('\nUpdated Author: ', updatedAuthors.length, '\nUpdated Tag: ', updatedTags.length);

      Promise.all(updatedTags.map(tag => {
        
        //transform each tag into a list of sorted authors

        return tag.getPosts().then(posts => {

          return Promise.all(posts.map(post => {
            return post.getAuthors();
          }));

        }).then((authorArray) => {
          console.log(authorArray[0]);
        }).catch((err) => {

        });
      }));

    });
  });
};

//TESTING THE METHODS

this.rankPosts((err, updated, time) => {
  console.log(time / 1000 + ' seconds');
});

// this.rankAuthors((err, updated, time) => {
//   console.log(time / 1000 + ' seconds');
// });

// this.tagAuthors();
// Tags.findAll().then((updatedTags) => {

//   Promise.all(updatedTags.map(tag => {
    

//     //This tag variable is the thing we will eventually update    
//     //transform each tag into a list of sorted authors

//     return tag.getPosts({
//       include: [Authors]
//     }).then(posts => {
//       savePosts = posts;
//       console.log(posts[0]);
//     }).catch((err) => {

//     });
//   }));

// });
