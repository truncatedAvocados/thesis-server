const frontPageCrawler = require('./frontPageCrawler.js');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler.js');
const whitelist = require('./whitelist.json');
const whiteListKeys = Object.keys(whitelist).slice(0, 10);


if (process.argv.indexOf('--continue') > -1) {
  var queue = require('./queue.json');
  scheduler.scheduleCrawlersMulti(queue, crawlUrl);
} else {
  frontPageCrawler.getPosts(whiteListKeys, (results) => {
  	console.log('FRONT PAGE POSTS: ', results.length);
  	frontPageCrawler.filterPosts(results, (filtered) => {
  		console.log('FILTERED POSTS: ', filtered.length);
  		scheduler.scheduleCrawlersMulti(filtered, crawlUrl);
  	});
  });
}

      // cluster.setupMaster({
      //   exec: __dirname + '/scheduler.js'
      // });