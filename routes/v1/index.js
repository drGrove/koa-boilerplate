'use strict'

var routes = function(){
  var r = require('koa-router')()
  var path = require('path')
  var fs = require('fs')
  var swaggerJSDoc = require('swagger-jsdoc')
  var config = require('../../lib/config')
  var DIR = __dirname.split('/')[__dirname.split('/').length - 1]

  r.get('/', function*(next){
    return this.body =
    { active: true
    , timestamp: new Date().getTime()
    }
  })

  function getDirectories(pathname) {
    return fs.readdirSync(pathname).filter(function(file){
      return fs.statSync(path.join(pathname, file)).isDirectory()
    })
  }

  var directories = getDirectories(__dirname)

  directories.forEach(function(dir){
    var paths = require('./' + dir)
    for(var method in paths) {
      for(var path in paths[method]) {
        var callback = paths[method][path]
        var dirPath = __dirname
        var version = dirPath.split('/').pop()
        var uri = '/' + dir + path
        r[method.toLowerCase()](uri, callback)
      }
    }
  })
  var isUnixHiddenPath = function(path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
  }

  var walk = function(dir, parent) {
    var results = []
    if(parent) {
      dir = parent + '/' + dir
    }
    var files = fs.readdirSync(dir)
    for(var idx in files) {
      var con = true
      var file = files[idx]
      try {
        var f = fs.lstatSync(dir + '/' + file)
        if(isUnixHiddenPath(file)) {
          throw new Error('hidden file')
        }
      } catch(e) {
        con = false
      }
      if(con) {
        if(f.isDirectory()) {
          results = results.concat(walk(file, dir))
        } else {
          results.push(dir + '/' + file)
        }
      }
    }
    return results
  }

  var specs = walk(__dirname);

  var swaggerOptions = {
    swaggerDefinition: {
      swagger: '2.0',
      info: {
        title: 'API Explorer', // Title (required)
        version: '1.0.0', // Version (required)
        contact: {
          name: '',
          url: ''
        },
      },
      host: config.app.host + ':' + config.app.port,
      basePath: config.app.namespace
    },
    apis: specs, // Path to the API docs
  };

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  var swaggerSpec = swaggerJSDoc(swaggerOptions);

  r.get('/docs.json', function*(next) {
    this.body = swaggerSpec
  });

  return r
}

module.exports = routes
