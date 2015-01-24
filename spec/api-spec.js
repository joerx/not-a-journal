var _ = require('lodash');
var app = require('../app');
var fixture = require('./fixture');
var supertest = require('supertest');
var expect = require('chai').expect;
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

var mongoUri = process.env.MONGO_URI;
var api = supertest(app({mongoUri: mongoUri}));

describe('journal api', function() {

  beforeEach(fixture(mongoUri).load);

  describe('index', function() {

    it('should return all entries', function(done) {
      var expected = fixture.data.entries.length;
      api.get('/api/entries')
        .expect(200)
        .expect('content-type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.collection.length).to.equal(expected);
          done();
        });
    });
  });

  describe('view', function() {
    it('should return an entry by id', function(done) {
      var expected = fixture.data.entries[0];
      api.get('/api/entries/' + expected._id)
        .expect(200)
        .expect('content-type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          var entry = res.body.data;
          expect(entry._id).to.equal(expected._id.toString());
          expect(entry.title).to.equal(expected.title);
          expect(entry.author).to.eql(expected.author);

          var fmt = 'YYYY-MM-DDThh:mm:ss.SSS[Z]';
          var expectCreated = moment(expected.created).utc().format(fmt);
          var expectModified = moment(expected.modified).utc().format(fmt);
          expect(entry.created).to.equal(expectCreated);
          expect(entry.modified).to.equal(expectModified);

          done();
        });
    });

    it('should respond 404 when entry was not found', function(done) {
      var id = new ObjectId();
      api.get('/api/entries/' + id)
        .expect(404)
        .expect('content-type', /json/)
        .end(done);
    });

    it('should respond 400 for invalid object id', function(done) {
      var id = 'FOOO';
      api.get('/api/entries/' + id)
        .expect(400)
        .expect('content-type', /json/)
        .end(done);
    });
  });

  describe('create', function() {

    var data = {
      title: 'a test entry',
      content: 'lorem ipsum, etc.',
      author: {name: 'john doe', email: 'john.doe@acme.org'}
    };

    it('should create an entry and respond 201 Created', function(done) {
      api.post('/api/entries')
        .send(data)
        .expect(201)
        .expect('content-type', /json/)
        .expect('location', /api\/entries/)
        .end(function(err, res) {
          if (err) return done(err);
          var result = res.body.data;
          expect(result._id, 'object id').to.exist();
          expect(result.title, 'title').to.equal(data.title);
          expect(result.author, 'author').to.eql(data.author);
          expect(result.created, 'creation date').to.exist();
          expect(result.modified, 'update date').to.exist();

          expect(moment(result.created).unix()).to.be.closeTo(moment.utc().unix(), 5);
          expect(moment(result.updated).unix()).to.be.closeTo(moment.utc().unix(), 5);

          done();
        });
    });

    it('should generate correct location header', function(done) {
      api.post('/api/entries/').send(data).expect(201, function(err, res) {
        if (err) return done(err);
        var location = res.headers['location'];
        expect(location).to.exist();
        expect(location).to.contain(res.body.data._id);
        expect(location).not.to.match(new RegExp('//' + res.body.data._id + '$'));
        done();
      });
    });

    it('should fail if title is missing', function(done) {
      var _data = _.omit(data, 'title');
      api.post('/api/entries').send(_data).expect(400, done);
    });

    it('should fail if author is missing', function(done) {
      var _data = _.omit(data, 'author');
      api.post('/api/entries').send(_data).expect(400, done);
    });

    it('should fail if author.name is missing', function(done) {
      var _data = _.clone(data, true);
      _data.author.name = undefined;
      api.post('/api/entries').send(_data).expect(400, done);
    });

    it('should fail if author.email is missing', function(done) {
      var _data = _.clone(data, true);
      _data.author.email = undefined;
      api.post('/api/entries').send(_data).expect(400, done);
    });

    it('should fail if author.email is invalid', function(done) {
      var _data = _.clone(data, true);
      _data.author.email = 'bla';
      api.post('/api/entries').send(_data).expect(400, done);
    });
  });
});
