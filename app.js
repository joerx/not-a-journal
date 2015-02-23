var _ = require('lodash');
var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var url = require('url');
var path = require('path');
var validator = require('validator');

module.exports = function(config) {

  // mongooze
  var mongoUri = config.mongoUri;
  if (!mongoUri) {
    throw Error('Failed to init app. Please set MONGO_URI');
  }
  var conn = mongoose.createConnection(mongoUri);

  var entrySchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
      name: String,
      email: String
    },
    created: Date,
    modified: Date
  });

  var Entry = conn.model('Entry', entrySchema);

  // exprezz
  var app = express();
  app.set('port', config.port || 3000);

  app.use(bodyparser.json());

  var router = express.Router();

  // define routes
  router.get('/', function(req, res, next) {
    Entry.find({}, function(err, entries) {
      if (err) return next(err);
      res.status(200).json({collection: entries});
    });
  });

  router.get('/:id', function(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) {
      return next(badRequest('Id is not a valid ObjectId'));
    }
    Entry.findById(req.params.id, function(err, entry) {
      if (err) return next(err);
      if (!entry) {
        return next(notFound());
      } else {
        res.status(200).json({data: entry});
      }
    });
  });

  router.post('/', function(req, res, next) {
    var defaults = {
      created: new Date(),
      modified: new Date()
    };
    var data = _.defaults(req.body, defaults);
    var err = validate(data);
    if (err) {
      return next(err);
    }
    Entry.create(data, function(err, entry) {
      if (err) return next(err);
      var location = url.format({
        host: req.hostname,
        protocol: req.protocol,
        pathname: path.normalize(req.originalUrl + '/' + entry._id)
      });
      res.status(201)
        .header('location', location)
        .json({data: entry});
    });
  });

  router.put('/:id', function(req, res, next) {
    Entry.findByIdAndUpdate(req.params.id, req.body, function(err, entry) {
      if (err) return next(err);
      if (!entry) {
        return next(notFound());
      } else {
        res.status(200).json({data: entry});
      }
    });
  });

  router.delete('/:id', function(req, res, next) {
    Entry.findByIdAndRemove(req.params.id, function(err, entry) {
      if (err) return next(err);
      if (!entry) {
        return next(notFound());
      } else {
        res.status(200).json(entry);
      }
    });
  });

  app.use('/api/entries', router);

  // static routes, one for app files, one for bower assets
  app.use('/', express.static(__dirname + '/public'));

  // 404 catchall
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    var status = err.status || 500;
    var message = err.message || 'Internal Server error';
    res.status(status).json({error: {message: message}});
  });

  return app;
}

function validate(entry) {
  if (!entry.title) {
    return badRequest('title is missing');
  } else if (!entry.author) {
    return badRequest('author is missing');
  } else if (!entry.author.name) {
    return badRequest('author.name is missing');
  } else if (!entry.author.email) {
    return badRequest('author.email is missing');
  } else if (!validator.isEmail(entry.author.email)) {
    return badRequest('author.email is invalid');
  } else {
    return null;
  }
}

function notFound(msg) {
  return error(msg || 'Not Found', 404);
}

function badRequest(msg) {
  return error(msg || 'Bad Request', 400);
}

function error(msg, status) {
  msg = msg || 'Internal Error';
  status = status || 500;
  var err = new Error(msg);
  err.status = status;
  return err;
}
