'use strict'
module.exports = function(app) {
  var jwt = require('jsonwebtoken')
  var crypto = require('crypto')
  var request = require('koa-request')
  var jwt = require('jsonwebtoken')
  var qs = require('querystring')
  var User = require(__dirname + '/../users/model')
  var config = require(app.rootDir + '/lib/config')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var genErr = require(app.rootDir + '/lib/error')
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')

  var routeConfig =
  { "POST":
    { "/login": login
    , "/google": google
    , "/facebook": facebook
    , "/github": github
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

  /**
   * @name genToken
   * @function
   * @param {Object} user - The current user
   * @returns {Object} token - Signed JWT Token
   */
  function genToken(user) {
    var now = Date.now()
    // Expire in 14 days
    var expires = now + (1000 * 60 * 60 * 24 * 14)
    var mins = (expires - now) / 1000 / 60
    var payload =
    { sub: user.id
    , iat: now
    , exp: expires
    }
    return jwt
      .sign
      ( payload
      , config.token_secret
      , mins
      )
  }

  /**
   * @name genRefresh
   * @function
   * @returns {string} token - Refresh Token
   */
  function genRefresh() {
    try {
      return crypto.randomBytes(config.token_length).toString('hex')
    } catch (e) {
      throw e
    }
  }

  /**
   * @swagger
   * /v1/auth/login:
   *  post:
   *    operationId: loginUserV1
   *    summary: Login User
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: login
   *        in: body
   *        required: true
   *        description: Login user parameters
   *        schema:
   *          $ref: '#/definitions/Login'
   *    security:
   *      - Authorization:
   *        - write:users
   *    tags:
   *      - Auth
   *    responses:
   *      200:
   *        description: User logged out
   *        schema:
   *          $ref: '#/definitions/LoginResponse'
   */

  function *login() {
    var body = this.request.body
    try {
      let user = yield User
        .findOne
        ( { email: body.email
          }
        )
      var isMatch = user.validPassword(body.password)
      if(isMatch) {
        try {
          var token = genToken(user)
          var refresh = genRefresh()
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
          throw e
        }
      } else {
        throw new Error('Invalid email/password combination')
      }
    } catch (e) {
      this.status = 400
      this.body =
      { error: true
      , msg: e.message
      }
    }
  }

  /**
   * @swagger
   * /v1/auth/logout:
   *  get:
   *    operationId: logoutUserV1
   *    summary: Logout Current User
   *    produces:
   *      - application/json
   *    security:
   *      - Authorization: []
   *    tags:
   *      - Auth
   *    responses:
   *      200:
   *        description: User logged out
   */
  function *logout() {
    try {
      var token = yield Token.findOne({
        userId: this.auth.id,
        token: this.request.headers.authorization.split(' ')[1]
      })
      yield token.destroy()
      this.status = 200
      this.body =
      { msg: "Successfully logged out"
      }
    } catch (e) {
      this.status = 500;
      this.body =
      { error: true
      , msg: e.errors || e.message
      , errNo: 500
      , errCo: "INTERNAL_SERVICE_ERROR"
      }
    }
  }

  /**
   * @swagger
   * /v1/auth/refresh:
   *   get:
   *     operationId: refreshAuthTokenV1
   *     summary: Refresh User Auth token
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     security:
   *       - Authorization: []
   *     responses:
   *       200:
   *         description: Refresh and Bearer Token
   *         schema:
   *          $ref: '#/definitions/LoginResponse'
   *       403:
   *         description: Token Expiration
   *         schema:
   *          $ref: '#/definitions/TokenExpired'
   *       500:
   *        description: Internal Server Error
   *        schema:
   *          $ref: '#/definitions/InternalServerError'
   */
  function *refresh() {
    try {
      var token = yield Token.findOne({
        where:
        { userId: this.auth.id
        , token: this.request.headers.authorization.split(' ')[1]
        }
      })
      if(token) {
        yield token.destory()
      } else {
        throw new Error('TOKEN_EXPIRED')
      }
    } catch (e) {
      if(e.message === 'TOKEN_EXPIRED') {
        this.status = 403
        return this.body = genErr('TOKEN_EXPIRED')
      }
    }
  }

  /**
   * @swagger
   * definition:
   *   Login:
   *     required:
   *       - username
   *       - password
   *     properties:
   *       email:
   *         type: string
   *         description: Email address for user
   *       password:
   *         type: string
   *         description: Password for user
   *   LoginResponse:
   *     properties:
   *       jwt:
   *         type: string
   *       refresh:
   *         type: string
   *       type:
   *         type: string
   *       expires:
   *         type: integer
   *         format: int64
   */

  /**
   * @swagger
   * /v1/auth/google:
   *   get:
   *     operationId: googleAuthV1
   *     summary: Auth with Google
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Login via Google Successful
   *         $ref: '#/definitions/LoginResponse'
   */
  function *google() {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token'
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect'
    var params =
    { code: this.request.body.code
    , client_id: this.request.body.clientId
    , client_secret: config.oauth.google.clientSecret
    , redirect_uri: this.request.body.redirectUri
    , grant_type: 'authorization_code'
    }

    // Exchange authorization code for access token.
    var accessTokenRequest = yield request
    ( { method: 'POST'
      , url: accessTokenUrl
      , json: true
      , form: params
      }
    )
    var accessToken = accessTokenRequest.body.access_token
    var headers =
    { Authorization: 'Bearer ' + accessToken
    }

    // Retrieve profile imformation about the current user
    var personApi = yield request
    ( { url: peopleApiUrl
      , method: 'GET'
      , headers: headers
      , json: true
      }
    )

    var profile =  personApi.body
    if(profile.error) {
      this.status = 500
      return this.body =
      { message: profile.error.message
      }
    }

    // If the user is authed
    if(this.request.headers.authorization) {
      var user = yield User.findOne({where: {google: profile.sub}})
      if(user) {
        this.status = 409
        return this.body =
        { msg: 'There is already a Google account that belongs to you'
        }
      }

      var token = this.request.headers.authorization.split(' ')[1];
      try {
        var payload = jwt.verify(token, config.token_secret)
      } catch (e) {
        this.status = 401;
        return this.body = genErr('NO_AUTH')
      }

      var user = yield User.findById(payload.sub)
      user.google = profile.sub
      user.displayName = user.displayName || profile.name
      try {
        yield user.save()
        var token = genToken(user)
        var refresh = genRefresh()
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
        return this.body =
        { error: true
        , msg: 'Could not apply google id to user account'
        }
      }
    } else {
      // Create new user account or return an existing user
      var user = yield User.findOne({google: profile.sub})
      if(user) {
        var token = genToken(user)
        var refresh = genRefresh()
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

      try {
        yield User.create
        ( { google: profile.sub
          , displayName: profile.name
          , email: profile.email
          , firstname: profile.given_name
          , lastname: profile.family_name
          , username: profile.profile.split('+')[1]
          }
        )
        var user = yield User.findOne({where: {google: profile.sub}})
        var token = genToken(user)
        var refresh = genRefresh()

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
        return this.body =
        { error: true
        , msg: 'Could not create user. Please try again'
        }
      }
    }
  }

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
        var token = genToken(user)
        var refresh = genRefresh()
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
        var token = genToken(user)
        var refresh = genRefresh()
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

      var token = genToken(user)
      var refresh = genRefresh()

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

  /**
   * @swagger
   * /v1/auth/github:
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


  return routeConfig;
}
