'use strict'

module.exports = function(app) {
  var crypto = require('crypto')
  var config = require(app.rootDir + '/lib/config')

  /**
   * @name genRefresh
   * @function
   * @returns {string} token - Refresh Token
   */
  function genRefresh() {
    try {
      return crypto.randomBytes(config.token_length).toString('hex')
    } catch (e) {
      throw e
    }
  }

  return genRefresh
}
