'use strict'

var gulp = require('gulp')
var jscs = require('gulp-jscs')

gulp.task('jscs', function(done){
  return gulp.src([
    './lib/**.js',
    './routes/**.js',
    './index.js'
  ])
  .pipe(jscs());
})
