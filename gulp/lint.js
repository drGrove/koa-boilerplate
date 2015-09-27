'use strict'

var gulp = require('gulp')
var jscs = require('gulp-jscs')
var jshint = require('gulp-jshint')
var stylish = require('gulp-jscs-stylish')

const pkg = require(__dirname + '/../package.json')

function noop() {

}

gulp.task('lint', function(done){
  return gulp.src([
    './lib/**.js',
    './routes/**.js',
    './index.js',
    './tests/**/**.spec.js'
  ])
  .pipe(jshint(pkg.jshintConfig))
  .pipe(jscs(pkg.jscsConfig))
  .on('error', noop)
  .pipe(stylish.combineWithHintResults())
  .pipe(jshint.reporter('jshint-stylish', {verbose: true}));
})
