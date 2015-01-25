var app = require('../app');
var supertest = require('supertest');
var expect = require('chai').expect;

var mongoUri = process.env.MONGO_URI;
var api = supertest(app({mongoUri: mongoUri}));

describe('static routes', function() {

  describe('for assets', function() {
    it('should return the jquery script', function(done) {
      api.get('/assets/jquery/dist/jquery.min.js')
        .expect(200)
        .expect('content-type', /javascript/)
        .end(done);
    });

    it('should return the angular script', function(done) {
      api.get('/assets/angular/angular.min.js')
        .expect(200)
        .expect('content-type', /javascript/)
        .end(done);
    });

    it('should respond 404 for non-existing assets', function(done) {
      api.get('/assets/foo/bar.js').expect(404, done);
    });
  });

  describe('for public files', function() {
    it('should return the index file as html', function(done) {
      api.get('/index.html')
        .expect(200)
        .expect('content-type', /html/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.text).to.contain('not-a-journal');
          done();
        });
    });

    it('should return the master stylesheet as html', function(done) {
      api.get('/css/main.css').expect(200).expect('content-type', /css/).end(done);
    });
  });
});
