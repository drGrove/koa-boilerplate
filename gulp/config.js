module.exports = {
  pkg: require('../package.json'),
  PATHS: {
    JS: [
      './index.js',
      './lib/**/**.js',
      './routes/**/**.js',
      './test/**/**.spec.js',
      './models/**.js'
    ],
    ALL_JS: [
      '**/**.js',
      '!db/'
    ],
    SUITE_RUNNER: './test/e2e/suiteRunner.js',
    UNIT_TESTS: './test/unit/**/**.spec.js'
  }
}
