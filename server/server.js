'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
const path = require('path');

var app = module.exports = loopback();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.io = require('socket.io')(app.start());
  require('socketio-auth')(app.io, {
    authenticate: (socket, value, callback) => {
      const AccessToken = app.models.AccessToken;
      AccessToken.find({
        where: {
          and: [{ userId: value.userId }, { id: value.id }]
        }
      }, function (err, tokenDetail) {
        if (err) throw err;
        if (tokenDetail.length) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      });
    }
  });

  app.io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
});
