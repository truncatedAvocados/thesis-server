var expect = require('chai').expect;
var http = require('request');
var postController = require('../../server/controllers/postController.js');

describe('Controllers', function() {

  beforeEach(function() {
    //create dummy data

  });

  describe('Post Controller', function() {

    it('should have a bunch of different methods', function() {
      var modules = [
        'findTags',
        'findOne'
      ];
      modules.forEach(function(module) {
        expect(postController[module]).to.be.a.function;    
      });
    });

    //This test is deprecated, since we are not building ranking lists in the tests yet
    xit('should be able to query for tags, returning them in ranked order', function(done) {
      var tags = ['google'];

      //Note: the order will be the opposite of the order they were put in (reflected in titles test)
      http.get('http://localhost:3000/api/posts?tags=' + JSON.stringify(tags), function(err, resp, body) {
        response = JSON.parse(resp.body);
        console.log(response);
        expect(response).to.exist;
        expect(response.length).to.be.greaterThan(0);
        response.forEach(post => {
          expect(post.oldTags).to.contain(tags[0]);
        });
        done();
      });
    });
  

    it('should query for just one post and get its incoming links, ranked', function(done) {

      http.get('http://localhost:3000/api/posts/2', function(err, resp, body) {
        response = JSON.parse(resp.body);
        expect(response).to.have.length(2);
        expect(response.map(post => post.title)).to.deep.equal(['This is Gooooogle', 'Google Analytics - sehr schon']);
        //Any other check to be done here?
        done();
      });
    });
  });

  afterEach(function() {
    //db.Post.drop().then(done);
  });
});