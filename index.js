if (!process.env.MONGO_URI) {
  throw Error('Failed to init app. Please set MONGO_URI');
}

var mongoUri = process.env.MONGO_URI;
var port = process.env.PORT || 3000;

var app = require('./app')({
  mongoUri: mongoUri,
  port: port
});

app.listen(app.get('port'), function() {
  console.log('Listening on :' + app.get('port'));
});
