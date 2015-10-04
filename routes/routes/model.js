'use strict'
module.exports = function(app) {
  var db = require(app.rootDir + '/lib/db').sequelize
  var Sequelize = require(app.rootDir + '/lib/db').Sequelize

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
    }
  )


  Route.sync().then(function(){
    console.log('Route table synced')
  })

  return Route
}
