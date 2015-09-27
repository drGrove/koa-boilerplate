'use strict'
var db = require(process.env.PROJECT_ROOT + '/lib/db.js')

describe('DB Connection Tests:', function() {
  it('Should show this', function() {
    expect(false).toBe(false)
  })

  it('Should be an object', function() {
    expect(typeof db).toBe('object');
  })

  if (db.sequelize) {
    var sequelize = db.sequelize
    it ('Should have a connection to MySQL', function *() {
      let stmt = 'SHOW TABLES'
      let tables = yield sequelize
        .query
        ( stmt
        , { type: sequelize.QueryTypes.SHOWTABLES
          }
        )
      expect(Array.isArray(tables)).toBe(true)
    })
  }
})
