var gulp = require('gulp')
var mocha = require('gulp-mocha-co')

gulp.task('test', ['lint'], function() {
  gulp
    .src
    ( [ './tests/**/**.spec.js'
      ]
    )
    .pipe(mocha({
      reporter: 'list'
    }))
})
