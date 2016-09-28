var cheerio = require('cheerio');
var request = require('request');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var getAndCheckUrl = (anchor, baseUrl) => {
	var regex = /http\w*\:\/\/(www\.)?/i;

	if (anchor.attribs) {
		var blogPostUrl = anchor.attribs.href;
		if (blogPostUrl) {
			if (blogPostUrl[0] === '/') {
				blogPostUrl = baseUrl + blogPostUrl;
			}								
			var regBlogUrl = blogPostUrl.replace(regex, '');
			var regUrl = baseUrl.replace(regex, ''); 
			if (regBlogUrl.slice(0, regUrl.length) === regUrl) {
				return blogPostUrl;
			} else {
				return null;
			}
		}
	}
};

module.exports = {
	getPostsMulti: (urlList, callback) => {
		if (!urlList || urlList.length === 0) {
			callback([]);
		} else {
			if (cluster.isMaster) {
				var result = [];
				var workers = numCPUs;
				var messageHandler = (message) => {
					if (message.type === 'finish') {
						workers--;
						result = result.concat(message.data);
						if (workers === 0) {
							cluster.disconnect(() => {
								callback(result);
							})
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

				var addPosts = (count) => {
					var frontPageUrl = urlList[count];
					request(frontPageUrl, (err, res, html) => {
						if (err) {
							console.log(err);
						} else {
							var $ = cheerio.load(html);
							filters.forEach((filter) => {
								$(filter).empty();
							});
							var anchors = $('a');
							for (var key in anchors) {
								var blogPostUrl = getAndCheckUrl(anchors[key], frontPageUrl);
								if (blogPostUrl && !added[blogPostUrl]) {
									added[blogPostUrl] = true;
									result.push(blogPostUrl);
								}
							}
						}
						if (urlList[count + numCPUs]) {
							count += numCPUs;
							addPosts(count);
						} else {
							process.send({
								type: 'finish',
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
	},
	getPosts: (urlList, callback) => {
		if (!urlList || urlList.length === 0) {
			callback([]);
		} else {
			var result = [];			
			var added = {};
			var filters = ['header', 'footer', 'aside', 'nav', '.nav', '.navbar'];

			var addPosts = (count) => {
				var frontPageUrl = urlList[count];
				request(frontPageUrl, (err, res, html) => {
					if (err) {
						console.log(err);
					} else {
						var $ = cheerio.load(html);
						filters.forEach((filter) => {
							$(filter).empty();
						});
						var anchors = $('a');
						for (var key in anchors) {
							var blogPostUrl = getAndCheckUrl(anchors[key], frontPageUrl);
							if (blogPostUrl && !added[blogPostUrl]) {
								added[blogPostUrl] = true;
								result.push(blogPostUrl);
							}
						}
					}
					if (urlList[count + 1]) {
						count ++;
						addPosts(count);
					} else {
						callback(result);
					}
				});
			};
			addPosts(0);
		}
	}
};

