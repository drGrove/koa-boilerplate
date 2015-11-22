'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface
      .bulkInsert
      ( 'role'
      , [ { name: 'anon'
          , adminLevel: 0
          , type: 'user'
          }
        , { name: 'user'
          , adminLevel: 1
          , type: 'user'
          }
        , { name: 'admin'
          , adminLevel: 10
          , type: 'user'
          }
        , { name: 'user'
          , adminLevel: 2
          , type: 'company'
          }
        , { name: 'admin'
          , adminLevel: 9
          , type: 'company'
          }
        ]
      )
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('role', null, {})
  }
};
