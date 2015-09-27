var gulp = require('gulp')
var mocha = require('gulp-mocha-co')

gulp.task('test', ['lint'], function() {
  gulp
    .src
    ( [ './tests/unit/**/**.spec.js'
      ]
    )
    .pipe(mocha({ reporter: 'nyan'}))
})
