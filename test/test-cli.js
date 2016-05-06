// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-start
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
