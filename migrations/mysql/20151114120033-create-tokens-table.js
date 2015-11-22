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
        ( 'token'
        , { id:
            { type: DataTypes.BIGINT
            , autoIncrement: true
            , primaryKey: true
            }
          , token:
            { type: DataTypes.STRING
            , allowNull: false
            , unique: true
            }
          , userId:
            { type: DataTypes.BIGINT
            , allowNull: false
            }
          , refresh:
            { type: DataTypes.STRING
            , allowNull: false
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
    return queryInterface.dropTable('token');
  }
};
