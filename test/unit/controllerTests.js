var expect = require('chai').expect;
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
  });



  afterEach(function() {
    //db.Post.drop().then(done);
  });
});