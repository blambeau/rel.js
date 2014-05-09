Rel = require('../lib/rel');
expect = require('expect.js');

describe("Rel.open", function(){

  var options = { schema: Rel.parseSchema("{}") };

  var destroy = function(done){
    Rel.destroy('tests', done);
  }

  describe('when the database does not exists', function(){

    before(destroy);
    after(destroy);

    it('creates a fresh new database if not existing', function(done){
      Rel.open('tests', options, function(err, s){
        if (err){ return done(err); }
        expect(s).to.be.a(Rel.Database);
        expect(s.reljsVersion).to.eql(Rel.VERSION);
        done();
      });
    });

  });

  describe('when the database does exist', function(){

    before(function(done){
      Rel.open('tests', options, function(err, s){
        s.storage.put({title: 'foo'}, 'foo', done);
      });
    });

    after(destroy);

    it('opens the database unchanged', function(done){
      Rel.open('tests', options, function(err, s){
        if (err){ return done(err); }
        expect(s).to.be.a(Rel.Database);
        expect(s.reljsVersion).to.eql(Rel.VERSION);
        s.storage.get('foo', function(err, doc){
          if (err){ return done(err); }
          expect(doc['title']).to.eql('foo');
          done();
        });
      });
    });

  });

});
