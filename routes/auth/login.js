'use strict';

module.exports = function(app) {
  var utilities = require(app.rootDir + '/lib/utilities')(app);
  var User = require(app.rootDir + '/models').User;
  var Token = require(app.rootDir + '/models').Token;

  /**
   * Log a user in
   * @return {object} body
   * @swagger
   * /auth/login:
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
    var body = this.request.body;
    try {
      var user = yield User
        .findOne
        ( { where:
            { email: body.email
            }
          }
        );

      if (!user) {
        throw new Error('User does not exist');
      }

      var isMatch = user.validPassword(body.password);
      if (isMatch) {
        try {
          var token = utilities.genToken(user);
          var refresh = utilities.genRefresh();
          yield Token.create({
            token: token,
            refresh: refresh,
            userId: user.id
          });
          this.body =
            { token: token
            , refresh: refresh
            , type: 'bearer'
            };
        } catch (e) {
          throw e;
        }
      } else {
        throw new Error('Invalid email/password combination');
      }
    } catch (e) {
      this.status = 400;
      this.body =
        { error: true
        , msg: e.message
        };
    }
    return this.body;
  }

  /**
   * @swagger
   * definition:
   *   Login:
   *     required:
   *       - email
   *       - password
   *     properties:
   *       email:
   *         type: string
   *         description: Email address for user
   *       password:
   *         type: string
   *         description: Password for user
   *   LoginResponse:
   *     required:
   *       - jwt
   *       - refresh
   *       - type
   *       - expires
   *     properties:
   *       jwt:
   *         type: string
   *       refresh:
   *         type: string
   *       type:
   *         type: string
   *       expires:
   *         type: integer
   */

  return login;
};
