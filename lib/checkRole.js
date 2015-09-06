'use strict'

module.exports = function *checkRole() {
  var Route = require(__dirname + '/../routes/v1/routes/model')

  var cb = function(resolve, reject) {
    var user = this.auth;
    var route = this.originalUrl
    // var allowedRoutes = yield allowedRoutesForRole(user.role) || []
    /*
    var allowedRoutes = yield Route.find({
      where:
      { 
      }
    })
    if (allowedRoutes.indexOf(route) === -1) {
      reject(false)
    } else {
    */
      resolve(true)
    //}
  }.bind(this)

  var promise = new Promise(cb)

  return promise
}
