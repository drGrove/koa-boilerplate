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
      ( 'route'
      , [ { url: '^\/api\/v1\/roles$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/roles$'
          , method: 'POST'
          }
        , { url: '^\/api\/v1\/roles\/\\d+$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/roles\/\\d+$'
          , method: 'PUT'
          }
        , { url: '^\/api\/v1\/roles\/\\d+$'
          , method: 'DELETE'
          }
        , { url: '^\/api\/v1\/urls$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/urls$'
          , method: 'POST'
          }
        , { url: '^\/api\/v1\/urls\/\\d+$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/urls\/\\d+$'
          , method: 'PUT'
          }
        , { url: '^\/api\/v1\/urls\/\\d+$'
          , method: 'DELETE'
          }
        , { url: '^\/api\/v1\/users$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/users$'
          , method: 'POST'
          }
        , { url: '^\/api\/v1\/users\/(\\d+|me)$'
          , method: 'GET'
          }
        , { url: '^\/api\/v1\/users\/(\\d+|me)$'
          , method: 'PUT'
          }
        , { url: '^\/api\/v1\/users\/(\\d+|me)$'
          , method: 'DELETE'
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
    return queryInterface.bulkDelete('route', null, {})
  }
};
