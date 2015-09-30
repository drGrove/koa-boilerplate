'use strict'

module.exports = function(app) {
  var request = require('koa-request')
  var qs = require('querystring')
  var User = require(__dirname + '/../users/model')
  var config = require(app.rootDir + '/lib/config')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var genErr = require(app.rootDir + '/lib/error')

  /**
   * @swagger
   * /auth/github:
   *  post:
   *    operationId: githubAuthV1
   *    summary: Authenticate user via github
   *    produces:
   *      - application/json
   *    security:
   *      - Authorization: []
   *    tags:
   *      - Auth
   *    responses:
   *      200:
   *        description: User authenticate or created via github
   *        schema:
   *          $ref: '#/definitions/LoginResponse'
   */
  function *github() {
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var params =
    { code: this.request.body.code
    , client_id: this.request.body.clientId
    , client_secret: config.oauth.github.clientSecret
    , redirect_uri: this.request.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    var accessTokenResponse = yield request
      ( { url: accessTokenUrl
        , method: 'GET'
        , qs: params
        }
      )
    var accessToken = qs.parse(accessTokenResponse.body).access_token;
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    var profileResponse = yield request
      ( { url: userApiUrl
        , method: 'GET'
        , qs:
          { access_token: accessToken
          }
        , headers: headers
        , json: true
        }
      )

    var profile = profileResponse.body
    // Step 3a. Link user accounts.
    if (this.request.headers.authorization) {
      var existingUser = yield User.findOne({
        where:
        { github: profile.id.toString()
        }
      })

      if(existingUser) {
        this.status = 409
        return this.body =
        { error: true
        , errCode: "AUTH_EXISTS"
        , errNo: "499"
        , msg: "There is already a GitHub account that belongs to you"
        }
      }
      var token = this.request.headers.authorization.split(' ')[1];
      var payload = jwt.verify(token, config.token_secret);
      var user = yield User.findById(payload.sub)

      if(!user) {
        this.status = 400
        return this.body =
        { error: true
        , errCode: 'NOT_FOUND'
        , errNo: 404
        , msg: 'User not found'
        }
      }
      user.github = profile.id.toString();
      user.displayName = user.displayName || profile.name;

      try {
        console.log('save user', user)
        yield user.save()
        return this.body =
        { token: token
        , type: 'bearer'
        }
      } catch (e) {
        this.status = 500
        return this.body =
        { error: true
        , errCode: 'INTERNAL_SERVER_ERROR'
        , errNo: 500
        , msg: 'could not save user'
        }
      }
    } else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({
        where:
        { github: profile.id
        }
      })

      if (existingUser) {
        var token = genToken(existingUser)
        var refresh = genRefresh()

        yield Token.create({
          token: token,
          refresh: refresh,
          userId: existingUser.id
        })

        return this.body =
        { token: token
        , refresh: refresh
        , type: 'bearer'
        }
      }
      var user = yield User.create({
        github: profile.id,
        displayName: profile.name,
        email: profile.email
      });

      var user = yield User.findOne({
        where:
        { github: profile.id
        }
      })

      var token = genToken(existingUser)
      var refresh = genRefresh()

      yield Token.create({
        token: token,
        refresh: refresh,
        userId: existingUser.id
      })

      return this.body =
      { token: token
      , refresh: refresh
      , type: 'bearer'
      }
    }
  }

  return github
}
