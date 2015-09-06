var jwt = require('jsonwebtoken')
var config = require(__dirname + '/config')
var User = require(__dirname + '/../routes/v1/users/model')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(__dirname + '/error')
var Token = require(__dirname + '/models/tokens')

/**
 * @swagger
 * securityDefinition:
 *   Authorization:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */
function *ensureAuth(next) {
  var request = this.request
  if( !request.headers.authorization ){
    this.status = 401
    return this.body = genErr('NO_AUTH')
  }

  var token = request.headers.authorization.split(' ')[1]
  var payload = null
  try {
    payload = jwt.verify(token, config.token_secret)
  } catch(err) {
    console.error('Error:', err.message)
    this.status = 401
    return this.body = genErr('NO_AUTH')
  }

  var whitelist = yield Token.find({
    userId: payload.sub
  })

  if( payload.exp <= Date.now()
    && whitelist.indexOf(token) === -1
    ) {
    this.status = 401;
    return this.body = genErr('TOKEN_EXPIRED')
  }
  var user = JSON.parse(
    JSON.stringify(
      yield User.findById(payload.sub)
    )
  )
  delete user.password
  this.auth =  user
  try {
    var doesPass = yield checkRole.apply(this)
    if (doesPass === true) {
      yield next
    } else {
      throw new Error('IP')
    }
  } catch (e) {
    if(e.message === "IP") {
      this.status = 403
      return this.body = genErr('INSUFFICENT_PERMISSIONS')
    } else {
      throw e
    }
  }
}

module.exports = ensureAuth
