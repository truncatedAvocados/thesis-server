const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const baseUrls = require('./baseUrls.json');

const getBaseUrl = (url) => {
  const regex = new RegExp("^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?");
  return regex.exec(url)[2];
};

module.exports = {
	scheduleCrawlersMulti: (urlList) => {
		if (cluster.isMaster) {
			var workers = numCPUs * 2;
			var urlCount = -1;
			var childMessageHandler = (message) => {
				if (message.type = 'finish') {
					urlCount++;
					urlList = urlList.concat(message.data);
					if (urlList[urlCount]) {
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
				if (workers === 0) {
					cluster.disconnect(() => {
						console.log('Finished');
					});
				}
			});
		} else {
			var masterMessageHandler = (message) => {
				if (message.type === 'start') {
					console.log(message.data);
					//crawl(message.data), send to master
					process.send({
						type: 'finish',
						from: cluster.worker.id,
						data: []
					});
				} else if (message.type === 'kill') {
					cluster.worker.kill();
				}
			};
			process.on('message', masterMessageHandler);
			process.send({
				type: 'finish',
				from: cluster.worker.id,
				data: []
			});
		}
	},
  scheduleCrawlersSingle: (queue, cb) => {
    let url;
    while (queue.length > 0) {
      url = queue.shift();
      if (baseUrls[getBaseUrl(url)]) {
        cb(url);
      }
    }
  } };

