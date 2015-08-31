'use strict'

module.exports = function *checkRole() {
  var promise = new Promise(function(resolve, reject) {
    var user = this.auth;
    var route = this.originalUrl
    // var allowedRoutes = yield allowedRoutesForRole(user.role) || []
    var allowedRoutes = []
    console.log('checking routes')
    if (allowedRoutes.indexOf(route) === -1) {
      console.error('Unauthorized')
      reject(false)
    }
    resolve(true)
  });

  return promise;
}
