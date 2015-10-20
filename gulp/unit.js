var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('unit', ['lint'], function() {
  gulp
    .src
    ( [ './test/unit/**/**.spec.js'
      ]
    )
    .pipe(mocha({
      reporter: 'list',
      ignoreLeaks: true
    }).on('error', function(){
      // do nothing
    }))
})
