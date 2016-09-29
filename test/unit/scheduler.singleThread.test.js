const assert = require('assert');
const scheduler = require('../../scheduler').scheduleCrawlersSingle;
const links = require('../data/links').slice(0, 10);

describe('Single Thread Scheduler Tests', () => {
  describe('Check methods exist', () => {
    it('Check scheduler property scheduleCrawlersSingle exists' , () => {
      if (scheduler === undefined) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });

    it('Check scheduler property scheduleCrawlersSingle is a function', () => {
      if(typeof scheduler !== 'function') {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
    });
  });
});

