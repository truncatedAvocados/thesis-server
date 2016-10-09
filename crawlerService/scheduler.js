const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const ON_DEATH = require('death');
const fs = require('fs');
const path = require('path');
const crawlUrl = require('./postCrawler').crawlUrl;

module.exports = {
  scheduleCrawlersMulti: (urlList, callback) => {
    if (cluster.isMaster) {
      cluster.setupMaster({
        exec: path.join(__dirname, 'childProc.js')
      });
      var crawled = {};
      var workers = numCPUs * 2 < urlList.length ? numCPUs * 2 : urlList.length;
      var urlCount = -1;
      ON_DEATH((signal, err) => {
        fs.writeFile('queue.json', JSON.stringify(urlList.slice(urlCount)), (err) => {
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
            count: urlCount
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
              count: urlCount
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

  scheduleCrawlersInteractive: (urlList, options, callback, crawled, tracker) => {
    tracker = tracker || 0;
    console.log(tracker, urlList.length);
    if (tracker === urlList.length) {
      console.log('Finished');
      callback(new Date().getTime());
      return;
    }

    console.log(urlList[tracker]);
    var scheduleCrawlersInteractive = module.exports.scheduleCrawlersInteractive;
    var crawled = crawled || {};



    crawlUrl(urlList[tracker], options, (links, index) => {
      var result = urlList.slice();
      console.log(crawled, !crawled[urlList[tracker].url]);
      if (!crawled[urlList[tracker].url]) {
        crawled[urlList[tracker].url] = true;
        var result = result.concat(links);
        console.log('Concatting links: ', result, result.length);
      }

      scheduleCrawlersInteractive(result, options, callback, crawled, tracker + 1);
    });
  }  
};

