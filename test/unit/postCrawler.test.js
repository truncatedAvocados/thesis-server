const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const links = require('../data/links');

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

      xit('Create PostCrawler instance', () => {
        if (crawler.html() === null) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      xit('Get post title', () => {
        if (crawler.getTitle().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      xit('Get post links', () => {
        if (crawler.getLinks().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      xit('Get post tags', () => {
        if (crawler.getTags().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      xit('Get post author', () => {
        if (crawler.getAuthor().length === 0) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      it('Get post date', () => {
        const date = crawler.getDate();
        if (date === null && date !== 'Invalid Date') {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });


    });
  });
});
