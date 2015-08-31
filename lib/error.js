'use strict'

var errors = require(__dirname + '/errors.json')

function genError(shortcode) {
  return errors[shortcode]
}

module.exports = genError
