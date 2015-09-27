'use strict'

module.exports = function(app) {
  var User = require(__dirname + '/../users/model')(app)
  var Role = require(__dirname + '/../roles/model')(app)
  var utilities = require(app.rootDir + '/lib/utilities')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var UserRole = require(app.rootDir + '/lib/models/userRoles')

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
      console.log('User: ', user)
      var role = Role.findById(3)
      yield user.addRole(role, {userId: user.id});

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
      console.error('Error: ', e)
      this.status = 500
      return this.body =
      { error: true
      , msg: e.errors || 'Could not create user'
      }
    }
  }

  return signup
}
