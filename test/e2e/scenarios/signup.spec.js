describe('SignUp Scenario:', function() {
  var path = require('path')
  var fs = require('fs')
  var env = require('node-env-file')
  var filename = module.filename.slice(
    __filename.lastIndexOf(path.sep)+1,
    module.filename.length -3
  ).split('.')[0];

  try {
    var envFile = fs.lstatSync(__dirname + `/${filename}.env`)

    if(envFile.isDirectory()) {
      throw new Error('NOT FOUND')
    }

    env(__dirname + `/${filename}.env`)
  } catch (e) {
    console.error('You have not provided a env file for this scenario. Tests may fail')
  }

  require(__dirname + '/../routes/auth/signup.spec')
  require(__dirname + '/../routes/users/deleteUser.spec')
})
