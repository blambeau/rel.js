Rel = require('../lib/rel');
expect = require('expect.js');
prom = require('./prom.js');

describe("Rel.open", function(){

  var dbspec = {
    name: 'tests',
    schema: Rel.parseSchema("{}")
  };

  var destroy = function(){
    return Rel.destroy(dbspec);
  }

  // Remove the database before tests
  prom.before(destroy);

  // Remove it afterwards too
  prom.after(destroy);

  describe('when the database does not exists', function(){

    prom.it('creates a fresh new database', function(){
      return Rel
        .open(dbspec)
        .then(function(db){
          expect(db).to.be.a(Rel.Database);
          expect(db.reljsVersion).to.eql(Rel.VERSION);
          return db;
        });
    });

  });

  describe('when the database does exist', function(){

    prom.before(function(){
      return Rel
        .open(dbspec)
        .then(function(db){
          return db.storage.put({title: 'foo'}, 'foo');
        });
    });

    it('opens the database unchanged', function(){
      return Rel
        .open(dbspec)
        .then(function(db){
          expect(db).to.be.a(Rel.Database);
          expect(db.reljsVersion).to.eql(Rel.VERSION);
          return db;
        })
        .then(function(db){
          return db.storage
            .get('foo')
            .then(function(doc){
              expect(doc.title).to.eql('foo');
            });
        });
    });

  });

});
