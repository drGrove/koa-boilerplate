'use strict'

module.exports = function(app) {
  var request = require('koa-request')
  var genErr = require(app.rootDir + '/lib/error')
  var User = require(__dirname + '/../users/model')



  function *unlink() {
    var provider = this.request.body.provider;
    var providers =
      [ 'facebook'
      //, 'foursquare'
      , 'google'
      , 'github'
      //, 'instagram'
      //, 'linkedin'
      //, 'live'
      //, 'twitter'
      //, 'twitch'
      //, 'yahoo'
      ];

    if (providers.indexOf(provider) === -1) {
      this.status = 400
      return this.body =
      { error: true
      , errNo: 400
      , errCode: 'INVALID_REQUEST'
      , msg: 'Invalid OAuth Provider supplied'
      }
    }
    var user = yield User.findById(this.auth.id)
    if (!user) {
      this.status = 400
      return this.body =
      { error: true
      , errCode: "NOT_FOUND"
      , errNo: 404
      , msg: "User Not Found"
      }
    }

    user[provider] = undefined;

    try {
      yield user.save()
      user = JSON.parse(JSON.stringify(user))
      delete user.password
      this.status = 200
      return this.body = user
    } catch (e) {
      this.status = 500
      return this.body =
      { error: true
      , errCode: "INTERNAL_SERVER_ERROR"
      , errNo: 500
      , msg: "Could not unlink account"
      }
    }
  }

  return unlink
}
