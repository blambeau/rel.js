module.exports = function(Rel, Finitio){
  var _ = require('underscore');
  var Predicate = require('../predicate');

  var Relvar = function(name, type, ptype, storage){
    this.name = name;
    this.type = type;
    this.ptype = ptype;
    this.storage = storage;
    this.id = this.docId();
  };

  Relvar.prototype.docId = function(){
    return "$smartdoc.relvar." + this.name;
  };

  Relvar.prototype.emptyStorageDoc = function(){
    return {
      _id: this.docId(),
      tuples: []
    };
  };

  Relvar.prototype.value = function(){
    return this.read()
      .then(function(doc){
        return doc.tuples;
      });
  };

  Relvar.prototype.one = function(cond){
    return this.value()
      .then(function(tuples){
        var found = _.find(tuples, Predicate.dress(cond));
        if (found){
          return found;
        } else {
          throw new Error("No such tuple " + cond);
        }
      });
  };

  Relvar.prototype.assign = function(value){
    var self = this;
    return this.rewrite(function(tuples){
      return self.type.dress(value);
    });
  };

  Relvar.prototype.insert = function(value){
    var self = this;
    return this.rewrite(function(tuples){
      var ts = self.type.dress(value);
      _.each(ts, function(t){ tuples.push(t); });
      return tuples;
    });
  };

  Relvar.prototype.update = function(cond, value){
    var self = this;
    var pred = Predicate.dress(cond);
    return this.rewrite(function(tuples){
      _.each(tuples, function(t){
        if (pred(t)){ t = _.extend(t, value); }
      });
      return tuples;
    });
  };

  Relvar.prototype.delete = function(cond){
    var self = this;
    var pred = Predicate.dress(cond);
    return this.rewrite(function(tuples){
      return _.filter(tuples, function(t){
        return !pred(t);
      });
    });
  };

  // private

  Relvar.prototype.read = function(){
    var self = this;
    return this.storage.get(this.id)
      .then(function(doc){
        // dress the tuples if a physical schema is used
        if (self.ptype){
          doc.tuples = self.type.dress(doc.tuples);
        }

        return doc;
      });
  };

  Relvar.prototype.write = function(raw){
    // undress if a physical type has been specified
    if (this.ptype){
      raw = _.clone(raw);
      raw.tuples = this.type.undress(raw.tuples, this.ptype);
    }

    // do the put
    var self = this;
    return this.storage.put(raw);
  };

  Relvar.prototype.rewrite = function(rewriter){
    var self = this;
    return this.read()
      .then(function(doc){
        doc.tuples = rewriter(doc.tuples);
        return self.write(doc);
      });
  };

  return Relvar;
};
