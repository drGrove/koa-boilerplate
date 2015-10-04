'use strict'

module.exports = function(app) {
  var db = require(app.rootDir + '/lib/db').sequleize
  var Sequelize = require(app.rootDir + '/lib/db').Sequelize
  var Role = require(app.rootDir + '/routes/roles/model')(app)

  var schema =
  { RoleId:
    { type: Sequelize.BIGINT
    }
  , RouteId:
    { type: Sequelize.BIGINT
    }
  }

  var RouteRole = db
    .define
    ( 'RouteRoles'
    , schema
    )

  RouteRoles.sync().then(function(){
    console.log('RouteRoles table synced')
  })

  return RouteRoles;
}
