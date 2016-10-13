const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const ON_DEATH = require('death');
const fs = require('fs');
const path = require('path');
const crawlUrl = require('./postCrawler').crawlUrl;

const baseUrlGetter = (url) => {
  const regex = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?');
  return regex.exec(url)[4] ? null : regex.exec(url)[2];
};

module.exports = {
  scheduleCrawlersMulti: (urlList, options, callback) => {
    if (cluster.isMaster) {
      cluster.setupMaster({
        exec: path.join(__dirname, 'childProc.js')
      });
      var crawled = {};
      var workers = numCPUs * 2 < urlList.length ? numCPUs * 2 : urlList.length;
      var urlCount = -1;
      ON_DEATH((signal, err) => {
        fs.writeFile('crawlerService/queue.json', JSON.stringify(urlList.slice(urlCount)), (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
      var childMessageHandler = (message) => {
        if (message.type === 'ready') {
          urlCount++;
          cluster.workers[message.from].send({
            type: 'start',
            from: 'master',
            data: urlList[urlCount],
            count: urlCount,
            options: options
          });
        } else if (message.type = 'finish') {
          crawled[urlList[message.count].url] = true;
          urlList = urlList.concat(message.data);
          urlCount++;
          if (urlList[urlCount]) {
            if (crawled[urlList[urlCount].url]) {
              urlList[urlCount].url = null;
            }
            cluster.workers[message.from].send({
              type: 'start',
              from: 'master',
              data: urlList[urlCount],
              count: urlCount,
              options: options
            });
          } else {
            cluster.workers[message.from].send({
              type: 'kill',
              from: 'master'
            });
          }
        }
      };
      var createChild = () => {
        var child = cluster.fork();
        child.on('message', childMessageHandler);
      };
      for (var i = 0; i < workers; i++) {
        createChild();
      }
      cluster.on('disconnect', (worker) => {
        workers--;
        if (workers <= 0) {
          cluster.disconnect(() => {
            console.log('Finished');
            callback(new Date().getTime());
          });
        }
      });
    }
  },
  scheduleCrawlers: (urlList, options, callback, crawled) => {
    if (urlList.length === 0) {
      console.log('Finished');
      callback(new Date().getTime());
      return;
    }
    console.log(urlList[0]);
    var scheduleCrawlers = module.exports.scheduleCrawlers;
    var count = 0;
    var result = [];
    var crawled = crawled || {};

    ON_DEATH((signal, err) => {
      fs.writeFile('queue.json', JSON.stringify(urlList.slice(count).concat(result)), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

    urlList.forEach((url) => {
      crawlUrl(url, options, (links, index) => {
        console.log('Concatting links: ', links);
        if (!crawled[url]) {
          crawled[url] = true;
          result = result.concat(links);
        }

        count++;
        console.log('Callback status: ', count, urlList.length);
        if (count === urlList.length) {
          scheduleCrawlers(result, options, callback, crawled);
        }
      });
    });
  },

  scheduleCrawlersInteractive: (urlList, options, callback, crawled) => {

    if (urlList.length === 0) {
      console.log('Finished');
      callback(new Date().getTime());
      return;
    }

    var scheduleCrawlersInteractive = module.exports.scheduleCrawlersInteractive;
    var crawled = crawled || {};

    var baseCheck = baseUrlGetter(urlList[0].url);
    
    //Don't crawl these links
    if (options.badUrls[baseCheck]) {
      scheduleCrawlersInteractive(urlList.slice(1), options, callback, crawled);

    } else {
      crawlUrl(urlList[0], options, (links, index) => {
  
        // You can enable this to view your cache growing        
        console.log('Your current baseUrl and whitelist size: ', Object.keys(options.baseUrls).length);
        // console.log('Your current badUrls size: ', Object.keys(options.badUrls).length);

        console.log(links[0]);
        var result = urlList.slice(1);

        links = links.filter(link => !options.badUrls[baseUrlGetter(link)]);

        if (!crawled[urlList[0].url]) {
          crawled[urlList[0].url] = true;
          //Add these to the beginning of the Q
          if (links[0] && links[0].parent.match(/www.blogger.com\/profile/)) {
            result = links.concat(result);
          } else {
            result = result.concat(links);
          }
        }
        scheduleCrawlersInteractive(result, options, callback, crawled);
      });
    }  
  }
};

