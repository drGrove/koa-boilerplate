'use strict';
var DB = require(__dirname + '/../db')
var db = DB.sequelize
var Sequelize = DB.Sequelize

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
  console.log('UserRoles table synced')
})

module.exports = UserRole
