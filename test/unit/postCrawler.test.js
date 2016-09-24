const assert = require('assert');
const PostCrawler = require('../../postCrawler');

describe('PostCrawler Tests', () => {
  it('Create PostCrawler instance', () => {
    const url = 'http://blog.edankwan.com/post/three-js-advanced-tips-shadow';

    const crawler = new PostCrawler(url);

    crawler.get((err, $) => {
      if (crawler.html() === null) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });
  });
});
