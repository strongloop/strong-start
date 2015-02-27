'use strict';

var async = require('async');

// Call poll until it doesn't callback with err... delaying a bit between call.
module.exports = function retry(_poll, callback) {
  async.retry(6, poll, callback);

  function poll(callback) {
    _poll(function(err) {
      if (!err)
        return callback();

      setTimeout(function() {
        callback(err);
      }, 500);
    });
  }
};
