'use strict'
module.exports = function(app) {
  var Route = require(__dirname + '/model')
  var genError = require(app.rootDir + '/lib/error')
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')
  var Role = require(__dirname + '/../roles/model')(app)
  var routeConfig =
  { "POST":
    { "/": create
    }
  , "GET":
    { "/": all
    , "/:id": byId
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

  /**
   * @swagger
   * /api/v1/routes:
   *  post:
   *    operationId: createRouteReferenceV1
   *    summary: Create a reference to a route for role based endpoints
   *    produces:
   *      - application/json
   *    tags:
   *      - Routes
   *    responses:
   *      200:
   *        description: Success
   *        schema:
   *          type: object
   *          $ref: '#/definitions/newRoute'
   */
  function *create() {
    var body = this.request.body
    try {
      var routeBody =
      { url: body.url
      , method: body.method
      }
      delete body.url
      delete body.method
      try {
        var route = yield Route.create(routeBody)
      } catch (e) {
        console.error('Error: ', e)
        var route = yield Route.findOne({
          where: routeBody,
          include: [Role]
        })
      }
      var role = yield Role.findById(body.role)
      yield role.addRoute(route)
      this.status = 201
      return this.body = route
    } catch (e) {
      console.error('Error: ', e)
      switch(e.name) {
        case 'SequelizeUniqueConstraintError': {
          console.error('Error: ', e)
          this.status = 400
          return this.body =
          { error: true
          , msg: e.errors || e.message
          , errNo: 420
          , errCode: 'UniqueConstraint'
          }
          break;
        }
      }
    }
  }

  /**
   * @swagger
   * /api/v1/routes:
   *   get:
   *     operationId: getRoutesReferenceV1
   *     summary: Returns list of routes with roles
   *     produces:
   *       - application/json
   *     tags:
   *       - Routes
   *     responses:
   *       200:
   *         description: Array of Routes
   *         schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/route'
   */
  function *all() {
    try {
      var res = yield Route.findAll({})
      this.body = res
    } catch (e) {
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }

  /**
   *
   */
  function *byId() {
    var id = this.params.id
    try {
      this.body = yield Route.findById(id)
    } catch (e) {
      this.status = 404;
      this.body =
      { error: true
      , msg:  "Item not found"
      }
    }
  }

  /**
   *
   */
  function *update() {
    var id = this.params.id
    var body = this.request.body
    try {
      var route = yield Route.findById(id)
      for(var key in body) {
        if(route.hasOwnProperty(key)) {
          route[key] = body[key]
        }
      }
      yield route.save()
      return this.body = route
    } catch (e) {
      this.status = 400;
      return this.body =
      { error: true
      , msg: e.errors || e.message
      , errNo: 400
      , errCode: "INVALID_PARAMETERS"
      }
    }
  }

  /**
   *
   */
  function *remove() {
    var id = this.params.id
    try {
      var route = yield Route.findById(id)
      yield route.destroy()
      this.status = 204
      return this.body = genError("NO_CONTENT")
    } catch (e) {
      this.status = 500;
      return this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }

  return routeConfig
}
