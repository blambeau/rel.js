Rel    = require('../../lib/rel');
expect = require('expect.js');
Fixtures = require('../fixtures');

describe("Relvar.value", function(){

  var database;

  before(function(done){
    Fixtures.LogicalDb(function(err, db){
      if (err){ return done(err); }
      database = db;
      done();
    });
  })

  it('returns an array of tuples', function(done){
    database.documents.value(function(err, rel){
      expect(rel).to.eql([]);
      done();
    });
  });

});
