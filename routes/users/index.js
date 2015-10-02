'use strict'
module.exports = function(app){
  var User = require(__dirname + '/model')(app)
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')

  var routeConfig =
  { "GET":
    { "":
      [ ensureAuth
      , all
      ]
    , "/:id":
      [ ensureAuth
      , byId
      ]
    }
  , "POST":
    { "/":
      [ ensureAuth
      , create
      ]
    }
  , "PUT":
    { "/:id":
      [ ensureAuth
      , update
      ]
    }
  , "DELETE":
    { "/:id":
      [ ensureAuth
      , remove
      ]
    }
  }

  return routeConfig;

  /**
   * @swagger
   * /users:
   *  get:
   *    operationId: listUsersV1
   *    summary: List Users
   *    produces:
   *     - application/json
   *    tags:
   *     - Users
   *    security:
   *     - Authorization: []
   *    responses:
   *      200:
   *        description: Users get all
   *        schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/User'
   */
  function *all() {
    try {
      var users = JSON.parse(
          JSON.stringify(
            yield User.findAll({})
          )
        )
      for (var i = 0; i < users.length; i++) {
        delete users[i].password;
      }
      this.status = 200
      return this.body = users
    } catch (e) {
      console.error('Error: ', e.stack || e)
      this.status = 500
      return this.body =
      { error: true
      , msg: 'Error returning users'
      , develeoperMsg: e.message
      }
    }
  }
  /**
   * @swagger
   * /users:
   *   post:
   *     operationId: createUsersV1
   *     summary: Creates a new User.
   *     produces:
   *      - application/json
   *     tags:
   *      - Users
   *     security:
   *       - Authorization: []
   *     parameters:
   *       - name: User
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/NewUser'
   *     responses:
   *       200:
   *         description: Creates a user
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *create() {
    var body = this.request.body
    body.level = 1;
    try {
      var res = yield User.create(body);
      console.log('Res: ', res)
      this.status = 201
      delete res.password
      return this.body = res;
    } catch (e) {
        this.status = 400;
        return this.body =
        { error: true
        , msg: e.errors || 'Invalid Input'
        }
      /*
      } else {
        console.error('Error: ', e)
        this.status = 400;
        return this.body =
        { error: true
        , msg: 'Error creating user'
        , develeoperMsg: e.message
        }
      }
      */
    }
    this.body = body
  }


  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     operationId: listUserByIdV1
   *     summary: List User by id
   *     parameters:
   *       - name: id
   *         in: path
   *         type: integer
   *         required: true
   *         description: ID of user to fetch
   *     tags:
   *      - Users
   *     responses:
   *       200:
   *         description: Users by ID
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *byId() {
    if(this.params.id === 'me') {
      yield me(this)
    } else {
      try {
        var user = JSON.parse(
            JSON.stringify(
              yield User.findById(
                this.params.id
              )
            )
          )
        delete user.password
        this.body = user
      } catch (e) {
        switch(e.name) {
          case "TypeError":
            this.status = 404;
            break;
          default:
            this.status = 500
            this.body =
            { error: true
            , msg: e.message
            }
        }
      }
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     operationId: updateUserV1
   *     summary: Update user by id
   *     tags:
   *       - Users
   *     security:
   *       - Authorization: []
   *     parameters:
   *       - name: id
   *         in: path
   *         type: integer
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: Update user by id
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *update() {
    var body = this.request.body
    try {
      var user = yield User.findById(this.params.id)
      if(!user) {
        var user = yield User.find({
          where: {id: this.params.id},
          paranoid: false
        })
      }
      for(let key in body) {
        if(body.hasOwnProperty(key) && key !== "id") {
          user[key] = body[key]
        }
      }
      if(user.deletedAt && user.isActive) {
        yield user.restore()
      }
      yield user.save()
      user = JSON.parse(JSON.stringify(user))
      delete user.password
      return this.body = user
    } catch (e) {
      console.error('Error: ', e.stack)
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     operationId: deleteUserV1
   *     summary: Remove User by id
   *     tags:
   *       - Users
   *     parameters:
   *       - name: id
   *         type: integer
   *         in: path
   *         required: true
   *         description: User ID
   *     security:
   *       - Authorization: []
   *     responses:
   *       204:
   *         description: Delete user by id
   */
  function *remove() {
    try {
      var user = yield User.findById(this.params.id)
      user.isActive = false
      yield user.save()
      yield user.destroy()
      return this.status = 204
    } catch (e) {
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }

  /**
   *  @swagger
   *  /users/me:
   *    get:
   *      operationId: getMeV1
   *      summary: Get the current logged in user information
   *      tags:
   *        - Users
   *      security:
   *        - Authorization: []
   *      responses:
   *        200:
   *          description: User object
   *          $ref: '#/definitions/User'
   *        401:
   *          description: Not Authorized
   *          $ref: '#/definitions/GeneralError'
   */
  function *me(that) {
    var user = JSON.parse(
      JSON.stringify(
        yield User.findById(that.auth.id)
      )
    )

    delete user.password
    that.body = user
    return that
  }

}
