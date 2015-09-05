'use strict'
module.exports = function(app) {
  var Roles = require(__dirname + '/model')
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')

  var routeConfig =
  { "GET":
    { "/":
      [ all
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
   * /v1/roles:
   *  get:
   *    operationId: listRolesV1
   *    summary: List Roles
   *    produces:
   *     - application/json
   *    tags:
   *     - Roles
   *    responses:
   *      200:
   *        description: Roles get all
   *        schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/Role'
   */
  function *all() {
    try {
      var roles = JSON.parse(
          JSON.stringify(
            yield Roles.findAll({})
          )
        )
      this.status = 200
      return this.body = roles
    } catch (e) {
      console.error('Error: ', e.stack || e)
      this.status = 500
      return this.body =
      { error: true
      , msg: 'Error returning roles'
      , develeoperMsg: e.message
      }
    }
  }
  /**
   * @swagger
   * /v1/roles:
   *   post:
   *     operationId: createRolesV1
   *     summary: Creates a new Roles.
   *     produces:
   *      - application/json
   *     tags:
   *      - Roles
   *     parameters:
   *       - name: Roles
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/Roles'
   *     responses:
   *       200:
   *         description: Creates a role
   *         schema:
   *           $ref: '#/definitions/Roles'
   */
  function *create() {
    var body = this.request.body
    body.level = 1;
    try {
      var res = yield Roles.create(body);
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
        , msg: 'Error creating role'
        , develeoperMsg: e.message
        }
      }
      */
    }
    this.body = body
  }


  /**
   * @swagger
   * /v1/roles/{id}:
   *   get:
   *     operationId: listRolesByIdV1
   *     summary: List Roles by id
   *     parameters:
   *       - name: id
   *         in: path
   *         description: ID of role to fetch
   *         required: true
   *         type: integer
   *         format: int64
   *     tags:
   *      - Roles
   *     responses:
   *       200:
   *         description: Roles by ID
   *         schema:
   *           $ref: '#/definitions/Roles'
   */
  function *byId() {
    console.log('ID: ', this.params.id)
    try {
      var role = JSON.parse(
          JSON.stringify(
            yield Roles.findById(
              this.params.id
            )
          )
        )
      this.body = role
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

  /**
   * @swagger
   * /v1/roles/{id}:
   *   delete:
   *     operationId: deleteRolesV1
   *     summary: Remove Roles by id
   *     parameters:
   *       - name: id
   *         in: path
   *         description: ID of role to delete
   *         type: integer
   *         format: int64
   *     tags:
   *       - Roles
   *     responses:
   *       204:
   *         description: Delete role by id
   */
  function *remove() {
    try {
      var role = yield Roles.findById(this.params.id)
      role.isActive = false
      yield role.save()
      yield role.destroy()
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
   * @swagger
   * /v1/roles/{id}:
   *   put:
   *     operationId: updateRolesV1
   *     summary: Update role by id
   *     parameters:
   *       - name: id
   *         in: path
   *         description: ID of role to update
   *         type: integer
   *         format: int64
   *     tags:
   *       - Roles
   *     responses:
   *       200:
   *         description: Update role by id
   *         schema:
   *           $ref: '#/definitions/Roles'
   */
  function *update() {
    var body = this.request.body
    try {
      var role = yield Roles.findById(this.params.id)
      if(!role) {
        var role = yield Roles.find({
          where: {id: this.params.id},
          paranoid: false
        })
      }
      for(let key in body) {
        if(body.hasOwnProperty(key) && key !== "id") {
          role[key] = body[key]
        }
      }
      if(role.deletedAt && role.isActive) {
        yield role.restore()
      }
      yield role.save()
      return this.body = role
    } catch (e) {
      console.error('Error: ', e.stack)
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }
}

