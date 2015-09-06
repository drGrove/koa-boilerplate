'use strict'
module.exports = function(app) {
  var jwt = require('jsonwebtoken')
  var crypto = require('crypto')
  var User = require(__dirname + '/../users/model')
  var config = require(app.rootDir + '/lib/config')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var genErr = require(app.rootDir + '/lib/error')
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')

  var routeConfig =
  { "POST":
    { "/login": login
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
   * /v1/auth/login:
   *  post:
   *    operationId:loginUserV1
   *    accepts:
   *      - application/json
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: login
   *        in: body
   *        required: true
   *        description: Login user parameters
   *        schema:
   *          $ref: '#/definitions/Login'
   *    tags:
   *     - Auth
   *    responses:
   *      200:
   *        description: User logged in
   *        schema:
   *          type: object
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
   *     responses:
   *       200:
   *         description: Refresh and Bearer Token
   *         schema: object
   *         $ref: '#/definitions/LoginReponse'
   */
  function *refresh() {
    try {
      var token = yield Token.findOne({
        where:
        { userId: this.auth.id
        , token: this.request.headers.authorization.split(' ')[1]
        }
      })
      console.log('Token: ', token)
      if(token) {
        yield token.destory()
      } else {
        throw new Error('TOKEN_EXPIRED')
      }
    } catch (e) {
      if(e.message === 'TOKEN_EXPIRED') {
        this.status = 400
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
   *         description: Expiration in minutes
   */

  return routeConfig;
}
