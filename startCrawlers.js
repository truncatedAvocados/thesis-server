const frontPageCrawler = require('./frontPageCrawler.js');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler.js');
const whitelist = require('./whitelist.json');
const whiteListKeys = Object.keys(whitelist);

var startTime = new Date().getTime();

if (process.argv.indexOf('--continue') > -1) {
  var queue = require('./queue.json');
  scheduler.scheduleCrawlersMulti(queue, (time) => {
    console.log(time - startTime);
  });
} else {
  frontPageCrawler.getPosts(whiteListKeys, (results) => {
    console.log('FRONT PAGE POSTS: ', results.length);
    frontPageCrawler.filterPosts(results, (filtered) => {
      console.log('FILTERED POSTS: ', filtered.length);
      scheduler.scheduleCrawlers(filtered, (time) => {
        console.log(time - startTime);
      });
      // scheduler.scheduleCrawlersMulti(filtered, (time) => {
      //   console.log(time - startTime);
      // });
    });
  });
}
