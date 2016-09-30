var expect = require('chai').expect;
var postUtils = require('../../workerUtils/postUtils.js');
var frontPageCrawler = require('../../frontPageCrawler');

describe('frontPageCrawler', () => {
	describe('filterPosts', () => {
		it('should filter out urls already in the database', (done) => {
			var fakePost = {
			  url: 'http://www.google.com',
			  title: 'This is Gooooogle',
			  keys: ['search', 'ultimate', 'coding', 'prowess'],
			  description: 'These guys are pretty awesome, and smart and funny, probably',
			  author: 'Mr. Bean'
			};
			postUtils.findOrCreateOne(fakePost, (err, succ) => {
				var urlList = ['http://www.google.com', 'http://www.elgoog.com'];
				frontPageCrawler.filterPosts(urlList, (result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
		});
	});
});
