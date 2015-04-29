'use strict';

var Pm = require('./lib/pm');
var assert = require('assert');
var debug = require('debug')('strong-start:start');
var deploy = require('strong-deploy').local;
var fs = require('fs');
var path = require('path');

module.exports = start;

function start(app) {
  debug('start app %j', app);

  var pkg = path.join(path.resolve(app || '.'), 'package.json');
  var name = require(pkg).name;
  var pm = new Pm();

  pm.start(run);

  function run(err) {
    if (err) {
      console.error('%s', err);
      process.exit(1);
    }

    debug('deploy to %j app %j name %j', pm.url, app);
    deploy(pm.url, name, app, ran);
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
