var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');
var stable = require('stable');

//Finds one all posts matching a tag, sorting them by inLinks
exports.findTags = function(req, res) {

  var finalResults = [];

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
      tag.postRank.forEach(postId => {

        var i = finalRanking.map(one => one.postId).indexOf(postId);
        if (i < 0) {
          finalRanking.push({
            postId: postId,
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


    // Look at what page we are requesting, if necessary
    if (finalRanking.length > 20) {
      var start = req.query.page ? req.query.page * 20 - 1 : 0;
      //If no page was given we default to giving back the first 20 results
      finalRanking = finalRanking.slice(start, start + 20);
    }

    return Promise.all(finalRanking.map(function(onePost) {
      return Post.findOne({
        where: {
          postId: onePost.postId
        }
      });
    }));

  }).then(function(results) {
    res.json(results);
  }).catch(function(err) {
    console.log(err);
    res.status(500).send(err);
  });


};


//Finds one post, then finds all info for links to it.
exports.findOne = function(req, res) {

  Post.findOne({
    where: {
      postId: req.params.number
    }
  }).then(function(result) {

    //Get all of these infos
    var linkedPosts = result.inLinks;

    return Promise.all(linkedPosts.map(function(linkId) {
      return Post.findOne({
        where: {
          postId: linkId
        }
      });
    }));

  }).then(function(inLinks) {
    inLinks.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.send(inLinks);

  }).catch(function(err) {

    console.log('Error in findOne: ', err);
    res.status(500).send(err);    

  });

};

