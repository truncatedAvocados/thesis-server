const assert = require('assert');
const PostCrawler = require('../../postCrawler');

describe('PostCrawler Tests', () => {
  const url = 'http://blog.edankwan.com/post/three-js-advanced-tips-shadow';
  const crawler = new PostCrawler(url);

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
    if (crawler.getTitle().length > 0) {
      assert.ok(false);
    } else {
      assert.ok(true);
    }
  });
});
