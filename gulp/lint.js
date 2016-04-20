'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var path = require('path');
const pkg = require(path.join(__dirname, '/../package.json'));

gulp.task('lint', function(done){
  return gulp.src([
    './index.js',
    './lib/**/**.js',
    './routes/**/**.js',
    './test/**/**.spec.js',
    './models/**.js'
  ])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});
