'use strict'

var gulp = require('gulp');

gulp.task('watch', ['test'], function() {
  gulp
    .watch
    ( [ './index.js'
      , './routes/**/**.js'
      , './lib/**/**.js'
      , './tests/**/**.spec.js'
      ]
    , [ 'test'
      ]
    )
})
