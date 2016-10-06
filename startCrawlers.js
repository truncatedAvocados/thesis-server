const frontPageCrawler = require('./frontPageCrawler');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler');
const whitelist = require('./whitelist.json');

const whiteListKeys = Object.keys(whitelist);
const startTime = new Date().getTime();

const start = () => {
  if (process.argv.indexOf('--continue') > -1) {
    const queue = require('./queue.json');

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
};

module.exports = start;

