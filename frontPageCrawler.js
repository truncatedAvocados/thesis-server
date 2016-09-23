var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');


var getNewBlogPosts = (urlList, callback) => {
	var queue = [];

	var addPosts = (count) => {
		request(urlList[count], (err, res, html) => {
			if (err) {
				throw err;
			} else {
				var $ = cheerio.load(html);
				var anchors = $('a');
				for (var key in anchors) {
					if (anchors[key].attribs) {
						if (anchors[key].attribs.href) {
							queue.push(anchors[key].attribs.href);
						}
					}
				}
				if (urlList[count + 1]) {
					addPosts(count + 1);
				} else {
					callback(queue.length);
				}
			}
		});
	};

	addPosts(0);
};

getNewBlogPosts(['https://tech.instacart.com/'], console.log);
//'https://infrequently.org/'