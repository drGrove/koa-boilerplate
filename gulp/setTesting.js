var gulp = require('gulp')

gulp.task('setTestingEnv', function() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'testing'
  }

  if (!process.env.PROJECT_ROOT) {
    process.env.PROJECT_ROOT = process.env.PWD
  }

  if (!process.env.APP_PORT) {
    process.env.APP_PORT = 88889
  }

  if (!process.env.LOGGING) {
    process.env.LOGGING = 'none'
  }
})
