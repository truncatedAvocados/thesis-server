var frontCrawler = require('./frontPageCrawler.js');
var scheduler = require('./scheduler.js');
var postCrawler = require('./postCrawler.js');
var db = require('./workerUtils/postUtils.js');

var whitelist = require('./whitelist.json');

console.log(Object.keys(whitelist).slice(0, 10));


frontCrawler.getPosts(Object.keys(whitelist).slice(0, 10), function(result) {
  console.log(result);
});