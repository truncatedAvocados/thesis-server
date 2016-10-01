const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const ON_DEATH = require('death');
const fs = require('fs');
const path = require('path');

module.exports = {
	scheduleCrawlersMulti: (urlList, cb) => {
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
				if (message.type = 'finish') {
					crawled[message.data.url] = true;
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
				} else if (message.type === 'ready') {
						urlCount++;
						cluster.workers[message.from].send({
							type: 'start',
							from: 'master',
							data: urlList[urlCount],
							count: urlCount
						});
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
					});
				}
			});
		}
	},
  scheduleCrawlersSingle: (queue, cb) => {
    let url;
    while (queue.length > 0) {
      url = queue.shift();
      cb(url, (links) => {
      	queue = queue.concat(links);
      	console.log('Queue Length: ', queue.length);
      });
    }
  } };

