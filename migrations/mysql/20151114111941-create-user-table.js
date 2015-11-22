'use strict';

module.exports = {
  up: function (queryInterface, DataTypes) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface
      .createTable
        ( 'user'
        , { id:
            { type: DataTypes.BIGINT
            , autoIncrement: true
            , primaryKey: true
            }
          , firstname:
            { type: DataTypes.STRING
            }
          , lastname:
            { type: DataTypes.STRING
            }
          , nickname:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , displayName:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , email:
            { type: DataTypes.STRING
            , unique: true
            , allowNull: false
            }
          , password:
            { type: DataTypes.STRING
            }
          , address:
            { type: DataTypes.STRING
            }
          , address2:
            { type: DataTypes.STRING
            }
          , city:
            { type: DataTypes.STRING
            }
          , state:
            { type: DataTypes.STRING
            }
          , zipcode:
            { type: DataTypes.STRING
            }
          , country:
            { type: DataTypes.STRING
            , allowNull: false
            , defaultValue: 'USA'
            }
          , phone:
            { type: DataTypes.STRING
            }
          , level:
            { type: DataTypes.INTEGER
            , defaultValue: 0
            , allowNull: false
            }
          , isActive:
            { type: DataTypes.BOOLEAN
            , defaultValue: true
            , allowNull: false
            }
          , google:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , facebook:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , github:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , linkedin:
            { type: DataTypes.STRING
            , allowNull: true
            }
          , profilePrivacy:
            { type: DataTypes.ENUM
            , values:
              [ 'public'
              , 'private'
              , 'limited'
              ]
            , defaultValue: 'public'
            }
          , title:
            { type: DataTypes.STRING
            , allowNull: true
            , comment: "Job Title"
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
            , allowNull: false
            , defaultValue: DataTypes.NOW
            }
          }
        , { charset: 'utf8'
          , timestamps: true
          }
        )
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('user');
  }
};
