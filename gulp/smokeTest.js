var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('smokeTest', ['lint'], function() {
  gulp
    .src
    ( [ './test/e2e/scenarios/**/**.spec.js'
      ]
    )
    .pipe(mocha({
      reporter: 'list',
      ignoreLeaks: true
    }).on('error', function(){
      // do nothing
    }))
})
