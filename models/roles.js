'use strict';

module.exports = function(sequelize, DataTypes) {
  /**
   * @swagger
   * definition:
   *   Role:
   *     type: object
   *     required:
   *       - id
   *       - name
   *       - adminLevel
   *       - type
   *     properties:
   *       id:
   *         type: integer
   *         format: int64
   *       name:
   *         type: string
   *       adminLevel:
   *         type: integer
   *         format: int32
   *       type:
   *         type: string
   *         enum:
   *           - user
   *           - company
   *         default: 'user'
   */
  var schema =
    { id:
      { type: DataTypes.BIGINT
      , autoIncrement: true
      , primaryKey: true
      }
    , name:
      { type: DataTypes.STRING
      , allowNull: false
      , unique: 'unq_nameType'
      }
    , adminLevel:
      { type: DataTypes.INTEGER
      , defaultValue: 0
      , allowNull: false
      }
    , type:
      { type: DataTypes.ENUM
      , values:
        [ 'user'
        , 'company'
        ]
      , defaultValue: 'user'
      , unique: 'unq_nameType'
      }
    };

  var Role = sequelize
  .define
    ( 'Role'
    , schema
    , { paranoid: process.env.NODE_ENV !== "TESTING"
      , tableName: 'role'
      , singular: 'role'
      , plural: 'roles'
      , classMethods:
        { associate: function(models) {
            Role
              .belongsToMany
              ( models.User
              , { through: 'userRoles'
                , foreignKey: 'roleId'
                , onDelete: 'cascade'
                }
              );

            Role
              .belongsToMany
              ( models.Route
              , { through: 'routeRoles'
                , foreignKey: 'roleId'
                , targetKey: 'roleId'
                , onDelete: 'cascade'
                }
              );
          }
        }
      }
    );

  return Role;
};
