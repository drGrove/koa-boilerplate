'use strict'

module.exports = function(app) {
  var genToken = require(__dirname + '/genToken')(app)
  var genRefresh = require(__dirname + '/genRefresh')(app)

  var utilities = {}

  utilities.genToken = genToken
  utilities.genRefresh = genRefresh

  return utilities
}
