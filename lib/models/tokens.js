'use strict';
var DB = require(__dirname + '/../db')
var db = DB.sequelize
var Sequelize = DB.Sequelize

var schema =
{ id:
  { type: Sequelize.BIGINT
  , autoIncrement: true
  , primaryKey: true
  }
, token:
  { type: Sequelize.STRING
  , allowNull: false
  , unique: true
  }
, userId:
  { type: Sequelize.BIGINT
  , allowNull: false
  }
, refresh:
  { type: Sequelize.STRING
  , allowNull: false
  }
}

var Token = db
.define
( 'Tokens'
, schema
)

Token.sync().then(function(){
  console.log('Token table synced')
})

module.exports = Token
