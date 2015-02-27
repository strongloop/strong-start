'use strict';

var http = require('http');

var server = http.createServer().listen(3000);

server.once('listening', function() {
  console.error('args:', this.address());
});

server.on('request', function(req, rsp) {
  console.error('connect from: %j', req.socket.address());
  rsp.end('bye');
});
