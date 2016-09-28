var numCPUs = require('os').cpus().length;
var cluster = require('cluster');
var baseUrls = require('./baseUrls.json');

var getBaseUrl = (url) => {
	var regex = new RegExp("^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?");
	return regex.exec(url)[2];
};

module.exports = {
	scheduleCrawlers: (queue) => {
		if (cluster.isMaster) {
			var workers = numCPUs;
			for (var i = 0; i < workers; i++) {
				cluster.fork();
			}
		} else {
			var startLength = queue.length;
			var traverseArray = (count) => {
				if (baseUrls[getBaseUrl(queue[count])]) {
					console.log(queue[count]);
				}
				var next = count + numCPUs >= startLength ? count + 1 : count + numCPUs;
				if (queue[next]) {
					traverseArray(next);
				} else {
					cluster.worker.kill();
				}
			};
			var id = cluster.worker.id - 1;
			traverseArray(id);
		}
	},
	scheduleCrawlersSingle: (queue) => {
		while (queue.length > 0) {
			var url = queue.shift();
			if (baseUrls[getBaseUrl(url)]) {
				//crawl not yet defined
				crawl(queue.shift(), (result) => {
					queue.concat(result);
				});
			}
		}
	}
};







