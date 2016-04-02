'use strict';
/**
 * Generate Token
 * @param {function} app koa application instance
 * @return {function} getToken
 */
module.exports = function(app) {
  var jwt = require('jsonwebtoken');
  var path = require('path');
  var config = require(path.join(app.rootDir, '/lib/config'));

  /**
   * @name genToken
   * @function
   * @param {object} user The current user
   * @return {object} Signed JWT Token
   */
  function genToken(user) {
    var now = Date.now();
    // Expire in 14 days
    var expires = now + (1000 * 60 * 60 * 24 * 14);
    var mins = (expires - now) / 1000 / 60;
    var payload =
      { sub: user.id
      , iat: now
      , exp: expires
      };
    var res = jwt
      .sign
      ( payload
      , config.token_secret
      , mins
      );
    return res;
  }

  return genToken;
};
