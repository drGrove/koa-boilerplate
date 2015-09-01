var gulp = require('gulp')
var mocha = require('gulp-mocha-co')

gulp.task('test', function() {
  gulp.src([
    '*.spec.js',
    './lib/**/**.spec.js',
    './routes/**/**.spec.js'
  ])
    .pipe(mocha())
})
