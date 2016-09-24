var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var whitelist = require('./whitelist.json');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

module.exports = {
	getNewBlogPosts: (urlList, callback) => {
		if (cluster.isMaster) {
			var result = [];
			var workers = numCPUs;
			var messageHandler = (message) => {
				if (message.type === 'finish') {
					workers--;
					result = result.concat(message.data);
					if (workers === 0) {
						callback(result);
					}
				}
			};
			for (var i = 0; i < workers; i++) {
				cluster.fork().on('message', messageHandler);
			}
		} else {
			var result = [];			
			var added = {};
			var filters = ['header', 'footer', 'aside', 'nav', '.nav', '.navbar'];
			var regex = /http\w*\:\/\/(www\.)?/i;

			var addPosts = (count) => {
				var frontPageUrl = urlList[count];
				request(frontPageUrl, (err, res, html) => {
					if (err) {
						console.log(err);
					} else {
						var regUrl = frontPageUrl.replace(regex, '');
						var $ = cheerio.load(html);
						filters.forEach((filter) => {
							$(filter).empty();
						});
						var anchors = $('a');
						for (var key in anchors) {
							if (anchors[key].attribs) {
								var blogPostUrl = anchors[key].attribs.href;
								if (blogPostUrl) {
									if (blogPostUrl[0] === '/') {
										blogPostUrl = frontPageUrl + blogPostUrl;
									}
									if (!added[blogPostUrl]) {								
										var regBlogUrl = blogPostUrl.replace(regex, '');
										if (regBlogUrl.slice(0, regUrl.length) === regUrl) {
											added[blogPostUrl] = true;
											result.push(blogPostUrl);
										}
									}
								}
							}
						}
					}

					if (urlList[count + numCPUs]) {
						count += numCPUs;
						addPosts(count);
					} else {
						process.send({
							type: 'finish',
							from: cluster.worker.id,
							data: result
						});
						cluster.worker.kill();
					}
				});
			};

			var id = cluster.worker.id - 1;

			if (urlList[id]) {
				addPosts(id);
			} else {
				numCPUs--;
				cluster.worker.kill();
			}
		}
	}
};


