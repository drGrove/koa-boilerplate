var jwt = require('jsonwebtoken')
var config = require(__dirname + '/config')
var User = require(__dirname + '/../routes/v1/users/model')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(__dirname + '/error')

module.exports = function *ensureAuth(next) {
  var request = this.request
  if( !request.headers.authorization ){
    this.status = 401
    return this.body = genErr('NO_AUTH')
  }
  var token = request.headers.authorization.split(' ')[1]
  var payload = null
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET)
  } catch(err) {
    console.error('Error:', err.message)
    this.status = 401
    return this.body = genErr('NO_AUTH')
  }

  if(payload.exp <= Date.now()){
    this.status = 401;
    return this.body = genErr('TOKEN_EXPIRED')
  }
  this.auth = yield User.findById(payload.sub)
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
