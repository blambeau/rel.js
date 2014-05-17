_          = require('underscore');
Finitio    = require('finitio.js');

// Module Header

module.exports = Rel = {};

Rel.parseSchema = function(){
  return Finitio.parse.apply(Finitio, arguments);
};

// Class-level & Namespacing

Rel.VERSION  = "0.1.0";
Rel.Database = require('./rel/database')(Rel, Finitio);
Rel.create   = Rel.Database.create;
Rel.open     = Rel.Database.open;
Rel.destroy  = Rel.Database.destroy;
