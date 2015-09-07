'use strict'

var db = require(__dirname + '/../../../lib/db').sequelize
var Sequelize = require(__dirname + '/../../../lib/db').Sequelize

/**
 * @swagger
 * definition:
 *  route:
 *    required:
 *      - url
 *    properties:
 *      id:
 *        type: integer
 *        format: int64
 *      url:
 *        type: string
 *  newRoute:
 *    required:
 *      - url
 *    properties:
 *      url:
 *        type: string
 */

var schema =
{ id:
  { type: Sequelize.BIGINT
  , autoIncrement: true
  , primaryKey: true
  }
, url:
  { type: Sequelize.STRING
  , allowNull: false
  , unique: 'unq_UrlMethod'
  }
, method:
  { type: Sequelize.ENUM
    ( 'GET'
    , 'POST'
    , 'PUT'
    , 'PATCH'
    , 'DELETE'
    )
  , allowNull: false
  , defaultValue: 'GET'
  , unique: 'unq_UrlMethod'
  }
}

var Route = db
.define
( 'Route'
, schema
, { paranoid: true
  , classMethods:
    { associate: function(models) {
        return Route
          .belongsToMany
          ( models.Role
          , { as: 'route'
            , through: 'RouteRoles'
            , foreignKey: 'Route_id'
            }
          )
      }
    }
  }
)

Route.sync().then(function(){
  console.log('Route table synced')
})

module.exports = Route
