'use strict'

var gulp = require('gulp');
var config = require('../config');

gulp.task('scripts', function() {
  return gulp.src(config.PATHS.ALL_JS)
})
