'use strict';

var Pm = require('../lib/pm');
var assert = require('assert');
var debug = require('debug')('strong-start:test');
var fs = require('fs');
var net = require('net');
var tap = require('tap');
var tmp = require('temporary');

tap.test('.strong-pm/pmctl is listening', function(t) {
  setup();
  mkbase();
  listen(function() {
    isAlive(function(err) {
      debug('alive? %s', err);
      t.ifError(err);
      server.close(t.end);
    });
  });
});

tap.test('auto-start strong-pm', function(t) {
  setup();
  pm.start(function(err) {
    t.ifError(err);
    isAlive(function(err) {
      debug('alive? %s', err);
      t.ifError(err);
      t.doesNotThrow(function() {
        fs.readFileSync(pm.logFile);
      });
      kill(t.end);
    });
  });
});

tap.test('auto-start strong-pm, twice', function(t) {
  var log1;
  var log2;

  t.test('setup', function(t) {
    setup();
    isAlive(function(err) {
      debug('alive? %s', err);
      t.assert(err, 'should be no PM running');
      t.end();
    });
  });

  t.test('start first time', function(t) {
    pm.start(function(err) {
      t.ifError(err, 'pm should start without error');
      isAlive(function(err) {
        debug('alive? %s', err);
        t.ifError(err);
        // ensure the app has run long enough to produce log output
        setTimeout(t.end, 500);
      });
    });
  });

  t.test('capture log from first start', function(t) {
    fs.readFile(pm.logFile, 'utf8', function(err, log) {
      log1 = log;
      t.ifErr(err, 'log file should exist');
      t.assert(log && log.length > 0, 'log should not be empty');
      t.end();
    });
  });

  t.test('start second time', function(t) {
    pm.start(function(err) {
      t.ifError(err, 'pm should start without error');
      isAlive(function(err) {
        debug('alive? %s', err);
        t.ifError(err);
        // ensure the app has run long enough to produce log output
        setTimeout(t.end, 250);
      });
    });
  });

  t.test('capture log from second start', function(t) {
    fs.readFile(pm.logFile, 'utf8', function(err, log) {
      log2 = log;
      t.ifErr(err, 'log file should exist');
      t.assert(log && log.length > 0, 'log should not be empty');
      t.end();
    });
  });

  t.test('compare logs and cleanup', function(t) {
    debug('log1 <\n%s>', log1);
    debug('log2 <\n%s>', log2);
    t.assert(log1 && log1.length);
    t.assert(log2 && log2.length);
    if (log1.length && log2.length)
      t.equal(log2.substr(0, log1.length), log1, 'same pm proc, same log');
    kill(t.end);
  });

  t.end();
});

var dir;
var pm;

function setup() {
  dir = new tmp.Dir();
  process.env.HOME = process.env.USERPROFILE = dir.path;
  cleanup();
  pm = new Pm();
  debug('prepare: home %s', dir.path);
  debug('prepare: base %s', pm.base);
}

function isAlive(callback) {
  pm.isAlive(callback);
}

function kill(callback) {
  pm.child.kill('SIGKILL');
  pm.child.once('exit', callback);
}

function mkbase() {
  fs.mkdirSync(pm.base);
  debug('mkbase: %s', pm.base);
}

var server;

function listen(callback) {
  server = net.createServer().listen(8701, callback)
    .on('error', assert.ifError);
  server.unref();
}

process.on('exit', cleanup);

function cleanup() {
  if (!pm || !pm.child) return;

  try {
    pm.child.kill('SIGKILL');
  } catch (er) {
  }
}
