var db = require('../../db/database.js');
var Post = db.Post;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');
var stable = require('stable');
var query = require('../utils/tagQuery.js');

module.exports = function(req, res, options) {
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
      var start = req.query.page ? req.query.page * 20 - 1 : 0;
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
    var sending = {
      results: results,
      count: totalResultCount
    };
    res.json(sending);
  }).catch(function(err) {
    console.log(err);
    res.status(500).send(err);
  });
};