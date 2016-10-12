const cheerio = require('cheerio');
const request = require('request');
const natural = require('natural');
const stopwords = require('stopwords').english;
const baseUrls = require('./baseUrls.json');
const postUtils = require('./workerUtils/postUtils');
const retext = require('retext');
const nlcstToString = require('nlcst-to-string');
const keywords = require('retext-keywords');
var wl = require('./workerUtils/wlUtils.js');

// ~~~~~~~ Interactive stuff
const prompt = require('prompt');
const colors = require('colors/safe');
prompt.message = colors.underline.green('BlogRank');
prompt.delimiter = colors.green(' <-=-=-=-=-=-> ');

const baseUrlGetter = (url) => {
  const regex = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(‌​?:.*))?');
  return regex.exec(url)[4] ? null : regex.exec(url)[2];
};

const siteMapGetter = (url) => {
  return undefined;
};

const badTitles = [
  '',
  ' ',
  '2011-01',
  'Page not found · GitHub Pages'
];

class PostCrawler {

  constructor(options) {
    this.url = options.url;
    this.parent = options.parent;
    this.$ = null;
    this.interactive = options.interactive;
    this.baseUrls = options.baseUrls;
    this.baseUrl = null;

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
        this.setBaseUrl();

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

  setBaseUrl() {
    this.baseUrl = this.getBaseUrl(this.url);
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

    //maia-main is for blogger.com
    this.$('#maia-main, #content, #main, .post, .entry, .content').find('a').each((i, elem) => {
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
            // This line is the difference between interactive / not
            //It's saying don't add a link to the Q unless its baseUrl is in
            //the accepted baseUrls
            this.baseUrls[this.getBaseUrl(href)] &&
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
    } else if (authorTag.length > 0 && authorTag.length < 50) {
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
      this.$('body, #content, #main, .post, .entry, .content')
        .find('p')
        // .first()
        .map(function(i, el) {
          return cheerio(this).text();
        })
        .get()
        .filter(text => text.match(/[\S]/))
        .join(' | ')
        // Remove newline characters and tabs
        .replace(/\r?\n|\r|\t/g, '')
        .trim();
    this.postInfo.desc = p.slice(0, 200).concat('...');
  }
}

exports.PostCrawler = PostCrawler;

const addEdge = function(cb, options) {
  const crawler = new PostCrawler(options);
  crawler.get((errGet, postInfo) => {
    if (errGet) {
      console.log(errGet);
      cb([]);
    } else {


      if (postInfo.desc !== '...' && badTitles.indexOf(postInfo.title) < 0) {
        postUtils.createOneWithEdge(postInfo, crawler.parent, (errEdge, found) => {
          if (errEdge) {
            cb(postInfo.links);
            console.log(errEdge);
          } else {
            cb(postInfo.links);
            console.log('STORED: ', found.dataValues.url);
          }
        });
      } else {
        cb([]);
      }
    }
  });
};

exports.crawlUrl = (options, opt, cb) => {
  console.log('CRAWLING: ', options.url);
  if (opt) {
    options.interactive = opt.interactive;
    options.baseUrls = opt.baseUrls;
  }

  if (!options.url) {
    cb([]);
  } else if (options.parent && options.interactive) {

    var properties = [
      {
        message: 'Add this url? ' + options.url,
        name: 'decision', 
        validator: /^[y|n|e|a]+$/,
        warning: colors.red('Choose yes, no, exit interactive mode, or add to badUrls (y,n,e,a)')
      }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
      if (err) { 
        console.log(err);
        return 1;
      }
      if (result.decision === 'y') {

        var base = baseUrlGetter(options.url);

        var baseObj = {
          url: base,
          base: true
        };

        var siteMap = siteMapGetter(options.url);

        var wlObj = {
          url: options.url
        };

        if (siteMap) {
          wlObj.siteMap = siteMap;
        }

        //Add to the in-memory objext of baseUrls now too 
        //so the interactive crawler will keep working
        opt.baseUrls[base] = true;

        wl.addOne(baseObj, (err, saved) => {
          console.log('ADDED TO BASE_URLS: ', saved.dataValues.url);
          wl.addOne(wlObj, (err, saved) => { 
            console.log('ADDED TO WHITELIST: ', saved.dataValues.url);
            //Finally, add the post to the DB
            addEdge(cb, options);            
          });
        });

      } else if (result.decision === 'n') {
        console.log(colors.red('Not adding it'));
        cb([]);
        return 1;
      } else if (result.decision === 'a') {

        var bad = baseUrlGetter(options.url);
        var badObj = {
          url: bad,
          bad: true
        };

        opt.badUrls[bad] = true;
        wl.addOne(badObj, (err, saved) => {
          console.log('ADDED TO BAD_URLS: ', saved.dataValues.url);
          cb([]);
        });

      } else {
        console.log(colors.rainbow('EXITING INTERACTIVE MODE'));
        
        //add to in-memory object so the interaction stops
        opt.interactive = false;
        cb([]);
      }
    });

  //Not interactive yet
  } else {  
    addEdge(cb, options);
  }
};

