'use strict'

module.exports = function(app) {
  var User = require(__dirname + '/../users/model')(app)
  var Role = require(__dirname + '/../roles/model')(app)
  var utilities = require(app.rootDir + '/lib/utilities')(app)
  var Token = require(app.rootDir + '/lib/models/tokens')
  var UserRole = require(app.rootDir + '/lib/models/userRoles')
  var logger = require(app.rootDir + '/lib/logger')

  User
    .belongsToMany
    ( Role
    , { through:
        { model: UserRole
        , foreignKey: 'userId'
        }
      }
    )
  Role
    .belongsToMany
    ( User
    , { through:
        { model: UserRole
        , foreignKey: 'roleId'
        }
      }
    )

  /**
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
    })

    if(existingUser) {
      this.status = 409
      return this.body =
      { error: true
      , errNo: 409
      , errCode: "PROPERTY_CONFLICT"
      , msg: "Email address already in use"
      }
    }

    try {
      var user = yield User.create(this.request.body)

      var user = yield User.findOne({
        where:
        { email: this.request.body.email
        },
        include:
        [ { model: Role
          }
        ]
      })

      var role = yield Role.findById(3)
      yield UserRole.create({userId: user.id, roleId: role.id})

      user = JSON.parse(JSON.stringify(user))
      delete user.password;
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
      logger.error('Error: ', e)
      this.status = 500
      return this.body =
      { error: true
      , msg: e.errors || 'Could not create user'
      }
    }
  }

  return signup
}
