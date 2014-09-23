var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');


// mongoosey stuff
mongoose.connect('mongodb://localhost/not-a-journal');

var entrySchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    name: String,
    email: String
  },
  createdAt: Date,
  updateAt: Date
});

var Entry = mongoose.model('Entry', entrySchema);

// expressy stuff
var app = express();
app.use(bodyparser.json());


var router = express.Router();

// define routes
router.get('/', function(req, res, next) {
  console.log('GET /');
  Entry.find({}, function(err, entries) {
    if (err) return next(err);
    res.status(200).json({collection: entries});
  });
});

router.get('/:id', function(req, res, next) {
  Entry.findById(req.params.id, function(err, entry) {
    if (err) return next(err);
    if (!entry) return res.status(404).json(notFound());
    res.status(200).json({data: entry});
  });
});

router.post('/', function(req, res, next) {
  Entry.create(req.body, function(err, entry) {
    if (err) return next(err);
    res.status(201).json({data: entry});
  });
});

router.put('/:id', function(req, res, next) {
  Entry.findByIdAndUpdate(req.params.id, req.body, function(err, entry) {
    if (err) return next(err);
    if (!entry) {
      res.status(404).json(notFound());
    } else {
      res.status(200).json({data: entry});
    }
  });
});

router.delete('/:id', function(req, res, next) {
  Entry.findByIdAndRemove(req.params.id, function(err, entry) {
    if (err) return next(err);
    if (!entry) {
      res.status(404).json(notFound());
    } else {
      res.status(200).json(entry);
    }
  });
});

app.use('/api/entries', router);

// static routes, one for app files, one for bower assets
app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/bower_components'));

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
  console.warn(status + ' ' + message);
  res.status(status).json({error: {message: message}});
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Listening on :' + app.get('port'));
});



function notFound() {
  return {error: {message: 'Not Found'}};
}
