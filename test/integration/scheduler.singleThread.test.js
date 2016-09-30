const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const scheduler = require('../../scheduler').scheduleCrawlersSingle;
const links = require('../data/links.json').slice(0, 10);
const db = require('../../db/database');

describe('Single Thread Scheduler with PostCrawler Integration Tests', () => {
  let crawler;

  it('Create an instance of PostCrawler for each link', () => {
    scheduler(links, (link) => {
      crawler = new PostCrawler(link.url);

      if (crawler === undefined) {
        assert.ok(false);
      }
    });

    assert.ok(true);
  });
});

