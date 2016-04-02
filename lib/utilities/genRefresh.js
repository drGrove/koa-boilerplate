'use strict';

module.exports = function(app) {
  var crypto = require('crypto');
  var path = require('path');
  var config = require(path.join(app.rootDir, '/lib/config'));

  /**
   * Generate a refresh token
   * @name genRefresh
   * @function
   * @return {string} token - Refresh Token
   */
  function genRefresh() {
    var token;
    try {
      token = crypto
        .randomBytes(parseInt(config.token_length, 10))
        .toString('hex');
      return token;
    } catch (e) {
      throw e;
    }
  }

  return genRefresh;
};
