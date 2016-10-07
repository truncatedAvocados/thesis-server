var expect = require('chai').expect;
var postUtil = require('../../crawlerService/workerUtils/postUtils.js');
var wlUtil = require('../../crawlerService/workerUtils/wlUtils.js');
var Promise = require('bluebird');


describe('Utilities', function() {

  beforeEach(function() {
    //create dummy data

  });

  describe('Post Utilities', function() {

    it('should have a bunch of different methods', function() {
      var modules = [
        'findOrCreateOne',
        'createOneWithEdge',
        'findUrl'
      ];
      modules.forEach(function(module) {
        expect(postUtil[module]).to.exist;
        expect(postUtil[module]).to.be.a.function;    
      });

    });

    it('should be able to create a post or find an existing one', function(done) {
      var fakePost = {
        url: 'http://www.google.com',
        title: 'This is Gooooogle',
        tags: ['search', 'ultimate', 'coding', 'prowess'],
        desc: 'These guys are pretty awesome, and smart and funny, probably',
        author: 'Mr. Bean'
      };
      postUtil.findOrCreateOne(fakePost, function(err, succ) {
        //console.log(err, succ);
        expect(err).to.equal(null);
        expect(succ.dataValues.title).to.equal(fakePost.title);
        expect(succ.oldTags).to.deep.equal(fakePost.tags);
        done();
      });
    });

    it('should be able to find a url', function(done) {
      var url = 'http://www.google.com';
      postUtil.findUrl(url, function(err, succ) {
        expect(succ.dataValues.url).to.equal(url);
        done();
      });
    });
    it('should return a falsy value if url not found', function(done) {
      var url = 'NOT_A_URL';
      postUtil.findUrl(url, function(err, succ) {
        expect(succ).to.be.falsy;
        done();
      });
    });

    it('should be able to create a new post with an edge', function(done) {

      var parentUrl = 'http://www.google.com';
      var newEdgePost = {
        url: 'http://www.blogger1.com/post80',
        title: 'Working with Google Analytics',
        tags: ['google', 'analytics', 'coding'],
        desc: 'How to make the most of this powerful tool',
        author: 'Dood Man'
      };

      postUtil.createOneWithEdge(newEdgePost, parentUrl, function(err, postToAddEdge, parent) {
        expect(err).to.equal(null);
        expect(parent).to.not.equal(null);
        expect(postToAddEdge).to.not.equal(null);

        expect(postToAddEdge.inLinks).to.contain(parent.postId);
        done();
      });
    });

    it('should not add extraneous edges', function(done) {

      var parentUrl = 'http://www.google.com';
      var sameEdgePost = {
        url: 'http://www.blogger1.com/post80',
        title: 'Working with Google Analytics',
        tags: ['google', 'analytics', 'coding'],
        desc: 'How to make the most of this powerful tool',
        author: 'Dood Man'
      };

      postUtil.createOneWithEdge(sameEdgePost, parentUrl, function(err, postToAddEdge, parent) {
        expect(err).to.equal(null);
        expect(parent).to.not.equal(null);
        expect(postToAddEdge).to.not.equal(null);
        expect(postToAddEdge.inLinks.filter(entry => entry === parent.postId)).to.have.length(1);
        done();
      });


    });

    it('should be able to find an existing post and add an edge', function(done) {

      var parentPost = {
        url: 'http://www.blogger4.com/post2',
        title: 'Google Analytics - sehr schon',
        tags: ['google', 'analytics', 'deutsch'],
        desc: 'Ich brauchte suchen uber das Google search',
        author: 'Klaus Jurgenausfallen'
      };

      var sameEdgePost = {
        url: 'http://www.blogger1.com/post80',
        title: 'Working with Google Analytics',
        tags: ['google', 'analytics', 'coding'],
        desc: 'How to make the most of this powerful tool',
        author: 'Dood Man'
      };

      postUtil.findOrCreateOne(parentPost, function(err, parent) {
        postUtil.createOneWithEdge(sameEdgePost, parent.url, function(err, postToAddEdge, parent) {
          expect(err).to.equal(null);
          expect(parent).to.not.equal(null);
          expect(postToAddEdge).to.not.equal(null);

          expect(postToAddEdge.inLinks).to.contain(parent.postId);
          done();
        });
        
      });
    });

    it('should add more edges in Web Crawler BFS manner', function(done) {

      var parentUrl = 'http://www.blogger4.com/post2';
      var newEdgePost = {
        url: 'http://www.blogger1.com/post45',
        title: 'Some German coding knowledge',
        tags: ['coding', 'deutsch'],
        desc: 'Something I found really useful',
        author: 'Blah blah'
      };

      postUtil.createOneWithEdge(newEdgePost, parentUrl, function(err, postToAddEdge, parent) {
        expect(err).to.equal(null);
        expect(parent).to.not.equal(null);
        expect(postToAddEdge).to.not.equal(null);

        expect(postToAddEdge.inLinks).to.contain(parent.postId);
        done();
      });
    });

    it('should handle an undefined argument for currUrl, for crawler logic simplification', function(done) {

      var currUrl = undefined;
      var newEdgePost = {
        url: 'http://www.blogger66.com/post434',
        title: 'A different blog post',
        tags: ['coding', 'something'],
        desc: 'More knowledges',
        author: 'Blah blah'
      };

      postUtil.createOneWithEdge(newEdgePost, currUrl, function(err, postToLink, updated) {
        expect(err).to.equal(null);
        expect(postToLink).to.not.equal(null);
        expect(updated).to.equal(undefined);

        expect(postToLink.title).to.equal(newEdgePost.title);
        expect(postToLink.oldTags).to.deep.equal(newEdgePost.tags);
        done();
      });
    });
  });

  describe('Whitelist Utilities', function() {

    it('should also have several different methods', function() {
      var modules = [
        'findAll',
        'addOne'
      ];
      modules.forEach(function(module) {
        expect(wlUtil[module]).to.be.a.function;    
      });
    });

    it('should be able to add several new entries', function(done) {
      var frontPages = [
        'https://oldchevy.github.io', 
        'http://www.helloreact.com/blog',
        'http://www.programming.org/blog',
        'http://www.isaacabrimov.com'
      ];

      var addOne = Promise.promisify(wlUtil.addOne);

      Promise.all(frontPages.map(page => addOne(page))).then(function(saved) {
        //console.log('Resolved: ', stuff);

        expect(saved.map(page => page.url)).to.deep.equal(frontPages);
        done();

      }).catch(function(err) {
        console.log('Errors: ', err);
      });
    });

    it('should get all entries', function(done) {

      wlUtil.findAll(function(err, results) {
        expect(results.length).to.equal(4);
        if (!err) {
          done();
        }
      });

    });
  });


  afterEach(function() {
    //db.Post.drop().then(done);
  });
});