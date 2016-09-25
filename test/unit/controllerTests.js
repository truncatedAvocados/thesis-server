var expect = require('chai').expect;
var postController = require('../../controllers/postController');


describe('Controllers', function() {

  beforeEach(function() {
    //create dummy data

  });

  describe('Post Controller', function() {

    it('should have a bunch of different methods', function() {
      var modules = [
        'createOne',
        'createOneWithEdge',
        'findTags',
        'findOne'
      ];
      modules.forEach(function(module) {
        expect(postController[module]).to.exist;
        expect(postController.createOne).to.be.a.function;    
      });

    });

    it('should be able to create a post', function(done) {
      var fakePost = {
        url: 'http://www.goooogle.com',
        title: 'This is Gooooogle',
        keys: ['search', 'ultimate', 'coding', 'prowess'],
        description: 'These guys are pretty awesome, and smart and funny, probably'
      };
      postController.createOne(fakePost, function(err, succ) {
        expect(err).to.equal(null);
        expect(succ.dataValues.title).to.equal(fakePost.title);
        done();
      });
    });
  });


  afterEach(function() {
    //destroy dummy data
  });
});