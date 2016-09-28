var expect = require('chai').expect;
var frontPageCrawler = require('../../frontPageCrawler');
var getPostsMulti = frontPageCrawler.getPostsMulti;
var getPosts = frontPageCrawler.getPosts;  

describe('frontPageCrawler', function() {

  beforeEach(function() {

  });

  // describe('getPostsMulti', function() {
  //   var urlList = ['http://aakinshin.net/en/blog/content/'];
  //   it('should invoke a callback on an array', function(done) {
  //     getPostsMulti(urlList, (result) => {
  //       expect(result).to.be.an.array;
  //       done();
  //     });
  //   });

  //   it('should not add duplicates to the results array', function(done) {
  //     getPostsMulti(urlList, (result) => {
  //       var startLength = result.length;
  //       getPostsMulti(urlList.concat(urlList), (newResult) => {
  //         var endLength = newResult.length;
  //         expect(endLength).to.equal(startLength);
  //         done();
  //       })
  //     })
  //   });

  //   it('should keep running if it runs into an error', function(done) {
  //     getPostMulti(urlList.concat('NOT_A_URL'), (result) => {
  //       expect(result).to.be.an.array;
  //       done();
  //     })
  //   });
  // });

  describe('getPosts', function() {
    var urlList = ['http://aakinshin.net/en/blog/content/'];
    it('should invoke a callback on an array', function(done) {
      getPosts(urlList, (result) => {
        expect(result).to.be.an.array;
        done();
      });
    });

    it('should not add duplicates to the results array', function(done) {
      getPosts(urlList, (result) => {
        var startLength = result.length;
        getPosts(urlList.concat(urlList), (newResult) => {
          var endLength = newResult.length;
          expect(endLength).to.equal(startLength);
          done();
        });
      });
    });

    it('should keep running if it runs into an error', function(done) {
      getPosts(urlList.concat('NOT_A_URL'), (result) => {
        expect(result).to.be.an.array;
        done();
      })
    });
    it('should invoke a callback on an empty array with an invalid input', function(done) {
      getPosts([], (result) => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });



  afterEach(function() {

  });
});