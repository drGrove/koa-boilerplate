'use strict'
var rootDir = __dirname.split('/')
rootDir.pop()
rootDir = rootDir.join('/')
var app =
{ rootDir: rootDir
}
var Role = require(__dirname + '/../routes/roles/model')(app)
var User = require(__dirname + '/../routes/users/model')(app)

module.exports = function *checkRole() {
  var cb = function(resolve, reject) {
    var route = this.originalUrl
    var userRoles = this.auth.Roles
    var method = this.request.method.toLowerCase()
    var roleCount = userRoles.length


    // Concat all routes arrays
    var whitelist = []

    for(let i = 0; i < roleCount; i++) {
      // If admin - full access
      if(userRoles[i].name === 'admin') {
        this.auth.isAdmin = true
        resolve(true)
      }
      whitelist = whitelist.concat(userRoles[i].Routes)
    }


    var routeCount = whitelist.length
    for (let i = 0; i < routeCount; i++) {
      var routeItem = whitelist[i]
      var regexp = new RegExp(routeItem.url)
      var routeMethod = routeItem.method.toLowerCase()
      if
      ( routeMethod === method &&
        route.match(regexp)
      ) {
        return resolve(true)
      }
    }

    return reject(false)
  }.bind(this)

  return new Promise(cb)
}
