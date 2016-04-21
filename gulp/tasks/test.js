var gulp = require('gulp')
var mocha = require('gulp-mocha')
var minimist = require('minimist')
var path = require('path')
var fs = require('fs')
var env = require('node-env-file');
var config = require('../config');
var projectRoot;

function setUnit(files, mochaOpts) {
  files.push(config.PATHS.UNIT_TESTS)
  var opts =
    { ignoreLeaks: true
    , coverage: true
    , globals:
      { expect: require('expect')
      , co: require('co')
      }
    }
  mochaOpts = Object
    .assign
      ( {}
      , mochaOpts
      , opts
      )
}

function setSmoke(files, mochaOpts) {
  var testSuites = require(projectRoot + '/test/e2e/suites.json')
  var options = minimist(process.argv.slice(2), {})
  process.env.MOCHA_SUITES = options.suites ? options.suites : 'all'

  files.push(config.PATHS.SUITE_RUNNER)

  var opts =
    { ignoreLeaks: true
    , require:
      [ 'mocha-steps'
      ]
    }

  mochaOpts = Object
    .assign
      ( {}
      , mochaOpts
      , opts
      )
}


gulp.task('test', ['lint'], function(target) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'testing'
  projectRoot = __dirname.split('/')
  projectRoot.pop()
  projectRoot = projectRoot.join('/')
  process.env.PROJECT_ROOT = projectRoot
  target = target || 'all'

  var files = []
  var mochaOpts = {}

  switch(target) {
    case 'unit':
      setUnit(files, mochaOpts)
      break;
    case 'smoke':
      setSmoke(files, mochaOpts)
      break;
    default:
      setUnit(files, mochaOpts)
      setSmoke(files, mochaOpts)
  }

  gulp
    .src
    ( files
    )
    .pipe(mocha({
      ignoreLeaks: true,
      require:
      [ 'mocha-steps'
      ]
    }).on('error', function(){
      // do nothing
    }))
    .once('end', function() {
      process.exit()
    })
})
