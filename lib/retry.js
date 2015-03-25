'use strict';

var async = require('async');

// Call poll until it doesn't callback with err... delaying a bit between call.
//
// Args: retry(poll[, tries], callback)
module.exports = function retry(_poll, tries, callback) {
  if (!callback) {
    callback = tries;
    tries = 10;
  } else {
    tries = +tries || 10;
  }

  async.retry(tries, poll, callback);

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
