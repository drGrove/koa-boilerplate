'use strict';
var path = require('path');
var errors = require(path.join(__dirname, '/errors.json'));

/**
 * Generate an error based on a short code
 * @param {string} shortcode the shortcode to generate a JSON error for
 * @return {object} JSON error payload
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
  return errors[shortcode];
}

module.exports = genError;
