var ObjectId = require('mongoose').Types.ObjectId;
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

var loadCollection = function loadCollection(conn, name, data) {
  return function(done) {
    var coll = conn.collection(name);
    coll.remove(coll.insert.bind(coll, data, done));
  }
}

var loadData = function loadData(done) {
  MongoClient.connect(this.mongoUri, function(err, conn) {
    if (err) return done(err);
    async.parallel(Object.keys(fixture.data).map(function(key) {
      return loadCollection(conn, key, fixture.data[key]); 
    }), done);
  });
}

var fixture = module.exports = function(mongoUri) {
  return {
    load: loadData.bind({mongoUri: mongoUri})
  }
};

fixture.data = {
  entries: [
    {
      id: ObjectId(),
      title: 'not a journal entry',
      content: 'this is not a journal entry',
      author: {
        name: 'john doe',
        email: 'john.doe@example.org'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: ObjectId(),
      title: 'not a journal entry 2',
      content: 'this is not a journal entry 2',
      author: {
        name: 'john muller',
        email: 'john.muller@example.org'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: ObjectId(),
      title: 'not a journal entry 3',
      content: 'this is not a journal entry 3',
      author: {
        name: 'jane woo',
        email: 'jane.woo@example.org'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}
