'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var path = require('path');
var config = require('../config')

gulp.task('lint', function(done){
  return gulp.src(config.PATHS.JS)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});
