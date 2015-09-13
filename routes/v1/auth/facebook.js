'use strict'

module.exports = function(app) {
  var request = require('koa-request')
  var qs = require('querystring')
  var User = require(__dirname + '/../users/model')
  var config = require(app.rootDir + '/lib/config')
  var utilities = require(app.rootDir + '/lib/utilities')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var genErr = require(app.rootDir + '/lib/error')

  /**
   * @swagger
   * /v1/auth/facebook:
   *   get:
   *     operationId: facebookAuthV1
   *     summary: Auth with Login
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Login via Google Successful
   *         $ref: '#/definitions/LoginResponse'
   */
  function *facebook() {
    var accessTokenUrl = 'https://graph.facebook.com/v2.4/oauth/access_token'
    var graphApiUrl = 'https://graph.facebook.com/v2.4/me'
    var params =
    { code: this.request.body.code
    , client_id: this.request.body.clientId
    , client_secret: config.oauth.facebook.clientSecret
    , redirect_uri: this.request.body.redirectUri
    }

    var accessTokenResponse = yield request
      ( { url: accessTokenUrl
        , method: 'GET'
        , qs: params
        , json: true
        }
      )

    if(accessTokenResponse.statusCode != 200) {
      console.error('Error connecting to facebook - access token')
      this.status = 500
      return this.body =
        { error: true
        , errNo: 500
        , errCode: "EXTERNAL_SERVICE_ISSUE"
        , msg: "Could not connect to Facebook"
        }
    }

    var accessToken = qs.parse(accessTokenResponse.body).access_token

    var profileResponse = yield request
      ( { url: graphApiUrl
        , method: 'GET'
        , qs:
          { access_token: accessToken
          , fields: 'email,name'
          }
        , json: true
        }
      )

    if(profileResponse.statusCode != 200) {
      console.error('Error connecting to facebook - profile')
      this.status = 500
      return this.body =
        { error: true
        , errNo: 500
        , errCode: "EXTERNAL_SERVICE_ISSUE"
        , msg: "Could not connect to Facebook"
        }
    }

    var profile = profileResponse.body

    if(this.request.headers.authorization) {
      // If user logged in.
      var user = yield User.findOne({
        where:
        { facebook: profile.id
        }
      })

      if(user) {
        this.status = 409
        return this.body =
        { error: true
        , errNo: 409
        , errCode: 'AUTH_EXISTS'
        , msg: 'There is already a Facebook account that belongs to you'
        }
      }

      var token = this.request.headers.authorization.split(' ')[1]
      var payload = jwt.verify(token, config.token_secret)
      var user = yield User.findById(payload.sub)

      if(!user) {
        this.status = 400
        return this.body =
        { error: true
        , errNo: 400
        , errCode: "NOT_FOUND"
        , msg: "User not found"
        }
      }

      user.facebook = profile.id
      user.displayName = user.displayName || profile.name
      try {
        yield user.save()
        this.status = 200;
        var token = utilities.genToken(user)
        var refresh = utilities.genRefresh()
        yield Token.create({
          token: token,
          refresh: refresh,
          userId: user.id
        })
        return this.body =
        { token: token
        , refresh: refresh
        , type: 'bearer'
        }

      } catch (e) {
        this.status = 500
        return this.body = genErr('INTERNAL_SERVER_ERROR')
      }
    } else {
      // Create a new user or return existing
      var existingUser = yield User.findOne({
        where:
        { facebook: profile.id
        }
      })

      if(existingUser) {
        var token = utilities.genToken(user)
        var refresh = utilities.genRefresh()
        yield Token.create({
          token: token,
          refresh: refresh,
          userId: user.id
        })
        return this.body =
        { token: token
        , refresh: refresh
        , type: 'bearer'
        }
      }

      var user = yield User.create({
        facebook: profile.id,
        displayName: profile.name,
        firstname: profile.name.split(' ')[0],
        lastname: profile.name.split(' ')[1],
        email: profile.email
      })

      var user = yield User.findOne({
        where:
        { facebook: profile.id
        }
      })

      var token = utilities.genToken(user)
      var refresh = utilities.genRefresh()

      yield Token.create({
        token: token,
        refresh: refresh,
        userId: user.id
      })

      return this.body =
      { token: token
      , refresh: refresh
      , type: 'bearer'
      }
    }

  }

  return facebook
}
