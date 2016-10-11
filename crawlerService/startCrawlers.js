const frontPageCrawler = require('./frontPageCrawler');
const crawlUrl = require('./postCrawler').crawlUrl;
const scheduler = require('./scheduler');
const wl = require('./workerUtils/wlUtils.js');

const prompt = require('prompt');
const colors = require('colors/safe');
prompt.message = colors.underline.green('BlogRank');
prompt.delimiter = colors.green(' <-=-=-=-=-=-> ');


const startTime = new Date();

const start = () => {

  wl.findAll((err, bothLists) => {

    if (!err) {

      //process list
      var base = bothLists
                  .filter(item => item.base)
                  .map(item => {
                    var obj = {};
                    obj[item.url] = true;
                    return obj;
                  });

      var whitelist = bothLists
                  .filter(item => !item.base)
                  .map(item => {
                    var obj = {};
                    obj[item.url] = {
                      siteMap: item.siteMap
                    };
                    return obj;
                  });

      var whiteListKeys = Object.keys(whitelist);
      //First load up whitelist from DB, and pass them down
      //Where are these things checked from the json files?
        //1. front page crawler checks whether theres a sitemap or not
        //2. post crawler checks against base urls, but not in interactive mode
          // --> I think the easiest solution is to give the baseurl list as a reference to each crawler instance

      if (process.argv.indexOf('--continue') > -1) {
        const queue = require('./queue.json');

        scheduler.scheduleCrawlersMulti(queue, (time) => {
          console.log(time - startTime);
        });
      } else if (process.argv.indexOf('--add') > -1) {

        var properties = [
          {
            message: 'ENTER INTERACTIVE MODE? (Y/n)',
            name: 'decision', 
            validator: /^[y|n]+$/,
            warning: colors.red('Just say yes or no man (y,n)')
          }
        ];

        prompt.start();

        prompt.get(properties, function (err, result) {
          if (err) { 
            console.log(err);
            return 1;
          }
          if (result.decision === 'y') {
            console.log(colors.rainbow('\nYoU jUsT eNtErEd InTeRaCtIvE mOdE!!@@#$!!!'));
            console.log('Getting some random front page posts');

            randomSites = [];

            for (var i = 0; i < 1; i++) {
              var randomSite = whiteListKeys[Math.floor(Math.random() * whiteListKeys.length)];
              var randomSiteObj = whitelist[randomSite];
              if (randomSites.indexOf(randomSiteObj) < 0) {
                randomSites.push(randomSiteObj);
              }
            }

            console.log(randomKeys);

            frontPageCrawler.getPosts(randomSites, (results) => {

              console.log('POSTS FROM FRONT PAGE:' + results.length);
              results = results.map(result => {
                return {
                  url: result,
                  parent: null
                };
              });

              var options = {
                interactive: true,
                baseUrls: base
              };

              scheduler.scheduleCrawlersInteractive(results, options, (time) => {
                console.log('You just did this for ' + ((new Date() - startTime) / (60 * 1000)) + ' minutes');
              });

            });

          } else {
            console.log(colors.red('Nevermind >:('));
            return 1;
          }
        });

      } else {
        frontPageCrawler.getPosts(whitelist, (results) => {
          console.log('FRONT PAGE POSTS: ', results.length);
          frontPageCrawler.filterPosts(results, (filtered) => {
            console.log('FILTERED POSTS: ', filtered.length);

            var options = {
              baseUrls: base
            };

            // scheduler.scheduleCrawlers(filtered, options, (time) => {
            //   console.log(time - startTime);
            // });
            scheduler.scheduleCrawlersMulti(filtered, options, (time) => {
              console.log(time - startTime);
            });
          });
        });
      }
    } else {
      console.log(err);
    }

  });
};

start();
module.exports = start;

