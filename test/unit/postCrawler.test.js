const assert = require('assert');
const PostCrawler = require('../../postCrawler');

describe('PostCrawler Tests', () => {
  const urls = [
    'http://blog.edankwan.com/post/three-js-advanced-tips-shadow',
    'https://engineering.groupon.com/2016/open-source/codeburner-security-focused-static-code-analysis-for-everyone/'];
  let crawler;

  urls.forEach((url) => {
    describe('Testing ' + url, () => {
      crawler = new PostCrawler(url);

      beforeEach((done) => {
        crawler.get((err, $) => {
          done();
        });
      });

      it('Create PostCrawler instance', () => {
        if (crawler.html() === null) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      it('Get post title', () => {
        if (crawler.getTitle().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });
      
      });
  });
});
