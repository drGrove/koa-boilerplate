'use strict'
var cfg = require(__dirname + '/config')
var mongoose = require('mongoose')
var Sequelize = require('sequelize')
var logger = require(__dirname + '/logger')
var db = {}

if (cfg.mongodb.database) {
  var config = cfg.mongodb
  var uri = config.user + ':' + config.pass + '@'
  uri += config.host + ':' + config.port + '/' + config.database
  var database = mongoose.connect('mongodb://' + uri)
  db.db = database
  var connection = mongoose.connection
  db.connection = connection
  connection.on('error', logger.error.bind(logger, 'connection error:'))
  connection.on('open', function() {
    logger.log('Connected to Database')
  })

}

db.mongoose = mongoose

if (cfg.mysql.database) {
  var options =
  { host: cfg.mysql.host
  , port: cfg.mysql.port
  , pool:
    { max: 50
    , min: 0
    , idle: 10000
    }
  }

  if (process.env.PROD || process.env.TESTING) {
    options.logging = false
  }

  var sequelize = new Sequelize
  ( cfg.mysql.database
  , cfg.mysql.username
  , cfg.mysql.password
  , options
  )
  db.sequelize = sequelize;
}

db.Sequelize = Sequelize

module.exports = db
