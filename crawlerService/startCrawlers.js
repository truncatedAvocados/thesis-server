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

  wl.findAll((err, allLists) => {

    if (!err) {
      //process lists
      var base = {};
      allLists
        .filter(item => item.base)
        .forEach(item => {
          base[item.url] = true;
        });

      var badUrls = {};
      allLists
        .filter(item => item.bad)
        .forEach(item => {
          badUrls[item.url] = true;
        });

      var whitelist = allLists
                  .filter(item => !item.base)
                  .map(item => {
                    var obj = {};
                    obj[item.url] = {
                      siteMap: item.siteMap
                    };
                    return obj;
                  });

      var whiteListKeys = Object.keys(whitelist);

      if (process.argv.indexOf('--continue') > -1) {
        const queue = require('./queue.json');
        
        var options = {
          baseUrls: base
        };

        scheduler.scheduleCrawlersMulti(queue, options, (time) => {
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
            console.log(colors.rainbow('\nYOU JUST ENTERED INTERACTIVE MODE~~~~~'));
            console.log('Getting some random front page posts');

            randomSites = [];

            for (var i = 0; i < 2; i++) {
              var randomSite = whiteListKeys[Math.floor(Math.random() * whiteListKeys.length)];
              var randomSiteObj = whitelist[randomSite];
              if (randomSites.indexOf(randomSiteObj) < 0) {
                randomSites.push(randomSiteObj);
              }
            }

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
                baseUrls: base,
                badUrls: badUrls
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

