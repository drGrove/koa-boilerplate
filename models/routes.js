'use strict';

module.exports = function(sequelize, dataTypes) {
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
      { type: dataTypes.BIGINT
      , autoIncrement: true
      , primaryKey: true
      }
    , url:
      { type: dataTypes.STRING
      , allowNull: false
      , unique: 'unq_UrlMethod'
      }
    , method:
      { type: dataTypes.ENUM
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
    };

  var Route = sequelize
  .define
    ( 'Route'
    , schema
    , { paranoid: true
      , tableName: 'route'
      , singular: 'route'
      , plural: 'routes'
      , classMethods:
        { associate: function(models) {
            Route
              .belongsToMany
                ( models.Role
                , { through: 'routeRoles'
                  , foreignKey: 'routeId'
                  , targetKey: 'routeId'
                  }
                );
          }
        }
      }
    );

  return Route;
};
