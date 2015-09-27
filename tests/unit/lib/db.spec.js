'use strict'
var expect = require('expect')
var db = require(__dirname + '/db.js')
var sequelize

describe('DB Connection Tests:', function(){
  it('Should be an object', function(){
    expect(typeof db).toBe('object');
  })
  
  if (db.sequelize) {
    sequelize = db.sequelize
    it('Should have a connection to MySQL', function *(){
      let stmt = "SHOW TABLES"
      let tables = yield sequelize.query(stmt, {
        type: sequelize.QueryTypes.SHOWTABLES
      })
      expect(Array.isArray(tables)).toBe(true)
    })
  }
})
