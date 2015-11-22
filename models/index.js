'use strict';
const NODE_ENV = process.env.NODE_ENV
var configFile = NODE_ENV + ""
configFile = configFile !== "" ? configFile.toLowerCase() : "development"
var fs        = require('fs')
var path      = require('path')
var config    = require(__dirname + `/../migrations/${configFile}.json`)
var db        = require(__dirname + '/../lib/db')

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var model = db.sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = db;
