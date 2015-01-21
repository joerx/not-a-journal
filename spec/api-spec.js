var app = require('../app');
var fixture = require('./fixture');
var supertest = require('supertest');
var expect = require('chai').expect;

var mongoUri = process.env.MONGO_URI;
var api = supertest(app({mongoUri: mongoUri}));

describe('journal api', function() {

  beforeEach(fixture(mongoUri).load);

  describe('index', function() {

    it('should return all entries', function(done) {
      api.get('/api/entries')
        .expect(200)
        .expect('content-type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.collection.length).to.equal(fixture.data.entries.length);
          done();
        });
    });

  });

});
