const cheerio = require('./node_modules/cheerio');
const request = require('./node_modules/request');

class PostCrawler {

  constructor(url) {
    this.url = url;
    this.$ = null;

    this.postInfo = {
      author: null,
      title: null,
      url: this.url,
      tags: [],
      links: [] };
  }

  get(cb) {
    request(this.url, (err, response, body) => {
      if (err) {
        cb(err, null);
        return;
      }

      this.$ = cheerio.load(body);
      cb(null, this.$);
    });
  }

  html() {
    if (this.$ === null) {
      return null;
    }
    return this.$.html();
  }
}

module.exports = PostCrawler;
