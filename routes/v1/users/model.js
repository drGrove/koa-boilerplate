'use strict';
var db = require(__dirname + '/../../../lib/db').sequelize,
    Sequelize = require(__dirname + '/../../../lib/db').Sequelize,
    bcrypt = require('bcryptjs')

/**
 * @swagger
 * definition:
 *   User:
 *     type: object
 *     required:
 *       - id
 *       - username
 *       - password
 *       - email
 *       - firstname
 *       - lastname
 *       - phone
 *     properties:
 *       id:
 *         type: integer
 *         format: int64
 *       firstname:
 *         type: string
 *       lastname:
 *         type: string
 *       email:
 *         type: string
 *         format: email
 *       username:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       address:
 *         type: string
 *       address2:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: string
 *       zipcode:
 *         type: string
 *       country:
 *         type: string
 *       phone:
 *         type: string
 *       level:
 *         type: integer
 *         format: int32
 *       isActive:
 *         type: boolean
 */
var schema =
{ id:
  { type: Sequelize.BIGINT
  , autoIncrement: true
  , primaryKey: true
  }
, firstname:
  { type: Sequelize.STRING
  }
, lastname:
  { type: Sequelize.STRING
  }
, email:
  { type: Sequelize.STRING
  , unique: true
  , allowNull: false
  }
, username:
  { type: Sequelize.STRING
  , unique: true
  , allowNull: false
  }
, password:
  { type: Sequelize.STRING
  , allowNull: false
  }
, address:
  { type: Sequelize.STRING
  }
, address2:
  { type: Sequelize.STRING
  }
, city:
  { type: Sequelize.STRING
  }
, state:
  { type: Sequelize.STRING
  }
, zipcode:
  { type: Sequelize.STRING
  }
, country:
  { type: Sequelize.STRING
  , allowNull: false
  , defaultValue: 'USA'
  }
, phone:
  { type: Sequelize.STRING
  }
, level:
  { type: Sequelize.INTEGER
  , defaultValue: 0
  , allowNull: false
  }
, isActive:
  { type: Sequelize.BOOLEAN
  , defaultValue: true
  , allowNull: false
  }
}

/**
 * Hash password with Bcrypt
 * @function
 * @param {object} model
 * @param {object} options
 * @param {function} done
 */
var hashPassword = function(model, options, done) {
  if(!model.changed('password')) {
    return done()
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return done(err)
    }
    bcrypt.hash(model.password, salt, function(err, hash) {
      if (err) {
        return done(err)
      }
      model.password = hash
      done()
    });
  });
}

/**
 * Strip Password from returned model(s)
 * @function
 * @param {object} models
 * @param {object} options
 * @param {function} done
 */
var stripPassword = function(models, options, done) {
  for(var i = 0; i < models.length; i++) {
    delete models[i].password
  }
  done()
}

var User = db
.define
( 'User'
, schema
, { instanceMethods:
    { generateHash: function(password, done) {
        bcrypt.genSalt(10, function(err, salt){
          bcrypt.hash(model.password, salt, null, function(err, hash){
            if(err) {
              return done(err)
            }
            model.password = hash
            done()
          })
        })
      }
    , validPassword: function(password, next) {
        return bcrypt.compareSync(password, this.password)
      }
    , toJSON: function() {
        this.dataValues.password = null
        return this.dataValues
      }
    }
  , paranoid: true
  }
)

User.beforeCreate(hashPassword)
User.beforeUpdate(hashPassword)

User.sync().then(function(){
  console.log('User table synced')
})

module.exports = User
