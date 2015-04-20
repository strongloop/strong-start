'use strict';

var Pm = require('./lib/pm');
var assert = require('assert');
var debug = require('debug')('strong-start:start');
var deploy = require('strong-deploy').local;
var fs = require('fs');

module.exports = start;

function start(app) {
  debug('app is %j', app);

  var pm = new Pm();

  pm.start(run);

  function run(err) {
    if (err) {
      console.error('%s', err);
      process.exit(1);
    }

    debug('deploy to %j app %j', pm.url, app);
    deploy(pm.url, app, 'default', ran);
  }

  function ran(err) {
    assert.ifError(err);
    var msg = fs.readFileSync(require.resolve('./started.txt'), 'utf-8')
      .replace(/%APP%/g, app)
      .trim();
    console.log(msg);
    process.exit();
  }
}
