var expect = require('chai').expect;
var postUtil = require('../../workerUtils/postUtils.js');

describe('Utilities', function() {

  beforeEach(function() {
    //create dummy data

  });

  describe('Post Utilities', function() {

    it('should have a bunch of different methods', function() {
      var modules = [
        'findOrCreateOne',
        'createOneWithEdge'
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
        keys: ['search', 'ultimate', 'coding', 'prowess'],
        description: 'These guys are pretty awesome, and smart and funny, probably',
        author: 'Mr. Bean'
      };
      postUtil.findOrCreateOne(fakePost, function(err, succ) {
        expect(err).to.equal(null);
        expect(succ.dataValues.title).to.equal(fakePost.title);
        expect(succ.keys).to.deep.equal(fakePost.keys);
        done();
      });
    });

    it('should be able to create a new post with an edge', function(done) {

      var currUrl = 'http://www.google.com';
      var newEdgePost = {
        url: 'http://www.blogger1.com/post80',
        title: 'Working with Google Analytics',
        keys: ['google', 'analytics', 'coding'],
        description: 'How to make the most of this powerful tool',
        author: 'Dood Man'
      };

      postUtil.createOneWithEdge(newEdgePost, currUrl, function(err, updated, postToLink) {
        expect(err).to.equal(null);
        expect(updated).to.not.equal(null);
        expect(postToLink).to.not.equal(null);

        expect(updated.inLinks).to.contain(postToLink.postId);
        done();
      });
    });

    it('should not add extraneous edges', function(done) {

      var currUrl = 'http://www.google.com';
      var sameEdgePost = {
        url: 'http://www.blogger1.com/post80',
        title: 'Working with Google Analytics',
        keys: ['google', 'analytics', 'coding'],
        description: 'How to make the most of this powerful tool',
        author: 'Dood Man'
      };

      postUtil.createOneWithEdge(sameEdgePost, currUrl, function(err, updated, postToLink) {
        expect(err).to.equal(null);
        expect(updated).to.not.equal(null);
        expect(postToLink).to.not.equal(null);
        expect(updated.inLinks.filter(entry => entry === postToLink.postId)).to.have.length(1);
        done();
      });


    });

    it('should be able to find an existing post and add an edge', function(done) {

      var currUrl = 'http://www.google.com';
      var newEdgePost = {
        url: 'http://www.blogger4.com/post2',
        title: 'Google Analytics - sehr schon',
        keys: ['google', 'analytics', 'deutsch'],
        description: 'Ich brauchte suchen uber das Google search',
        author: 'Klaus Jurgenausfallen'
      };

      postUtil.createOneWithEdge(newEdgePost, currUrl, function(err, updated, postToLink) {
        expect(err).to.equal(null);
        expect(updated).to.not.equal(null);
        expect(postToLink).to.not.equal(null);

        expect(updated.inLinks).to.contain(postToLink.postId);
        done();
      });
    });

    it('should add more edges in Web Crawler BFS manner', function(done) {

      var currUrl = 'http://www.blogger4.com/post2';
      var newEdgePost = {
        url: 'http://www.blogger1.com/post45',
        title: 'Some German coding knowledge',
        keys: ['coding', 'deutsch'],
        description: 'Something I found really useful',
        author: 'Blah blah'
      };

      postUtil.createOneWithEdge(newEdgePost, currUrl, function(err, updated, postToLink) {
        expect(err).to.equal(null);
        expect(updated).to.not.equal(null);
        expect(postToLink).to.not.equal(null);

        expect(updated.inLinks).to.contain(postToLink.postId);
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
        expect(wlController[module]).to.be.a.function;    
      });
    });

  });


  afterEach(function() {
    //db.Post.drop().then(done);
  });
});