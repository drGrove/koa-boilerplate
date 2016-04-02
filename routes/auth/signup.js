'use strict';

module.exports = function(app) {
  var utilities = require(app.rootDir + '/lib/utilities')(app);
  var logger = require(app.rootDir + '/lib/logger');
  var User = require(app.rootDir + '/models').User;
  var Role = require(app.rootDir + '/models').Role;
  var Token = require(app.rootDir + '/models').Token;

  /**
   *  Sign up a user
   *  @return {object} body
   *  @swagger
   *  /auth/signup:
   *    post:
   *      operationId: signUpV1
   *      summary: Sign up a user
   *      produces:
   *        - application/json
   *      parameters:
   *        - name: signup
   *          in: body
   *          required: true
   *          description: sign up object
   *          schema:
   *            $ref: '#/definitions/SignUp'
   *      tags:
   *        - Auth
   *      responses:
   *        200:
   *          description: Bearer token
   *          schema:
   *            $ref: '#/definitions/LoginResponse'
   */
  function *signup() {
    var existingUser = yield User.findOne({
      where:
      { email: this.request.body.email
      }
    });

    if (existingUser) {
      this.status = 409;
      this.body =
        { error: true
        , errNo: 409
        , errCode: 'PROPERTY_CONFLICT'
        , msg: 'Email address already in use'
        };
      return this.body;
    }

    if (!this.request.body) {
      this.status = 400;
      this.body =
        { error: true
        , errNo: 400
        , errCode: 'INVALID_REQUEST'
        , msg: 'Fields missing'
        };
      return this.body;
    }

    let user;
    let role;
    try {
      user = yield User.create(this.request.body);

      user = yield User.findOne({
        where:
        { email: this.request.body.email
        },
        include:
        [ { model: Role
          }
        ]
      });

      role = yield Role.findById(3);
      let userRole = yield user
        .addRole
          ( role
          , { userId: user.id
            }
          );
      if (!userRole) {
        throw new Error('Association not created');
      }

      user = JSON.parse(JSON.stringify(user));
      delete user.password;
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
      logger.error('Error - User Creation: ', e.errors || e.message || e);
      var userId = user.id;
      var didDestroy = yield user.destroy({force: true});
      if (!didDestroy) {
        logger
          .error
            ( `ERROR - Destruction of User could not be completed.
              Excess data may exist for ${userId}`
            );
      }
      this.status = 500;
      this.body =
        { error: true
        , msg: e.errors || 'Could not create user'
        };
    }
    return this.body;
  }

  return signup;
};
