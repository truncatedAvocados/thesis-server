var db = require('../db/database.js');
var WL = db.WL;
var Promise = require('bluebird');

exports.findAll = function(cb) {

  WL.findAll().then(function(results) {
    cb(null, results);
  }).catch(function(err) {
    cb(err);
  });

};

exports.addOne = function(urlString, cb) {
  
  WL.findOne({
    where: {
      url: urlString,
    }
  }).then(function(found) {
    // console.log('I found a post: ', found);
    if (!found) {
      return WL.create({
        url: urlString
      });
    } else {
      cb(null, found);      
    }
  }).then(function(created) {
    // console.log('Here: ', created);
    if (created) {
      cb(null, created);    
    }
  }).catch(function(err) {
    // console.log(err);
    cb(err);
  });
};