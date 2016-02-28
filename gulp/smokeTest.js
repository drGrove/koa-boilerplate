var gulp = require('gulp')
var mocha = require('gulp-mocha')
var minimist = require('minimist')
var path = require('path')
var fs = require('fs')
var env = require('node-env-file')

gulp.task('smokeTest', ['lint'], function() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'testing'
  var projectRoot = __dirname.split('/')
  projectRoot.pop()
  projectRoot = projectRoot.join('/')
  process.env.PROJECT_ROOT = projectRoot

  var testSuites = require(projectRoot + '/test/e2e/suites.json')

  var options = minimist(process.argv.slice(2), {})

  process.env.MOCHA_SUITES = options.suites ? options.suites : 'all'

  gulp
    .src
    ( [ './test/e2e/suiteRunner.js'
      ]
    )
    .pipe(mocha({
      ignoreLeaks: true
    }).on('error', function(){
      // do nothing
    }))
    .once('end', function() {
      process.exit()
    })
})
