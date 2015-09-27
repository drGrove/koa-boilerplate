'use strict'
var rootDir = __dirname.split('/')
rootDir.pop()
rootDir = rootDir.join('/')
var app =
{ rootDir: rootDir
}
var Role = require(__dirname + '/../routes/roles/model')(app)
var User = require(__dirname + '/../routes/users/model')(app)
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
    var route = this.originalUrl
    var userRoles = this.auth.Roles
    var method = this.request.method.toLowerCase()
    var roleCount = userRoles.length
    for (var i = 0; i < roleCount; i++) {
      var routeCount = userRoles[i].Routes.length
      for (var j = 0; j < routeCount; j++) {
        var routeItem = userRoles[i].Routes[j]
        var regexp = new RegExp(routeItem.url)
        var routeMethod = routeItem.method.toLowerCase()
        if
        ( routeMethod === method &&
          route.match(regexp)
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
