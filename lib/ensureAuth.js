var jwt = require('jsonwebtoken')
var config = require(__dirname + '/config')
var User = require(__dirname + '/../routes/v1/users/model')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(__dirname + '/error')

module.exports = function *ensureAuth(next) {
  /*
  var request = this.request
  if( !request.headers.authorization ){
    this.status = 401
    return this.body =
      { msg: 'This route requires authorization.'
      }
  }
  var token = request.headers.authorization.split(' ')[1]
  var payload = null
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET)
  } catch(err) {
    console.error('Error:', err.message)
    this.status = 401
    return this.body =
      { msg: 'This route requires authorization'
      }
  }

  if(payload.exp <= Date.now()){
    this.status = 401;
    return this.body =
      { msg: 'Token has expired'
      }
  }
  this.auth = yield User.findById(payload.sub)
  */
  console.log('check role')
  try {
    yield checkRole()
  } catch (e) {
    this.status = 403
    return this.body = genErr('INSUFFICENT_PERMSISSIONS')
  }

  yield next;
}
