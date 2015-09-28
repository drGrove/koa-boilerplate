'use strict'
module.exports = function(app) {
  var db = require(app.rootDir + '/lib/db').sequelize
  var Sequelize = require(app.rootDir + '/lib/db').Sequelize
  var Route = require(__dirname + '/../routes/model')(app)
  var User = require(__dirname + '/../users/model')(app)

  /**
   * @swagger
   * definition:
   *   Role:
   *     type: object
   *     required:
   *       - id
   *       - name
   *       - adminLevel
   *     properties:
   *       id:
   *         type: integer
   *         format: int64
   *       name:
   *         type: string
   *       adminLevel:
   *         type: integer
   *         format: int32
   */
  var schema =
  { id:
    { type: Sequelize.BIGINT
    , autoIncrement: true
    , primaryKey: true
    }
  , name:
    { type: Sequelize.STRING
    , allowNull: false
    }
  , adminLevel:
    { type: Sequelize.INTEGER
    , defaultValue: 0
    , allowNull: false
    }
  }

  var Role = db
  .define
  ( 'Role'
  , schema
  , { paranoid: true
    }
  )

  Role
    .belongsToMany
    ( Route
    , { through: 'RouteRoles'
      , foreignKey: 'RouteId'
      , constraints: 'pk_RouteRole'
      }
    )

  Role
    .belongsToMany
    ( User
    , { through: 'UserRoles'
      , foreignKey: 'roleId'
      , constraints: 'pk_UserRole'
      }
    )

  User
    .belongsToMany
    ( Role
    , { through: 'UserRoles'
      , foreignKey: 'userId'
      , constraints: 'pk_UserRole'
      }
    )

  Role.sync().then(function(){
    console.log('Role table synced')

  })

  return Role
}