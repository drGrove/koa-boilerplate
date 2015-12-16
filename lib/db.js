'use strict'
const NODE_ENV = process.env.NODE_ENV || 'DEVELOPMENT';
var configFile = NODE_ENV + ''
configFile = configFile !== '' ? configFile.toLowerCase() : 'development'
var Sequelize = require('sequelize')
var logger  = require(__dirname + '/logger')
try {
  var cfg = require(__dirname + `/../migrations/${configFile}.json`)
} catch (e) {
  logger.info('Could not pull config, checking environment variables')
  var cfg = {}
  cfg.database = process.env.DATABASE_NAME || ''
  cfg.username = process.env.DATABASE_USER || ''
  cfg.password = process.env.DATABASE_PASS || ''
  cfg.dialect = process.env.DATABASE_DIALECT || 'mariadb'
  cfg.hsot = process.env.DATABASE_HOST || 'localhost'
}
var db = {}

var options =
{ host: cfg.host
, dialect: cfg.dialect
, pool:
  { max: 50
  , min: 1
  , idle: 10000
  }
}

if (NODE_ENV === 'PRODUCTION' || NODE_ENV === 'TESTING') {
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
