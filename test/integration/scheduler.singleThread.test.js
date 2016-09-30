const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const scheduler = require('../../scheduler').scheduleCrawlersSingle;
const links = require('../data/links.json').slice(0, 10);
const db = require('../../workerUtils/postUtils');

describe('Single Thread Scheduler with PostCrawler Integration Tests', () => {
  let crawler;
  let url;

  scheduler(links, (link) => {
    url = link.url;

    describe('Testing ' + url, () => {
      let post;
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

      it('Find or create post to database', () => {
        db.findOrCreateOne(post, (err, entry) => {
          if (err) {
            assert.ok(false);
          } else if (entry === undefined) {
            assert.ok(false);
          } else {
            assert.ok(true);
          }
        });
      });
    });
  });
});

