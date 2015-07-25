'use strict';

var cli = require('./cli');
var tap = require('tap');

tap.test('cli', function(t) {
  cli.start(function() {
    cli.waitForApp(function(err) {
      t.ifError(err);
      cli.shutdown();
      t.end();
    });
  });
});
