const numCPUs = require('os').cpus().length;
const cluster = require('cluster');

module.exports = {
	scheduleCrawlersMulti: (urlList, cb) => {
		if (cluster.isMaster) {
			var crawled = {};
			var workers = numCPUs * 2 < urlList.length ? numCPUs * 2 : urlList.length;
			var urlCount = -1;
			var childMessageHandler = (message) => {
				if (message.type = 'finish') {
					crawled[message.data.url] = true;
					urlList = urlList.concat(message.data);
					urlCount++;
					if (urlList[urlCount]) {
						if (crawled[urlList[urlCount].url]) {
							urlList[urlCount] = null;
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
				if (workers === 0) {
					cluster.disconnect(() => {
						console.log('Finished');
					});
				}
			});
		} else {
			var masterMessageHandler = (message) => {
				if (message.type === 'start') {
					cb(message.data, (links) => {
						process.send({
							type: 'finish',
							from: cluster.worker.id,
							data: links
						});
					});
				} else if (message.type === 'kill') {
					cluster.worker.kill();
				}
			};
			process.on('message', masterMessageHandler);
			process.send({
				type: 'ready',
				from: cluster.worker.id,
				data: []
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

