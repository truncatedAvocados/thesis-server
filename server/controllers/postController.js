var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');

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

    console.log(finalRanking);

    //Look at what page we are requesting
    // if (finaRanking.length > 20) {
    //   req.query.page ? 
    // }

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



// Old query for FIND TAGS
// orQuery = req.query.tags.map(tag => {
//   return { 
//     oldTags: {
//       $contains: [tag]
//     }
//   };
// });

// Post.findAll({
//   where: { 
//     $or: orQuery
//   }
// }).then(function(results) {
//   results.sort((a, b) => b.inLinks.length - a.inLinks.length);
//   res.json(results);
// }).catch(function(err) {
//   console.log('Error in find tags: ', err);
//   res.status(500).send(err);
// });

