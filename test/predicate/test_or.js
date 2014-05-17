expect = require('expect.js');
Predicate = require('../../lib/rel/predicate');

describe("Predicate#or", function(){

  var p1 = function(x){ return x > 0;  };
  var p2 = function(x){ return x < 0; };

  it('works as expected', function(){
    var p = Predicate.dress(p1).or(p2);
    expect(p(0)).to.be(false);
    expect(p(-3)).to.be(true);
    expect(p(3)).to.be(true);
  });
  
});
