'use strict'

module.exports = function(app) {
  var jwt = require('jsonwebtoken')
  var config = require(app.rootDir + '/lib/config')

  /**
   * @name genToken
   * @function
   * @param {Object} user - The current user
   * @returns {Object} token - Signed JWT Token
   */
  function genToken(user) {
    var now = Date.now()
    // Expire in 14 days
    var expires = now + (1000 * 60 * 60 * 24 * 14)
    var mins = (expires - now) / 1000 / 60
    var payload =
    { sub: user.id
    , iat: now
    , exp: expires
    }
    return jwt
      .sign
      ( payload
      , config.token_secret
      , mins
      )
  }

  return genToken
}
