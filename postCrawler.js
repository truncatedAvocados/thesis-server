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
      date: null,
      desc: null,
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
      this.setDate();
      this.setDesc();

      cb(null, this.postInfo);
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
    const punctRegEx = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
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

      tfidf.listTerms(0)
        // Exclude stop words
        .filter(item => stopwords.indexOf(item.term.toLowerCase()) === -1)
        // Take the top 3 tags
        .slice(0, 3)
        .forEach(item => this.postInfo.tags.push(item.term));
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
        author.split(' ').filter(word => word.toLowerCase() !== 'by').join(' ');
    // Use the domain name for the author
    } else {
      this.postInfo.author = urlRegEx.exec(this.postInfo.url)[5];
    }
  }

  getDate() {
    return this.postInfo.date;
  }

  setDate() {
    const dateString =
      this.$('.date, .datetime, .post-date, .date-time, time').text();
    this.postInfo.date = new Date(dateString);
  }

  getDesc() {
    return this.postInfo.desc;
  }

  setDesc() {
    const p =
      this.$('#content, #main, .post, .entry')
        .find('p')
        .first()
        .text()
        // Remove newline characters and tabs
        .replace(/\r?\n|\r|\t/g, '')
        .trim();
    this.postInfo.desc = p.slice(0, 97).concat('...');
  }
}

module.exports = PostCrawler;
