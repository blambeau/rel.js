module.exports = (function(){
  Rel = require('../lib/rel');
  Finitio = require('finitio.js');
  fs = require('fs');

  var systemSrc = fs.readFileSync('test/fixtures.fio').toString();
  var system    = Finitio.parse(systemSrc, { world: { Finitio: Finitio } });

  return {

    PhysicalDb: function(done){
      var options = {
        schema: system
      };
      Rel.create('physical', options, done);
    },

    LogicalDb: function(done){
      var options = {
        system:   system,
        logical:  system['Logical'],
        physical: system['Physical']
      };
      Rel.create('logical', options, done);
    }

  }
})();
