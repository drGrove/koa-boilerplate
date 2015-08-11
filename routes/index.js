'use strict'

var routes = function(app) {
  var config = require('../lib/config')
  var r = require('koa-router')()
  var v1 = require('./v1/index')
  var path = require('path')
  var fs = require('fs')

  r.get('/', function*(next){
    return this.body = {
      active: true,
      timestamp: new Date().getTime()
    }
  })
  r.use('/v1', v1().routes())
  return r
}

module.exports = routes
