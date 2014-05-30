var World = require('./world');
var Fixtures = World.Fixtures,
    Finitio = World.Finitio,
    expect = World.expect,
    prom = World.prom;

describe('Fixtures#system', function(){

  it('is a finitio system', function(){
    expect(Fixtures.system).to.be.a(Finitio.System);
  });

});
