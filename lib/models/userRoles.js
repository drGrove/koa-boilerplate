'use strict';
var DB = require(__dirname + '/../db')
var db = DB.sequelize
var Sequelize = DB.Sequelize
var logger = require(__dirname + '/../logger')

var schema =
{ userId:
  { type: Sequelize.BIGINT
  , allowNull: false
  }
, roleId:
  { type: Sequelize.BIGINT
  , allowNull: false
  }
}

var UserRole = db
.define
( 'UserRoles'
, schema
)

UserRole.sync().then(function(){
  logger.log('UserRoles table synced')
})

module.exports = UserRole
