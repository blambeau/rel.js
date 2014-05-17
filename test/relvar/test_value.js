expect = require('expect.js');
prom = require('../prom.js');
Rel    = require('../../lib/rel');
Fixtures = require('../fixtures');

describe("Relvar.value", function(){

  var database;

  prom.before(function(){
    return Fixtures
      .logical()
      .then(function(db){
        database = db;
      });
  })

  prom.it('returns an array of tuples', function(){
    return database.documents
      .value()
      .then(function(rel){
        expect(rel).to.eql([]);
      });
  });

});
