const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const scheduler = require('../../scheduler').scheduleCrawlersSingle;
const links = require('../data/links.json').slice(0, 10);
//const db = require('../../db/database');

describe('Single Thread Scheduler with PostCrawler Integration Tests', () => {
  let crawler;
  let url;
  let post;

  scheduler(links, (link) => {
    url = link.url;

    describe('Testing ' + url, () => {
      crawler = new PostCrawler(url);

      before((done) => {
        crawler.get((err, blogPost) => {
          post = blogPost;
          done();
        });
      });

      it('Check crawler exists', () => {
        if (crawler === undefined) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });

      it('Has post information', () => {
        if (post === null) {
          assert.ok(false);
        } else {
          assert.ok(true);
        }
      });
    });
  });
});

