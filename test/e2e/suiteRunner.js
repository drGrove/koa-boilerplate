describe('Suites:', function() {
  var path = require('path')
  var fs = require('fs')
  var env = require('node-env-file')

  var requestSuites = process.env.MOCHA_SUITES

  var allSuites = require(__dirname + '/suites.json')
  var suites = {}

  if(requestSuites === 'all') {
    suites = allSuites
  } else {
    requestSuites = requestSuites.split(',')
    for(var i = 0; i < requestSuites.length; i++) {
      var key = requestSuites[i]
      suites[key] = allSuites[key]
    }
  }

  for(var key in suites) {
    describe(key + ' Scenario:', function() {
      var suite = suites[key]
      // Pull in ENVS
      var envs = suite.env
      for(var i = 0; i < envs.length; i++) {
        var e = envs[i]
        env(__dirname + `/env/${e}.env`)
      }

      var steps = suite.steps
      for(var i = 0; i < steps.length; i++) {
        var s = steps[i]
        step(s.name, function() {
          require(__dirname + `/routes/${s.spec}.spec`)
        })
      }
    })
  }

})