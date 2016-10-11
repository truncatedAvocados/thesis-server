// Main.js file

// Useful SQL queries
// select count(*) from posts;
// select
//   "inLinks"
//   ,title
//   ,url
// from posts
// where array_length("inLinks",1) > 0
// order by array_length("inLinks",1) desc;

const db = require('../db/database');
const Promise = require('bluebird');
const solver = require('./solver');

const Post = db.Post;
const Edges = db.Edges;
const Authors = db.Authors;
const Tags = db.Tags;

// This ranking function is for getting the h-factor of an author, as defined here:
// https://en.wikipedia.org/wiki/H-index
const findH = (array) => {
  // Assume the input array is sorted (algo doesn't work otherwise)
  let h = array.length;

  for (let i = 0; i < array.length; i++) {
    if (i + 1 >= array[i].inLinks.length) {
      h = Math.min(array[i].inLinks.length, i + 1);
      break;
    }
  }

  return h;
};

// This ranking function checks all the authors for a list of posts assigned to one tag,
// and gives back the ranking of authors by hIndex, but only if they have more than
// 5 articles in that tag
const sortAuthors = (posts) => {
  let results = [];

  posts.forEach((post) => {
    // get at authors for each post
    let i;
    post.authors.forEach((author) => {
      i = results.map(result => result.id).indexOf(author.id);
      // if its in our results array already
      if (i !== -1) {
        results[i].count += 1;
      // else it is not yet in the array
      } else {
        author.count = 1;
        results.push(author);
      }
    });
  });

  // console.log('Pre-filter: ',
  //   results.map(result => result.id),
  //   results.map(result => result.count));
  // filter out authors who have less than 5 posts on the subject
  results = results.filter(result => result.count > 4);
  // console.log('Post-filter: ', results.map(result => result.id));
  // sort the results by highest h-index first
  results.sort((a, b) => b.hIndex - a.hIndex);
  // console.log('Post-sorting: ',
  //   results.map(result => result.id),
  //   results.map(result => result.hIndex));
  // return a mapped array of just their ids
  return results.map(result => result.id);
};

// Page Rank
const rankPages = (cb) => {
  Post.max('postId')
    .then(n =>
      Post.findAndCountAll()
        .then(results => solver.makeAdjacencyMatrix(results.rows, n))
        .then(M => solver.solver(M, 0.8, 0.001))
        .then(v => cb(null, v))
        .catch(err => cb(err, null)))
    .catch(err => cb(err, null));
};


// attrs is an object of attributes and the ranking functions used to calculate their values
// options is used when fetching posts from tags in order to include authors for author ranking
const rank = (Model, attrs, cb, options) => {
  const start = new Date();

  Model.findAll()
    .then(results =>
      Promise.all(results.map(instance =>
        instance.getPosts(options).then((posts) => {
          // FOR PETE - CHANGE THIS TO SORT ON b.rank - a.rank ONCE PAGERANK IS IMPLEMENTED
          posts.sort((a, b) => b.inLinks.length - a.inLinks.length);

          const obj = {};
          attrs.forEach((key) => { obj[key] = attrs[key](posts); });

          return instance.updateAttributes(obj);
        })
      ))
    )
    .then((updated) => {
      const end = new Date();
      cb(null, updated, end - start);
    })
    .catch(err => cb(err));
};

const rankAuthors = (cb) => {
  // We fetch all authors, get their related posts, sort them, then use the sorted array to
  // find and assign their h-index score
  const attrs = {
    hIndex: findH };

  rank(Authors, attrs, cb);
};

const rankPosts = (cb) => {
  // We fetch all tags, then get their related posts, then get their postIds and
  // then update the tag "postRank" attribute to a list of post Ids

  // building up the args
  const attrs = {
    postRank: posts => posts.map(post => post.postId),
    authRank: sortAuthors };

  const options = {
    include: [Authors] };

  rank(Tags, attrs, cb, options);
};


exports.initRebalance = (cb) => {
  // FOR PETE:
  // re-computing PageRank should come first, then re-make the rankings using values from PageRank


  rankAuthors((err, updatedAuthors, time) => {
    // console.log('Time to assign h-index to author: ',
    //   time / 1000 + ' seconds');
    // now we have each author and their h-index
    rankPosts((err, updatedTags, time) => {
      // console.log('Time to rank posts and authors and add lists to tags: ',
      //   time / 1000 + ' seconds');
      // console.log('\nUpdated Author: ',
      //   updatedAuthors.length,
      //   '\nUpdated Tag: ',
      //   updatedTags.length);

      cb();
    });
  });
};

module.exports = rankPages;
// TESTING THE METHODS

// this.initRebalance(() => {
//   console.log('\nDONE');
// });
