var db = require('../../db/database.js');
var Post = db.Post;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');
var stable = require('stable');
var query = require('../utils/tagQuery.js');
var _ = require('lodash');
  
module.exports.sortBy = (a, b) => b.rank - a.rank;

module.exports.query = function(req, res, options) {
  //Send back the total number of results recieved so the client
  //can dynamically render
  var totalResultCount;

  Tags.findAll({
    where: {
      name: {
        in: req.query.tags
      }
    }
  }).then(function(tags) {
    
    //We need to write some logic around combinations of tags and weights of tags
    //For now, we'll give back the posts that contained the most overlap first
    //Subsorted by inLinks
    
    var finalRanking = [];

    //Building up intermediate array, so we can use some sorting logic around tags and rank later on
    tags.forEach(tag => {
      tag[options.tagRank].forEach(id => {

        var i = finalRanking.map(one => one.id).indexOf(id);
        if (i < 0) {
          finalRanking.push({
            id: id,
            count: [tag]
          });
        } else {
          finalRanking[i].count.push(tag);
        }

      });
    });

    //Implement a stable sort to bring posts with most matching tags to the top
    //But still in order relative to rankings
    if (req.query.tags.length > 1) {
      finalRanking = stable(finalRanking, (a, b) => b.count.length > a.count.length);
    }

    //Save total results
    totalResultCount = finalRanking.length;

    // Look at what page we are requesting, if necessary
    if (finalRanking.length > 20) {
      var start = req.query.page ? (req.query.page - 1) * 20 : 0;
      //If no page was given we default to giving back the first 20 results
      finalRanking = finalRanking.slice(start, start + 20);
    } else {
      console.log('There are not more than twenty results');
    }


    return Promise.all(finalRanking.map(function(one) {

      var q = {
        where: {}
      };

      q.where[options.id] = one.id;
      if (options.include) {
        q.include = options.include;
      }

      return options.model.findOne(q);
    }));

  }).then(function(results) {

    var sendResults = JSON.parse(JSON.stringify(results));
    //if we're doing an author query, filter out the posts that don't include the tags
    if (options.tagRank === 'authRank') {
      sendResults.forEach(auth => {
        auth.posts = auth.posts.filter(post => _.intersectionWith(req.query.tags, post.oldTags, _.isEqual).length > 0);
        //sort by post quality here as well
        auth.posts.sort(this.sortBy);

      });
    }

    var sending = {
      results: sendResults,
      count: totalResultCount
    };

    // console.log(sending.results[0].posts[0].oldTags);
    res.json(sending);
  }).catch(function(err) {
    console.log(err);
    res.status(500).send(err);
  });
};