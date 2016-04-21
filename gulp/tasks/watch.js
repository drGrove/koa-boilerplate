'use strict'

var gulp = require('gulp');
var config = require('../config');

gulp.task('watch', ['test'], function() {
  gulp.watch(config.PATHS.JS, ['test']);
})
