// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-start
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
