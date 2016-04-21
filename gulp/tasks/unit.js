var gulp = require('gulp');
var mocha = require('gulp-mocha');
var config = require('../config');

gulp.task('unit', ['lint'], function() {
  var projectRoot = __dirname.split('/')
  projectRoot.pop()
  projectRoot = projectRoot.join('/')
  process.env.PROJECT_ROOT = projectRoot
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'testing'
  }
  gulp
    .src(config.PATHS.UNIT_TESTS)
    .pipe(mocha({
      ignoreLeaks: true,
      coverage: true,
      globals: {
        expect: require('expect'),
        co: require('co')
      }
    }).on('error', function(){
      // do nothing
    }))
    .once('end', function() {
      process.exit()
    })
})
