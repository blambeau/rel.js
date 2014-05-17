expect = require('expect.js');
Predicate = require('../../lib/rel/predicate');

describe("Predicate.dress", function(){

  it('works with a function', function(){
    var p = Predicate.dress(function(x){ return x == 2; });
    expect(p(2)).to.be(true);
    expect(p(3)).to.be(false);
  });
  
});
