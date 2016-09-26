var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var whitelist = require('./whitelist.json');


module.exports = {
	getNewBlogPosts: (urlList, callback) => {
		var result = [];
		var added = {};
		var filters = ['header', 'footer', 'aside', 'nav', '.nav', '.navbar'];
		var startTime = new Date().getTime();
		var resultCount = 0;
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
				// console.log('New Links: ', result.length - resultCount);
				// console.log('Total Links: ', result.length);
				// console.log('Time: ', new Date().getTime() - startTime);
				// console.log('URL: ', frontPageUrl);
				// resultCount = result.length;
				if (urlList[count + 1]) {
					addPosts(count + 1);
				} else {
					callback(result);
				}
			});
		};
		addPosts(0);
	}
};
