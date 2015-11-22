'use strict'
'use strict'
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOGGING = process.env.LOGGGING
var configFile = NODE_ENV + ''
configFile = configFile !== '' ? configFile.toLowerCase() : 'development'
var Sequelize = require('sequelize')
var cfg = require(__dirname + `/../migrations/${configFile}.json`)
var db = {}

var options =
{ pool:
  { max: 50
  , min: 1
  , idle: 10000
  }
}

if ( (NODE_ENV === 'production' && LOGGING !== 'info' ) ||
     (NODE_ENV === 'testing' && LOGGING !== 'info')
   ) {
  options.logging = false
}

var sequelize = new Sequelize
( cfg.database
, cfg.username
, cfg.password
, options
)
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
