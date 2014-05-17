Rel = require('../lib/rel');
expect = require('expect.js');
prom = require('./prom.js');

describe("Rel.destroy", function(){

  prom.it('returns a promise', function(){
    return Rel
      .destroy({name: 'tests'});
  });

});
