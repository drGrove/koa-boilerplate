'use strict'
module.exports = function(app) {
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')
  var signup = require(__dirname + '/signup')(app)
  var login = require(__dirname + '/login')(app)
  var logout = require(__dirname + '/logout')(app)
  var refresh = require(__dirname + '/refresh')(app)
  var google = require(__dirname + '/google')(app)
  var facebook = require(__dirname + '/facebook')(app)
  var github = require(__dirname + '/github')(app)
  var linkedin = require(__dirname + '/linkedin')(app)
  var unlink = require(__dirname + '/unlink')(app)

  var routeConfig =
  { "POST":
    { "/signup": signup
    , "/login": login
    , "/google": google
    , "/facebook": facebook
    , "/github": github
    , "/linkedin": linkedin
    , "/unlink":
      [ ensureAuth
      , unlink
      ]
    }
  , "GET":
    { "/logout":
      [ ensureAuth
      , logout
      ]
    , "/refresh":
      [ ensureAuth
      , refresh
      ]
    }
  }


    return routeConfig;
}
