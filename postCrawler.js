const cheerio = require('./node_modules/cheerio');
const request = require('./node_modules/request');
const natural = require('./node_modules/natural');
const stopwords = require('./node_modules/stopwords').english;

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
      this.setTags();
      this.setAuthor();

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

    // Remove old links
    this.postInfo.links = [];

    this.$('#content, #main, .post, .entry').find('a').each((i, elem) => {
      href = this.$(elem).attr('href');
      if (!redirectRegEx.test(href)) {
        this.postInfo.links.push(href);
      }
    });
  }

  getTags() {
    return this.postInfo.tags;
  }

  setTags() {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    const anchors = this.$('a[rel=tag]');
    let tag;
    let p;

    // Remove old tags
    this.postInfo.tags = [];

    // Look for tag anchors
    if (anchors.length > 0) {
      anchors.each((i, elem) => {
        tag = this.$(elem).text();
        if (this.postInfo.tags.indexOf(tag) === -1) {
          this.postInfo.tags.push(tag);
        }
      });
    // Natural Language Process to assign tags
    } else {
      this.$('#content, #main, .post, .entry').find('p').each((i, elem) => {
        p = this.$(elem).text();
        // tf-idf score
        tfidf.addDocument(p);
      });

      tfidf.listTerms(0).slice(0, 5).forEach((item) => {
        // Exclude stopwords
        if (stopwords.indexOf(item.term.toLowerCase()) === -1) {
          this.postInfo.tags.push(item.term);
        }
      });
    }
  }

  getAuthor() {
    return this.postInfo.author;
  }

  setAuthor() {
    // Remove newline characters and tabs
    const author = this.$('.author').text().replace(/\r?\n|\r|\t/g, '');
    const urlRegEx = /^(http(s)?(:\/\/))?(www\.)?([a-zA-Z0-9-_\.]+)/gi;

    // Check for author tag
    if (author.length > 0) {
      this.postInfo.author =
        author.split(' ').filter(word => word.toLowerCase() !== 'by');
    // Use the domain name for the author
    } else {
      this.postInfo.author = urlRegEx.exec(this.postInfo.url)[5];
    }
  }
}

module.exports = PostCrawler;
