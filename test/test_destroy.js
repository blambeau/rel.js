var World = require('./world');
var Rel = World.Rel,
    expect = World.expect,
    prom = World.prom;

describe("Rel.destroy", function(){

  prom.it('returns a promise', function(){
    return Rel
      .destroy({name: 'tests'});
  });

});
