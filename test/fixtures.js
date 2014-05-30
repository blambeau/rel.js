module.exports = (function(){
  Rel = require('../lib/rel');
  Finitio = require('finitio.js');
  fs = require('fs');

  var systemSrc = fs.readFileSync('test/fixtures.fio').toString();
  var system    = Finitio.system(systemSrc);

  return {

    system: system,

    physical: function(){
      return Rel.create({
        name: 'physical',
        schema: system
      });
    },

    logical: function(){
      return Rel.create({
        name: 'logical',
        system:   system,
        logical:  system.Logical,
        physical: system.Physical
      });
    }

  };
})();
