const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const links = require('../data/links').slice(100, 110);

describe('PostCrawler Tests', () => {
  let crawler;
  let url;

  describe('Check class methods exist', () => {
    it('Check get method', () => {
      if (crawler.get === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check html method', () => {
      if (crawler.html === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check get method', () => {
      if (crawler.get === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check getTitle method', () => {
      if (crawler.getTitle === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check setTitle method', () => {
      if (crawler.setTitle === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check getTags method', () => {
      if (crawler.getTags === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check setTags method', () => {
      if (crawler.setTags === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check getAuthor method', () => {
      if (crawler.getAuthor === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check setAuthor method', () => {
      if (crawler.setAuthor === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check getDate method', () => {
      if (crawler.getDate === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check setDate method', () => {
      if (crawler.setDate === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check getDesc method', () => {
      if (crawler.getDesc === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check setDesc method', () => {
      if (crawler.setDesc === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });
  });

  describe('Test methods', () => {
    links.forEach((link) => {
      url = link.url;

      describe('Testing ' + url, () => {
        crawler = new PostCrawler(url);

        beforeEach((done) => {
          crawler.get((err, post) => {
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

        it('Get post author', () => {
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

        it('Get post description', () => {
          const desc = crawler.getDesc();
          if (desc === null || desc.length === 0) {
            assert.ok(false);
          } else {
            assert.ok(true);
          }
        });
      });
    });
  });
});
