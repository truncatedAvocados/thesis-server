var expect = require('chai').expect;
var frontPageCrawler = require('../../frontPageCrawler');
var getNewBlogPostsSingleThread = frontPageCrawler.getNewBlogPostsSingleThread;
var getNewBlogPosts = frontPageCrawler.getNewBlogPosts;  

describe('frontPageCrawler', function() {

  beforeEach(function() {

  });

  // describe('getNewBlogPostsMultiThread', function() {
  //   var urlList = ['http://aakinshin.net/en/blog/content/'];
  //   it('should invoke a callback on an array', function(done) {
  //     getNewBlogPosts(urlList, (result) => {
  //       expect(result).to.be.an.array;
  //       done();
  //     });
  //   });

  //   it('should not add duplicates to the results array', function(done) {
  //     getNewBlogPosts(urlList, (result) => {
  //       var startLength = result.length;
  //       getNewBlogPosts(urlList.concat(urlList), (newResult) => {
  //         var endLength = newResult.length;
  //         expect(endLength).to.equal(startLength);
  //         done();
  //       })
  //     })
  //   });

  //   it('should keep running if it runs into an error', function(done) {
  //     getNewBlogPosts(urlList.concat('NOT_A_URL'), (result) => {
  //       expect(result).to.be.an.array;
  //       done();
  //     })
  //   });
  // });

  describe('getNewBlogPostsSingleThread', function() {
    var urlList = ['http://aakinshin.net/en/blog/content/'];
    it('should invoke a callback on an array', function(done) {
      getNewBlogPostsSingleThread(urlList, (result) => {
        expect(result).to.be.an.array;
        done();
      });
    });

    it('should not add duplicates to the results array', function(done) {
      getNewBlogPostsSingleThread(urlList, (result) => {
        var startLength = result.length;
        getNewBlogPostsSingleThread(urlList.concat(urlList), (newResult) => {
          var endLength = newResult.length;
          expect(endLength).to.equal(startLength);
          done();
        });
      });
    });

    it('should keep running if it runs into an error', function(done) {
      getNewBlogPostsSingleThread(urlList.concat('NOT_A_URL'), (result) => {
        expect(result).to.be.an.array;
        done();
      })
    });
    it('should invoke a callback on an empty array with an invalid input', function(done) {
      getNewBlogPostsSingleThread([], (result) => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });



  afterEach(function() {

  });
});