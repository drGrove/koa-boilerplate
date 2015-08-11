'use strict'

var koa = require('koa'),
    mount = require('koa-mount'),
    swagger = require('swagger-koa'),
    bodyParser = require('koa-bodyparser'),
    morgan = require('koa-morgan'),
    responseTime = require('koa-response-time'),
    error = require('koa-error'),
    cors = require('koa-cors'),
    mount = require('koa-mount'),
    staticNow = require('static-now'),
    config = require('./lib/config'),
    routes = require('./routes/index'),
    app = koa()

// X-Response-Time
app.use(responseTime())

// Logger
app.use(morgan.middleware('combined'))

// CORS
app.use(cors())

// 401 Handler
app.use(function*(next){
  try {
    yield next
  } catch(err) {
    if(401 === err.status) {
      this.status = 401
      this.body =
      { error: true
      , msg: 'Authorization Required. Please use Authorization header to get access.'
      }
    } else {
      yield next
    }
  }
})

var swaggerStatic = staticNow({
  directory: __dirname + '/public/swagger',
  autostart: false
})

var bowerStatic = staticNow({
  directory: __dirname + '/public/swagger/bower_components',
  autostart: false
})

// Swagger
app.use(mount('/swagger', swaggerStatic))
app.use(mount('/bower_components', bowerStatic))

// Router
app.use(mount('/api', routes(app).routes()))

// Error Handler
app.use(error())


app.listen(config.app.port, config.app.host, function(){
  console.log('Listening on http://%s:%s', config.app.host, config.app.port)
})
