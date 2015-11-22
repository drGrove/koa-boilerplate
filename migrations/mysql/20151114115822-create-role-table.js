'use strict';

module.exports = {
  up: function (queryInterface, DataTypes) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
    return queryInterface
      .createTable
        ( 'role'
        , { id:
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
          , createdAt:
            { type: DataTypes.DATE
            , allowNull: false
            , defaultValue: DataTypes.NOW
            }
          , updatedAt:
            { type: DataTypes.DATE
            , allowNull: false
            , defaultValue: DataTypes.NOW
            , onUpdate: DataTypes.NOW
            }
          , deletedAt:
            { type: DataTypes.DATE
            , allowNull: true
            }
          }
        , { charset: 'utf8'
          , timestamps: true
          }
        );
  },

  down: function (queryInterface, DataTypes) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
    return queryInterface.dropTable('role');
  }
};
