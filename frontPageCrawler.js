var cheerio = require('cheerio');
var request = require('request');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var postUtils = require('./workerUtils/postUtils.js');

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

var isValid = (url) => {
	var filters = ['/collections/', '/archives/', '/authors/', '/about/', '/search/', '/publication/', '/tags/'];
	var regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;

	if (!regex.exec(url) || filters.indexOf(regex.exec(url)[4]) > -1) {
		return false;
	}
	return true;
};	

module.exports = {
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
	},
	getPosts2: (urlList, callback) => {
		var result = [];			
		var added = {};
		var filters = ['header', 'footer', 'aside', 'nav', '.nav', '.navbar'];
		var count = 0;

		var addPosts = (url) => {
			request(url, (err, res, html) => {
				if (err) {
					console.log(err);
				} else {
					var $ = cheerio.load(html);
					filters.forEach((filter) => {
						$(filter).empty();
					});
					var anchors = $('a');
					for (var key in anchors) {
						var blogPostUrl = getAndCheckUrl(anchors[key], url);
						if (blogPostUrl && !added[blogPostUrl]) {
							added[blogPostUrl] = true;
							result.push(blogPostUrl);
						}
					}
				}
				count++;
				if (count === urlList.length) {
					callback(result);
				}
			});
		};
		urlList.forEach((url) => {
			addPosts(url);
		});
	},
	filterPosts: (urlList, callback) => {
		var result = [];
		var count = 0;
		urlList.forEach((url) => {
			postUtils.findUrl(url, (err, success) => {
				if (!success) {
					result.push({
						parent: null,
						url: url
					});
				}
				count++;
				if (count === urlList.length) {
					callback(result);
				}
			});	
		});
	},
	getDataMulti: (urlList, callback) => {
		if (cluster.isMaster) {
			var urlCount = -1;
			var result = {};
			var workers = numCPUs * 2;
			var childMessageHandler = (message) => {
				if (message.type == 'ready') {
					urlCount++;
					cluster.workers[message.from].send({
						type: 'start',
						from: 'master',
						url: urlList[urlCount]
					});
				} else if (message.type === 'finish') {
					urlCount++;
					result[message.url] = message.data;
					if (urlList[urlCount]) {
						cluster.workers[message.from].send({
							type: 'start',
							from: 'master',
							url: urlList[urlCount]
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
						callback(result);
					});
				}
			});
		} else {		
			var getUrlData = (url) => {
				var result = {};
				request(url, (err, res, html) => {
					if (err) {
						console.log(err);
					} else {
						var $ = cheerio.load(html);
						var elems = $('a');
						elems.each((i, elem) => {
							var elemClass = $(elem).attr('class');
							if (elemClass) {
								if (result[elemClass]) {
									result[elemClass]++;
								} else {
									result[elemClass] = 1;
								}
							}
						});
					}
					process.send({
						type: 'finish',
						from: cluster.worker.id,
						data: result,
						url: url
					});
				});
			};
			var masterMessageHandler = (message) => {
				if (message.type === 'start') {
					if (message.url) {
						getUrlData(message.url);
					} else {
						cluster.worker.kill();
					}
				} else if (message.type === 'kill') {
					cluster.worker.kill();
				}
			};
			process.on('message', masterMessageHandler);
			process.send({
				type: 'ready',
				from: cluster.worker.id,
			});
		}
	},
	getSiteMapsMulti: (urlList, callback) => {
		if (cluster.isMaster) {
			var urlCount = -1;
			var result = [];
			var sitemaps = [];
			var workers = numCPUs * 2 < urlList.length ? numCPUs * 2 : urlList.length;
			var childMessageHandler = (message) => {
				if (message.type == 'ready') {
					urlCount++;
					cluster.workers[message.from].send({
						type: 'start',
						from: 'master',
						url: urlList[urlCount]
					});
				} else if (message.type === 'finish') {
					urlCount++;
					if (message.siteMap) {
						sitemaps.push(message.siteMap);
					}
					result = result.concat(message.result);
					if (urlList[urlCount]) {
						cluster.workers[message.from].send({
							type: 'start',
							from: 'master',
							url: urlList[urlCount]
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
						callback(result, sitemaps);
					});
				}
			});
		} else {		
			var getSiteMap = (url) => {
				var result = [];
				var siteMapUrl = url[url.length - 1] === '/' ? url + 'sitemap.xml' : url + '/sitemap.xml';
				request(siteMapUrl, (err, res, xml) => {
					if (err) {
						console.log(err);
					} else {
						var hasSiteMap = false;
						var $ = cheerio.load(xml);
						var urls = $('url');
						urls.each((i, elem) => {
							hasSiteMap = true;
							if ($(elem).children('lastmod').length > 0) {
								var postUrl = $(elem).children('loc').text().trim();
								if (isValid(postUrl)) {
									console.log(postUrl);
									console.log($(elem).children('lastmod').text());
									result.push(postUrl);
								}
							}
						});
					}
					var siteMap;
					if (hasSiteMap) {
						siteMap = {
							url: url,
							siteMap: siteMapUrl
						}
					} else {
						siteMap = false;
					}
					process.send({
						type: 'finish',
						from: cluster.worker.id,
						result: result,
						siteMap: siteMap
					});
				});
			};
			var masterMessageHandler = (message) => {
				if (message.type === 'start') {
					if (message.url) {
						getSiteMap(message.url);
					} else {
						cluster.worker.kill();
					}
				} else if (message.type === 'kill') {
					cluster.worker.kill();
				}
			};
			process.on('message', masterMessageHandler);
			process.send({
				type: 'ready',
				from: cluster.worker.id,
			});
		}
	},
};

//things to filter out: collections, categories, archives, authors, homepage, about, robots.txt, search, publication, tags
//common blog post patterns: .../posts/, .../blog/, .../long-name