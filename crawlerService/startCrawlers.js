const frontPageCrawler = require('./frontPageCrawler');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler');
const whitelist = require('./whitelist.json');
const prompt = require('prompt');

const whiteListKeys = Object.keys(whitelist);
const startTime = new Date().getTime();

const start = () => {
  if (process.argv.indexOf('--continue') > -1) {
    const queue = require('./queue.json');

    scheduler.scheduleCrawlersMulti(queue, (time) => {
      console.log(time - startTime);
    });
  } else if (process.argv.indexOf('--add') > -1) {

    var properties = [
      {
        name: 'WEBSITE STRING', 
        validator: /^[y|n]+$/,
        warning: 'Just say yes or no man (y,n)'
      }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
      if (err) { return onErr(err); }
      console.log('Command-line input received:');
      console.log('  Username: ' + result.username);
      console.log('  Password: ' + result.password);
    });

    function onErr(err) {
      console.log(err);
      return 1;
    }

  } else {
    frontPageCrawler.getPosts(whiteListKeys, (results) => {
      console.log('FRONT PAGE POSTS: ', results.length);
      frontPageCrawler.filterPosts(results, (filtered) => {
        console.log('FILTERED POSTS: ', filtered.length);
        // scheduler.scheduleCrawlers(filtered, (time) => {
        //   console.log(time - startTime);
        // });
        scheduler.scheduleCrawlersMulti(filtered, (time) => {
          console.log(time - startTime);
        });
      });
    });
  }
};
start();
module.exports = start;

