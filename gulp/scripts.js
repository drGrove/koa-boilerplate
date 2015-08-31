'use strict'

var gulp = require('gulp');

gulp.task('scripts', function() {
  return gulp.src([
    '**/**.js',
    '!db/'
  ])
})
