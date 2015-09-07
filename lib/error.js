'use strict'

var errors = require(__dirname + '/errors.json')

/**
 * @swagger
 * definition:
 *   GeneralError:
 *     required:
 *       - error
 *       - errCode
 *       - errNo
 *       - msg
 *     properties:
 *       error:
 *         type: boolean
 *       errNo:
 *         type: integer
 *       errCode:
 *         type: string
 *       msg:
 *         type: string
 *   NotFoundError:
 *     allOf:
 *       - $ref: '#/definitions/GeneralError'
 *   InternalServerError:
 *     allOf:
 *       - $ref: '#/definitions/GeneralError'
 *   TokenExpired:
 *     allOf:
 *       - $ref: '#/definitions/GeneralError'
 */

function genError(shortcode) {
  return errors[shortcode]
}

module.exports = genError
