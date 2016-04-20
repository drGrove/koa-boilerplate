'use strict';
module.exports = function(sequelize, DataTypes) {
  var bcrypt = require('bcryptjs');
  /**
   *  @swagger
   *  definition:
   *    SignUp:
   *      type: object
   *      required:
   *        - firstname
   *        - lastname
   *        - email
   *        - password
   *      properties:
   *        firstname:
   *          type: string
   *        lastname:
   *          type: string
   *        email:
   *          type: string
   *          format: email
   *        password:
   *          type: string
   *          format: password
   *    UserPublic:
   *      allOf:
   *        - $ref: '#/definitions/SignUp'
   *        - required:
   *          - id
   *          - country
   *          - state
   *          properties:
   *            nickname:
   *              type: string
   *            state:
   *              type: string
   *            country:
   *              type: string
   *    NewUser:
   *      allOf:
   *        - $ref: '#/definitions/UserPublic'
   *        - required:
   *          - id
   *          - password
   *          - email
   *          - firstname
   *          - lastname
   *          - phone
   *          properties:
   *            password:
   *              type: string
   *              format: password
   *            address:
   *              type: string
   *            address2:
   *              type: string
   *            city:
   *              type: string
   *            zipcode:
   *              type: string
   *            phone:
   *              type: string
   *            level:
   *              type: integer
   *              format: int32
   *            isActive:
   *              type: boolean
   *            google:
   *              type: string
   *            facebook:
   *              type: string
   *            github:
   *              type: string
   *            linkedin:
   *              type: string
   *            createdAt:
   *              type: string
   *              format: date
   *            updatedAt:
   *              type: string
   *              format: date
   *            deletedAt:
   *              type: string
   *              format: date
   *    User:
   *      allOf:
   *        - $ref: '#/definitions/NewUser'
   *        - required:
   *          - id
   *          properties:
   *            id:
   *              type: integer
   *              format: int64
   */
  var schema =
  { id:
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
  };

  /**
   * Hash password with Bcrypt
   * @param {object} model map of models
   * @param {object} options options
   * @param {function} done function to call when done
   */
  var hashPassword = function(model, options, done) {
    if (model.changed('password')) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          done();
        } else {
          bcrypt.hash(model.password, salt, function(err, hash) {
            if (!err) {
              model.password = hash;
            }
            done();
          });
        }
      });
    } else {
      done();
    }
  };

  var User = sequelize
  .define
  ( 'User'
  , schema
  , { tableName: 'user'
    , singular: 'user'
    , plural: 'users'
    , instanceMethods:
      { generateHash: function(password, done) {
          var model = this;
          bcrypt.genSalt(10, function(err, salt) {
            if (err) {
              done();
            } else {
              bcrypt.hash(model.password, salt, null, function(err, hash) {
                if (!err) {
                  model.password = hash;
                }
                done();
              });
            }
          });
        }
      , validPassword: function(password) {
          var isValid = bcrypt.compareSync(password, this.password);
          return isValid;
        }
      }
    , paranoid: String(process.env.NODE_ENV).toUpperCase() !== "TESTING"
    , classMethods:
      { associate: function(models) {
          User
            .belongsToMany
            ( models.Role
            , { through: 'userRoles'
              , foreignKey: 'userId'
              , onDelete: 'cascade'
              }
            );
        }
      }
    }
  );

  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  return User;
};
