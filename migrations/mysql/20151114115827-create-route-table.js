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
        ( 'route'
        , { id:
            { type: DataTypes.BIGINT
            , autoIncrement: true
            , primaryKey: true
            }
          , url:
            { type: DataTypes.STRING
            , allowNull: false
            , unique: 'unq_UrlMethod'
            }
          , method:
            { type: DataTypes.ENUM
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
          }
        );
  },

  down: function (queryInterface, DataTypes) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
    return queryInterface.dropTable('route');
  }
};
