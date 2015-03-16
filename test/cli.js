'use strict';

var assert = require('assert');
var cp = require('child_process');
var debug = require('debug')('strong-start:test');
var fs = require('fs');
var net = require('net');
var path = require('path');
var retry = require('../lib/retry');
var slpmctl = require.resolve('strong-pm/bin/sl-pmctl');
var slstart = require.resolve('../bin/sl-start');

exports.shutdown = shutdown;
exports.start = start;
exports.waitForApp = waitForApp;

function exec(args, callback) {
  var options = {
    stdio: 'inherit',
  };

  debug('spawn: args %j options %j', args, options);

  cp.spawn(process.execPath, args, options)
    .on('exit', function(code, signal) {
      debug('spawn: %s', signal || code);
      assert.equal(code, 0, args.join(' '));
      return callback();
    });
}

function start(callback) {
  exec([slstart, __dirname], callback);
}

function waitForApp(callback) {
  debug('wait for app to be alive');

  retry(connectToApp, function(err) {
    debug('after retry, connect was: %s', err);
    callback(err);
  });
}

function connectToApp(callback) {
  fs.readFile(path.resolve(__dirname, 'app.port'), function(err, data) {
    if (err) {
      return callback(err);
    } else {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return callback(e);
      }
      debug('connect to app at ', data.port);
      return connectTo(data.port, callback);
    }
  });
}

function connectToPm(callback) {
  debug('connect to pm at 8701');
  return connectTo(8701, callback);
}

function connectTo(port, callback) {
  net.connect(port)
    .on('connect', function() {
      debug('port %d is listening', port);
      this.destroy();
      return callback();
    })
    .on('error', function(err) {
      debug('port %d is NOT listening', port);
      return callback(err);
    });
}

function shutdown() {
  var args = [slpmctl, 'shutdown'];
  exec(args, function() {
    debug('wait for pm to shutdown');
    retry(poll, function(err) {
      assert.ifError(err);
    });

    // Wait for pm to be truly gone, so we don't introduce race conditions with
    // following tests.
    function poll(callback) {
      connectToPm(function(err) {
        callback(!err);
      });
    }
  });
}
