expect = require('expect.js');
Predicate = require('../../lib/rel/predicate');

describe("Predicate#not", function(){

  it('works as expected', function(){
    var p = Predicate.dress(function(x){ return x == 2; }).not();
    expect(p(2)).to.be(false);
    expect(p(3)).to.be(true);
  });
  
});
