var gulp = require('gulp')
var mocha = require('gulp-mocha-co')

gulp.task('test', function() {
  gulp.src([
    './test/unit/**/**.spec.js'
  ])
    .pipe(mocha())
})
