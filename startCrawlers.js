const frontPageCrawler = require('./frontPageCrawler.js');
//const postCrawler = require('./postCrawler.js');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler.js');
const whitelist = require('./whitelist.json');
const whiteListKeys = Object.keys(whitelist);

frontPageCrawler.getPosts(whiteListKeys, (results) => {
	console.log('FRONT PAGE POSTS: ', results.length);
	frontPageCrawler.filterPosts(results, (filtered) => {
		console.log('FILTERED POSTS: ', filtered.length);
		scheduler.scheduleCrawlersMulti(filtered, crawlUrl);
	});
});