const cheerio = require('cheerio');
const request = require('request');
const natural = require('natural');
const stopwords = require('stopwords').english;
const baseUrls = require('./baseUrls.json');
const postUtils = require('./workerUtils/postUtils');
const retext = require('retext');
const nlcstToString = require('nlcst-to-string');
const keywords = require('retext-keywords');

// ~~~~~~~ Interactive stuff
const prompt = require('prompt');
const colors = require('colors/safe');
prompt.message = colors.underline.green('BlogRank');
prompt.delimiter = colors.green(' <-=-=-=-=-=-> ');

class PostCrawler {

  constructor(options) {
    this.url = options.url;
    this.parent = options.parent;
    this.$ = null;
    this.interactive = options.interactive;

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
      } else {
        this.$ = cheerio.load(body);
        this.setTitle();
        this.setLinks();
        this.setTags();
        this.setAuthor();
        this.setDate();
        this.setDesc();

        cb(null, this.postInfo);
      }
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

  getBaseUrl(url) {
    const regex = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?');
    return regex.exec(url)[4] ? null : regex.exec(url)[2];
  }

  setLinks() {
    // Remove redirects
    const redirectRegEx = /^\//;
    let href;
    const urls = {};

    // Remove old links
    this.postInfo.links = [];

    this.$('#content, #main, .post, .entry, .content').find('a').each((i, elem) => {
      href = this.$(elem).attr('href');
      
      //if we're in interactive mode we don't want to check against the
      //baseUrls list anymore
      if (this.interactive) {
        if (!redirectRegEx.test(href) &&
            !urls[href] &&
            this.getBaseUrl(href) !== this.getBaseUrl(this.url)) {
          urls[href] = true;
          this.postInfo.links.push({
            parent: this.url,
            url: href });
        }
      } else {
        //The normal way when we aren't in interactive mode
        if (!redirectRegEx.test(href) &&
            baseUrls[this.getBaseUrl(href)] &&
            !urls[href] &&
            this.getBaseUrl(href) !== this.getBaseUrl(this.url)) {
          urls[href] = true;
          this.postInfo.links.push({
            parent: this.url,
            url: href });
        }
      }
    });
  }

  getTags() {
    return this.postInfo.tags;
  }

  setTags() {
    const anchors = this.$('a[rel=tag]');
    const punctRegEx = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
    const tokenizer = new natural.WordTokenizer();
    let tags;
    let p;
    let body = '';

    // Remove old tags
    this.postInfo.tags = [];

    // Look for tag anchors
    if (anchors.length > 0) {
      anchors.each((i, elem) => {
        tags = this.$(elem).text().split(' ');
        this.postInfo.tags = this.postInfo.tags.concat(tags);
      });
    // Natural Language Process to assign tags
    } else {
      this.$('#content, #main, .post, .entry, .content').find('p').each((i, elem) => {
        // Concat paragraphs together
        p = this.$(elem).text();
        body = body.concat('\n\n', p);
      });

      // Tokenize post text
      body = tokenizer.tokenize(body)
        .map(word => word.toLowerCase())
        // Remove stopwords
        .filter(word => stopwords.indexOf(word) === -1);

      // Find keywords
      retext().use(keywords).process(body.join(' '), (err, file) => {
        file.data.keywords
          .map(word => nlcstToString(word.matches[0].node).toLowerCase())
          .forEach(word => this.postInfo.tags.push(word));
      });
    }
  }

  getAuthor() {
    return this.postInfo.author;
  }

  setAuthor() {
    // Remove newline characters and tabs
    const authorTag = this.$('.author').first().text().trim();
    const authorRel = this.$('a[rel=author]').first().text().trim();
    const urlRegEx = /^(http(s)?(:\/\/))?(www\.)?([a-zA-Z0-9-_\.]+)/gi;
    let author;

    // Check for author rel
    if (authorRel.length > 0) {
      author = authorRel;
    // Check for author tag
    } else if (authorTag.length > 0) {
      author = authorTag;
    }

    // Use the domain name for the author
    if (author === undefined) {
      this.postInfo.author = urlRegEx.exec(this.postInfo.url)[5];
    } else {
      this.postInfo.author =
        author
          .split(' ')
          .filter(word => word.toLowerCase() !== 'by')
          .join(' ')
          .trim();
    }
  }

  getDate() {
    return this.postInfo.date;
  }

  setDate() {
    const dateString =
      Date.parse(this.$('.date, .datetime, .post-date, .date-time, time').text());
    this.postInfo.date = isNaN(dateString) ? undefined : new Date(dateString);
  }

  getDesc() {
    return this.postInfo.desc;
  }

  setDesc() {
    const p =
      this.$('#content, #main, .post, .entry, .content')
        .find('p')
        // .first()
        .map(function(i, el) {
          return cheerio(this).text();
        })
        .get()
        .join(' | ')
        // Remove newline characters and tabs
        .replace(/\r?\n|\r|\t/g, '')
        .trim();
    this.postInfo.desc = p.slice(0, 200).concat('...');
  }
}

exports.PostCrawler = PostCrawler;

const addEdge = function() {
  const crawler = new PostCrawler(options);
  crawler.get((errGet, postInfo) => {
    if (errGet) {
      console.log(errGet);
      cb([]);
    } else {

      cb(postInfo.links);

      postUtils.createOneWithEdge(postInfo, crawler.parent, (errEdge, found) => {
        if (errEdge) {
          console.log(errEdge);
        } else {
          console.log('STORED: ', found.dataValues.url);
        }
      });
    }
  });
};

exports.crawlUrl = (options, opt, cb) => {
  console.log('CRAWLING: ', options.url);
  if (opt) {
    options.interactive = opt.interactive;
  }

  if (options.parent && options.interactive) {

    var properties = [
      {
        message: 'Url: ' + options.url,
        name: 'decision', 
        validator: /^[y|n]+$/,
        warning: colors.red('Just say yes or no man (y,n)')
      }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
      if (err) { 
        console.log(err);
        return 1;
      }
      if (result.decision === 'y') {
        //Add it to the whitelist and Q
        const crawler = new PostCrawler(options);
        crawler.get((errGet, postInfo) => {
          if (errGet) {
            console.log(errGet);
            cb([]);
          } else {

            cb(postInfo.links);

            postUtils.createOneWithEdge(postInfo, crawler.parent, (errEdge, found) => {
              if (errEdge) {
                console.log(errEdge);
              } else {
                console.log('STORED: ', found.dataValues.url);
              }
            });
          }
        });
      } else {
        console.log(colors.magenta('Not adding it'));
        cb([]);
        return 1;
      }
    });

  //Not interactive yet
  } else {  
    const crawler = new PostCrawler(options);
    crawler.get((errGet, postInfo) => {
      if (errGet) {
        console.log(errGet);
        cb([]);
      } else {

        cb(postInfo.links);

        postUtils.createOneWithEdge(postInfo, crawler.parent, (errEdge, found) => {
          if (errEdge) {
            console.log(errEdge);
          } else {
            console.log('STORED: ', found.dataValues.url);
          }
        });
      }
    });
  }

};

