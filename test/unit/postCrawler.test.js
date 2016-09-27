const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const links = require('../data/links').slice(100, 120);

describe('PostCrawler Tests', () => {
  let crawler;
  let url;
  links.forEach((link) => {
    url = link.url;

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

      it('Get post links', () => {
        if (crawler.getLinks().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      it('Get post tags', () => {
        if (crawler.getTags().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });
    });
  });
});
