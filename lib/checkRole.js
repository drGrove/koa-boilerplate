'use strict'

module.exports = function *checkRole() {
  console.log('gen promise')
  var cb = function(resolve, reject) {
    var user = this.auth;
    var route = this.originalUrl
    // var allowedRoutes = yield allowedRoutesForRole(user.role) || []
    var allowedRoutes = [
      '/api/v1/users'
    ]
    if (allowedRoutes.indexOf(route) === -1) {
      console.error('Unauthorized')
      reject(false)
    } else {
      resolve(true)
    }
  }.bind(this)

  var promise = new Promise(cb)

  return promise
}
