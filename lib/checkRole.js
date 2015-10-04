'use strict'
var rootDir = __dirname.split('/')
rootDir.pop()
rootDir = rootDir.join('/')
var app =
{ rootDir: rootDir
}
var Role = require(app.rootDir + '/routes/roles/model')(app)
var User = require(app.rootDir + '/routes/users/model')(app)
var sequelize = require(app.rootDir + '/lib/db').sequelize

const SELECT_ROUTES = `select R.* from UserRoles UR LEFT JOIN RouteRoles RR on
  RR.RoleId = UR.roleId LEFT JOIN Routes R on RR.RouteId = R.id
  WHERE UR.userId = ?`

module.exports = function *checkRole() {
  var route = this.originalUrl
  var userRoles = this.auth.Roles
  var method = this.request.method.toLowerCase()
  var roleCount = userRoles.length


  // Concat all routes arrays
  var whitelist = []

  // Check for admin role
  for(let i = 0; i < roleCount; i++) {
    // If admin - full access
    if(userRoles[i].name === 'admin') {
      this.auth.isAdmin = true
      return true
    }
  }

  // Otherwise create whitelis
  try {
    var whitelist = yield sequelize
      .query
      ( SELECT_ROUTES
      , { replacements: [this.auth.id]
        , type: sequelize.QueryTypes.SELECT
        }
      )
  } catch (e) {
    console.error('Could not pull whitelist', e)
    return false
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
      return true
    }
  }

  return false

}
