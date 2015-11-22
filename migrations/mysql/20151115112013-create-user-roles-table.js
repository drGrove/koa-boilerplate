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
        ( 'userRoles'
        , { roleId:
            { type: DataTypes.BIGINT
            , references:
              { model: 'role'
              , key: 'id'
              }
            , onDelete: 'CASCADE'
            }
          , userId:
            { type: DataTypes.BIGINT
            , references:
              { model: 'user'
              , key: 'id'
              }
            , onDelete: 'CASCADE'
            }
          , createdAt:
            { type: DataTypes.DATE
            , allowNull: true
            , defaultValue: DataTypes.NOW
            }
          , updatedAt:
            { type: DataTypes.DATE
            , allowNull: true
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
    return queryInterface.dropTable('userRoles');
  }
};
