'use strict'

var routes = function(app) {
  var r = require('koa-router')()
  var compose = require('koa-compose')
  var path = require('path')
  var fs = require('fs')
  var swaggerJSDoc = require('swagger-jsdoc')
  var config = require(app.rootDir + '/lib/config')

  r.get('/', function*() {
    this.body =
    { active: true
    , timestamp: new Date().getTime()
    }

    return this.body
  })

  function getDirectories(pathname) {
    return fs.readdirSync(pathname).filter( function(file) {
      return fs.statSync(path.join(pathname, file)).isDirectory()
    })
  }

  var directories = getDirectories(__dirname)

  directories.forEach( function(dir) {
    var paths = require('./' + dir)(app)
    for (var method in paths) {
      for (var path in paths[method]) {
        var args = paths[method][path]
        var uri = '/' + dir + path
        if (Array.isArray(args)) {
          r[method.toLowerCase()](uri, compose(args))
        } else {
          r[method.toLowerCase()](uri, args)
        }
      }
    }
  })

  /**
   *
   */
  var isUnixHiddenPath = function(path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
  }

  var walk = function(dir, exclusions, parent) {
    var results = []
    if (parent) {
      dir = parent + '/' + dir
    }

    var excludedFileTypes =
    [ 'md'
    , 'json'
    , 'sql'
    , 'log'
    , 'env'
    , 'production'
    , 'development'
    , 'testing'
    , 'local'
    ]

    var files = fs.readdirSync(dir)
    for (var idx in files) {
      var con = true
      var file = files[idx]
      try {
        if (isUnixHiddenPath(file)) {
          throw new Error('hidden file')
        }

        var isExcluded = excludedFileTypes.indexOf(
            file.split('.')[file.split.length - 1]
          ) !== -1

        if (isExcluded) {
          throw new Error('unsupported type')
        }

        if (exclusions.indexOf(dir + '/' + file) > -1) {
          throw new Error('excluded file')
        }
      } catch (e) {
        con = false
      }
      if (exclusions.indexOf(dir) !== -1) {
        con = false
      }
      if (con) {
        let f = fs.lstatSync(dir + '/' + file)
        if (f.isDirectory()) {
          results = results.concat(walk(file, exclusions, dir))
        } else {
          results.push(dir + '/' + file)
        }
      }
    }
    return results
  }

  var specs = walk
    ( app.rootDir
    , [ app.rootDir + '/db'
      , app.rootDir + '/node_modules'
      , app.rootDir + '/public'
      , app.rootDir + '/gulp'
      , app.rootDir + '/gulpfile.js'
      , app.rootDir + '/migrations'
      , app.rootDir + '/tests'
      , app.rootDir + '/LICENSE'
      ]
    );

  var swaggerOptions =
  { swaggerDefinition:
    { swagger: '2.0'
    , info:
      { title: 'API Explorer' // Title (required)
      , version: '1.0.0' // Version (required)
      , contact:
        { name: ''
        , url: ''
        }
      }
    , host: config.app.domain + ':' + config.app.port
    , basePath: config.app.namespace
    }
  , apis: specs // Path to the API docs
  };

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  var swaggerSpec = swaggerJSDoc(swaggerOptions);

  r.get('/docs.json', function*() {
    this.body = swaggerSpec
  });


  return r
}

module.exports = routes
