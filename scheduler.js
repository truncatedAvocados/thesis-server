var frontPageCrawler = require('./frontPageCrawler.js');
var whitelist = require('./whitelist.json');
var fs = require('fs');
var numCPUs = require('os').cpus().length;
var cluster = require('cluster');

var scheduleCrawlers = (queue) => {
	//console.log(queue);
	if (cluster.isMaster) {
		var result = [];
		console.log(cluster.workers);
		console.log(queue.length);
		var workers = numCPUs;
		var messageHandler = (message) => {
			if (message.type === 'finish') {
				workers--;
			}
		};
		for (var i = 0; i < workers; i++) {
			console.log('Forking: ' + i);
			var worker = cluster.fork();
		}
	} else {
		var startLength = queue.length;
		var traverseArray = (count) => {
			console.log(cluster.worker.id + ': ' + queue[count]);
			var counter = count + numCPUs >= startLength ? count + 1 : count + numCPUs;
			if (queue[counter]) {
				traverseArray(counter);
			} else {
				cluster.worker.kill();
			}
		};
		var id = cluster.worker.id - 1;
		console.log('Id: ', id);
		traverseArray(id);
	}
};


var resToJSON = (array) => {
	var toWrite = {};
	for (var i = 0; i < array.length; i++) {
		toWrite[array[i]] = true;
	}
	fs.writeFile('output.json', JSON.stringify(toWrite), (err) => {
		if (err) {
			console.log(err);
		}
	});
};

var whiteListKeys = Object.keys(whitelist).slice(0, 10);
var startTime = new Date().getTime();
frontPageCrawler.getNewBlogPostsSingleThread(whiteListKeys, scheduleCrawlers);
//frontPageCrawler.getNewBlogPosts(whiteListKeys, scheduleCrawlers);
frontPageCrawler.getNewBlogPosts(whiteListKeys, (result) => {
	console.log(new Date().getTime() - startTime);
	console.log(result.length);
});

