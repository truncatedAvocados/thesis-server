var frontPageCrawler = require('./frontPageCrawler.js');
var whitelist = require('./whitelist.json');
var fs = require('fs');
var numCPUs = require('os').cpus().length;
var cluster = require('cluster');

var scheduleCrawlers = (queue) => {
	if (cluster.isMaster) {
		for (var i = 0; i < numCPUs; i++) {
			console.log('Forking: ', i);
			cluster.fork();
		}
	} else {
		while (queue.length > 0) {
			var url = queue.shift();
			console.log(queue.length);
			console.log(url);
			frontPageCrawler.getNewBlogPosts([url], (result) => {
				queue = queue.concat(result);
			});
		}
		cluster.worker.kill();
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

var whiteListKeys = Object.keys(whitelist).slice(0, 1);
frontPageCrawler.getNewBlogPosts(whiteListKeys, scheduleCrawlers);