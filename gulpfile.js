'use strict';

var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync('./gulp/tasks').filter(function(file){
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file){
  require('./gulp/tasks/' + file);
});

gulp.task('default', ['test']);
