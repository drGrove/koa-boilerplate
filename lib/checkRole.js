'use strict'
var rootDir = __dirname.split('/')
rootDir.pop()
rootDir = rootDir.join('/')
var Route = require(__dirname + '/../routes/v1/routes/model')
var Role = require(__dirname + '/../routes/v1/roles/model')({
  rootDir: rootDir
})
var User = require(__dirname + '/../routes/v1/users/model')
var UserRole = require(__dirname + '/models/userRoles')

User
  .belongsToMany
  ( Role
  , { through:
      { model: UserRole
      , foreignKey: 'userId'
      }
    }
  )
Role
  .belongsToMany
  ( User
  , { through:
      { model: UserRole
      , foreignKey: 'roleId'
      }
    }
  )


module.exports = function *checkRole() {
  var cb = function(resolve, reject) {
    var user = this.auth;
    var route = this.originalUrl
    var userRoles = this.auth.Roles
    var allowedRoutes = [];
    var method = this.request.method.toLowerCase()
    var roleCount = userRoles.length
    for(var i = 0; i < roleCount; i++) {
      var routeCount = userRoles[i].Routes.length
      for(var j = 0; j < routeCount; j++) {
        var routeItem = userRoles[i].Routes[j]
        var regexp = new RegExp(routeItem.url)
        var routeMethod = routeItem.method.toLowerCase()
        if( routeMethod === method
          && route.match(regexp)
        ) {
          return resolve(true)
        }
      }
    }
    return reject(false)
  }.bind(this)

  var promise = new Promise(cb)

  return promise
}
