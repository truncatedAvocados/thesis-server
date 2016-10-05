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
  scheduleCrawlers: (urlList, callback) => {
  	if (urlList.length === 0) {
  		console.log('Finished');
  		callback(new Date().getTime());
  		return;
  	}
  	var scheduleCrawlers = module.exports.scheduleCrawlers;
    var count = 0;
    var result = [];

    ON_DEATH((signal, err) => {
    	fs.writeFile('queue.json', JSON.stringify(urlList.slice(count).concat(result)), (err) => {
    		if (err) {
    			console.log(err);
    		}
    	});
    });

    urlList.forEach((url) => {
    	crawlUrl(url, (links, index) => {
    		result = result.concat(links);
    		count++;
    		if (count === urlList.length) {
    			scheduleCrawlers(result, callback);
    		}
    	});
    });
  } 
};

