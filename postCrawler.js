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
      this.setTitle();
      this.setLinks();

      cb(null, this.$);
    });
  }

  html() {
    if (this.$ === null) {
      return null;
    }
    return this.$.html();
  }

  getTitle() {
    return this.postInfo.title;
  }

  setTitle() {
    this.postInfo.title = this.$('head > title').text();
  }

  getLinks() {
    return this.postInfo.links;
  }

  setLinks() {
    // Remove redirects
    const redirectRegEx = /^\//;
    let href;

    this.$('#content, #main, .post, .entry').find('a').each((i, elem) => {
      href = this.$(elem).attr('href');
      if (!redirectRegEx.test(href)) {
        this.postInfo.links.push(href);
      }
    });
  }
}

module.exports = PostCrawler;
