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
        ( 'routeRoles'
        , { routeId:
            { type: DataTypes.BIGINT
            , references:
              { model: 'route'
              , key: 'id'
              }
            }
          , roleId:
            { type: DataTypes.BIGINT
            , references:
              { model: 'role'
              , key: 'id'
              }
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
        );
  },

  down: function (queryInterface, DataTypes) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
    */
    return queryInterface.dropTable('routeRoles');
  }
};
