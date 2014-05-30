var World = require('./world');
var Rel = World.Rel,
    expect = World.expect,
    prom = World.prom;

describe("Rel.create", function(){

  var dbspec = {
    name: 'tests',
    schema: Rel.parseSchema("{}")
  };

  var destroy = function(){
    return Rel.destroy(dbspec);
  };

  // Remove the database before tests
  prom.before(destroy);

  // Remove it afterwards too
  prom.after(destroy);

  describe('when the database does not exists', function(){

    prom.it('creates a fresh new database if not existing', function(){
      return Rel
        .create(dbspec)
        .then(function(db){
          expect(db).to.be.a(Rel.Database);
          expect(db.reljsVersion).to.eql(Rel.VERSION);
        });
    });

  });

  describe('when the database does exist', function(){

    prom.before(function(){
      return Rel
        .create(dbspec)
        .then(function(db){
          return db.storage.put({title: 'foo'}, 'foo');
        });
    });

    prom.it('clear any existing data', function(){
      return Rel
        .create(dbspec)
        .then(function(db){
          expect(db).to.be.a(Rel.Database);
          expect(db.reljsVersion).to.eql(Rel.VERSION);
          return db;
        })
        .then(function(db){
          return db.storage
            .get('foo')
            .then(function(){
              expect(false).to.eql(true);
            })
            .catch(function(err){
              expect(err).not.to.be(undefined);
              expect(err.status).to.eql(404);
            });
        });
    });

  });

});
