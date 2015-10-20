var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('smokeTest', ['lint'], function() {

  process.env.USER_EMAIL = "josdafj@example.com"
  process.env.USER_PASSWORD = "qwerty"

  gulp
    .src
    ( [ './test/e2e/scenarios/**/**.spec.js'
      ]
    )
    .pipe(mocha({
      ignoreLeaks: true
    }).on('error', function(){
      // do nothing
    }))
})
