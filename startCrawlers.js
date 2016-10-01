const frontPageCrawler = require('./frontPageCrawler.js');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler.js');
//const whitelist = require('./whitelist.json');
const whitelist = {"https://blogs.msdn.microsoft.com/dotnet/": true,
  "https://blogs.msdn.microsoft.com/oldnewthing/": true,
  "https://blogs.msdn.microsoft.com/pythonengineering/": true};
const whiteListKeys = Object.keys(whitelist);


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
