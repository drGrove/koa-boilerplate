'use strict'
var config =
{ "POST":
  { "/": create
  }
, "GET":
  { "/": all
  , "/:id": byId
  }
, "PUT":
  { "/:id": update
  }
, "DELETE":
  { "/:id": remove
  }
}

/**
 * @swagger
 * definition:
 *  route:
 *    required: 
 *      - url
 *    properties:
 *      id:
 *        type: long 
 *      url:
 *        type: string
 *  newRoute:
 *    required:
 *      - url
 *    properties:
 *      url:
 *        type: string
 */

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
    var res = yield Route.create(body)
    this.status = 201
    return this.body = res
  } catch (e) {
    console.error('Error: ', e.stack || e)
    this.status = 400
    return this.body =
    { error: true
    , msg: 'Error creating route'
    , develeoperMsg: e.message
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

}

/**
 *
 */
function *byId() {

}

/**
 *
 */
function *update() {

}

/**
 *
 */
function *remove() {

}


module.exports = config
