'use strict'

var koa = require('koa')
var mount = require('koa-mount')
var swagger = require('swagger-koa')
var bodyParser = require('koa-bodyparser')
var morgan = require('koa-morgan')
var responseTime = require('koa-response-time')
var error = require('koa-error')
var cors = require('koa-cors')
var mount = require('koa-mount')
var staticNow = require('static-now')
var config = require('./lib/config')
var genErr = require('./lib/error')
var sequelize = require('./lib/db').sequelize
var routes = require('./routes/index')
var app = koa()

app.rootDir = __dirname

// X-Response-Time
app.use(responseTime())

// Logger
app.use(morgan.middleware('combined'))

// CORS
app.use(cors())

// Body Parser
app.use(bodyParser())

// 401 Handler
app.use(function*(next) {
  try {
    yield next
  } catch (err) {
    if (401 === err.status) {
      this.status = 401
      this.body = genErr('NO_AUTH')
    } else {
      yield next
    }
  }
})

/*
var swaggerStatic = staticNow({
  directory: __dirname + '/public/swagger',
  autostart: false
})

var bowerStatic = staticNow({
  directory: __dirname + '/public/swagger/bower_components',
  autostart: false
})
*/

// Swagger
app.use(swagger.init({
  apiVersion: '1.0',
  swaggerVersion: '2.0',
  swaggerURL: '/api/v1/swagger',
  swaggerJSON: '/api/v1/docs.json',
  swaggerUI: 'node_modules/swagger-ui/dist',
  basePath: 'http://ishortb.us:8886/',
  info: {
    title: 'API',
    description: 'Blah'
  }
}))

// Error Handler
app.use(error())

// 404 Handler
app.use(function*(next) {
  yield next;
  var status = this.status || 404;
  if (status === 404) {
    return this.body =
    { error: true
    , msg: 'Item not found'
    }
  }
})

// Swagger
//app.use(mount('/swagger', swaggerStatic))
//app.use(mount('/bower_components', bowerStatic))

// Sequelize Transactions
app.use(require('koa-sequelize-transaction')({
  sequelize: sequelize
}))

// Router
app.use(mount('/api', routes(app).routes()))


app.listen(config.app.port, config.app.host, function() {
  console.log('Listening on http://%s:%s', config.app.host, config.app.port)
})
