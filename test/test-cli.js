'use strict';

var assert = require('assert');
var cli = require('./cli');

cli.start(function() {
  cli.waitForApp(function(err) {
    assert.ifError(err);
    cli.shutdown();
  });
});
