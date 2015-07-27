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
      server.close(function() {
        t.end();
      });
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
      kill(function() {
        t.end();
      });
    });
  });
});

tap.test('auto-start strong-pm, twice', function(t) {
  setup();

  isAlive(function(err) {
    debug('alive? %s', err);
    t.assert(err);
    start1();
  });

  var log1;
  var log2;

  function start1() {
    pm.start(function(err) {
      t.ifError(err);
      isAlive(function(err) {
        debug('alive? %s', err);
        t.ifError(err);
        t.doesNotThrow(function() {
          t.assert((log1 = fs.readFileSync(pm.logFile, 'utf8')).length > 0);
        });
        start2();
      });
    });
  }

  function start2() {
    pm.start(function(err) {
      t.ifError(err);
      isAlive(function(err) {
        debug('alive? %s', err);
        t.ifError(err);
        t.doesNotThrow(function() {
          t.assert((log2 = fs.readFileSync(pm.logFile, 'utf8')).length > 0);
        });
        debug('log1 <\n%s>', log1);
        debug('log2 <\n%s>', log2);
        if (log1.length && log2.length)
          t.equal(log2.substr(0, log1.length), log1, 'same pm proc, same log');
        kill(function() {
          t.end();
        });
      });
    });
  }
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
