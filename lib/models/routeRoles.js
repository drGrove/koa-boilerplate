'use strict'

module.exports = function(app) {
  var db = require(app.rootDir + '/lib/db').sequleize
  var Sequelize = require(app.rootDir + '/lib/db').Sequelize
  var Route = require(app.rootDir + '/routes/v1/routes/model')
  var Role = require(app.rootDir + '/routes/v1/roles/model')(app)

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

  Route
    .belongsToMany
    ( Role
    , { through: RouteRole
      , foreignKey: 'RoleId'
      , constraints: 'pk_RouteRole'
      }
    )

  RouteRoles.sync().then(function(){
    console.log('RouteRoles table synced')
  })

  return RouteRoles;
}
