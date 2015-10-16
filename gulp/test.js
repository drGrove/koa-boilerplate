var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('test', ['lint'], function() {
  gulp
    .src
    ( [ './test/**/**.spec.js'
      ]
    )
    .pipe(mocha({
      reporter: 'list',
      ignoreLeaks: true
    }).on('error', function(){
      // do nothing
    }))
})
