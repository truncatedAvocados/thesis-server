var frontPageCrawler = require('./frontPageCrawler.js');
var whitelist = require('./whitelist.json');
var fs = require('fs');
var numCPUs = require('os').cpus().length;
var cluster = require('cluster');
var baseUrls = require('./baseUrls.json');

var getBaseUrl = (url) => {
	var regex = new RegExp("^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?");
	return regex.exec(url)[2];
};

var scheduleCrawlers = (queue) => {
	if (cluster.isMaster) {
		var workers = numCPUs;
		var messageHandler = (message) => {
			if (message.type === 'finish') {
				workers--;
			}
		};
		for (var i = 0; i < workers; i++) {
			var worker = cluster.fork();
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
};

// var scheduleCrawlersSingle = (queue) {
// 	while (queue.length > 0) {
// 		var url = queue.shift();
// 		//do some regex
// 		if (baseUrls[getBaseUrl(url)]) {
// 			crawl(queue.shift(), (result) => {
// 				queue.concat(result);
// 			});
// 		}
// 	}
// };


var resToJSON = (array) => {
	var toWrite = {};
	for (var i = 0; i < array.length; i++) {
		var baseUrl = getBaseUrl(array[i]);
		toWrite[baseUrl] = true;
	}
	fs.writeFile('baseUrls.json', JSON.stringify(toWrite), (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Success!');
		}
	});
};

var whiteListKeys = Object.keys(whitelist).slice(0,10);
var startTime = new Date().getTime();
frontPageCrawler.getNewBlogPostsSingleThread(whiteListKeys, scheduleCrawlers);
//frontPageCrawler.getNewBlogPosts(whiteListKeys, scheduleCrawlers);
// frontPageCrawler.getNewBlogPosts(whiteListKeys, (result) => {
// 	console.log(new Date().getTime() - startTime);
// 	console.log(result.length);
// });

