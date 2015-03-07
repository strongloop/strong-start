'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');

var server = http.createServer().listen(0);

server.once('listening', function() {
  var addr = JSON.stringify(this.address());
  fs.writeFileSync(path.resolve(__dirname, 'app.port'), addr);
  console.error('args:', this.address());
});

server.on('request', function(req, rsp) {
  console.error('connect from: %j', req.socket.address());
  rsp.end('bye');
});
