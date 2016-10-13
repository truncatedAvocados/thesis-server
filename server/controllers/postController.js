var db = require('../../db/database.js');
var Post = db.Post;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');
var stable = require('stable');
var query = require('../utils/tagQuery.js').query;
var sortBy = require('../utils/tagQuery.js').sortBy;
var fs = require('fs');


//Finds one all posts matching a tag, sorting them by inLinks
exports.findTags = function(req, res) {

  var options = {
    tagRank: 'postRank',
    model: Post,
    id: 'postId'
  };

  query(req, res, options);

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

    //TODO: change this to rank once PR is implemented
    inLinks.sort(sortBy);
    res.send(inLinks);

  }).catch(function(err) {

    console.log('Error in findOne: ', err);
    res.status(500).send(err);    

  });

};
  
exports.findStats = (req, res) => {
  var result = {};
  Post.count().then((postCount) => {
    result.posts = postCount;
    return Post.count({ 
      where: {
        inLinks: {
          $ne: []
        }
      }
    }).then((connCount) => {
      result.connected = connCount;
      return Authors.count()
    }).then((authCount) => {
      result.authors = authCount;
      res.json(result);
    });
  });
};

exports.findConnected = (cb) => {
  Post.findAll({
    where: {
      inLinks: {
        $ne: []
      }
    }
  }).then((results) => {
    var connected = results.map((item) => {
      return {
        title: item.dataValues.title,
        postId: item.dataValues.postId,
        inLinks: item.dataValues.inLinks,
        rank: item.dataValues.rank
      }
    });
    cb(connected);
  });
};

//Uncomment to write graph to JSON in thesis-client
// this.findConnected((connected) => {
//   fs.writeFile('./thesis-client/Public/App/Assets/graph.json', JSON.stringify(connected), (err) => {
//     if (err) {
//       throw err;
//     }
//   });
// });