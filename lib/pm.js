'use strict';

var debug = require('debug')('strong-start:pm');
var echo = require('debug')('strong-start:echo').enabled;
var fmt = require('util').format;
var home = require('osenv').home;
var net = require('net');
var once = require('lodash').once;
var path = require('path');
var retry = require('./retry');
var slpm = require.resolve('strong-pm/bin/sl-pm.js');
var spawn = require('child_process').spawn;

module.exports = Pm;

function Pm() {
  if (!(this instanceof Pm))
    return new Pm.apply(null, arguments);

  var _home = home();
  this.base = path.resolve(_home, '.strong-pm');
  this.control = path.resolve(this.base, 'pmctl');
  if (process.platform === 'win32' && !/^[\/\\]{2}/.test(this.control))
    this.control = '\\\\?\\pipe\\' + this.control;
  this.url = 'http://127.0.0.1:8701';
}

Pm.prototype.start = function(callback) {
  var self = this;

  debug('start');

  self.isAlive(function(err) {
    if (!err) {
      debug('pm is alive');
      return callback();
    }
    debug('pm is missing: %s', err);
    self.spawn(callback);
  });
};

Pm.prototype.isAlive = function(_callback) {
  var callback = once(function(err) {
    debug('alive? %s', err);
    return _callback(err);
  });

  var client = net.connect(this.control)
    .once('error', callback)
    .once('connect', function() {
      client.destroy();
      callback();
    });
};

Pm.prototype.spawn = function(callback) {
  callback = once(callback);

  var self = this;
  var args = [
    slpm,
    '--base', this.base,
    '--control', this.control,
    '--listen', 8701, // FIXME need to make this pm default
  ];
  var options = {
    detached: true,
    stdio: echo ? 'inherit' : 'ignore',
  };

  debug('spawn: %s args %j options %j', process.execPath, args, options);

  self.child = spawn(process.execPath, args, options)
    .once('error', function(err) {
      debug('spawn error: %s', err);
      callback(err);
    })
    .once('exit', function(status, signal) {
      var msg = fmt('pm failed, exit with status ', signal || status);
      return callback(Error(msg));
    });

  debug('wait for pm to be alive');

  retry(self.isAlive.bind(self), function(err) {
    debug('alive after start? %s', err);
    callback(err);
  });
};
