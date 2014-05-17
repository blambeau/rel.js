module.exports = function(Rel, Finitio){
  var _ = require('underscore');

  var Relvar = function(name, type, ptype, storage){
    this.name = name;
    this.type = type;
    this.ptype = ptype;
    this.storage = storage;
    this.id = this.docId();
    this.doc = null;
  };

  var Predicate = function(cond){
    return function(t){
      return _.every(cond, function(value, name){
        return t[name] === value;
      });
    };
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
        var found = _.find(tuples, Predicate(cond));
        if (found){
          return found;
        } else {
          throw new Error("No such tuple " + cond);
        }
      });
  };

  Relvar.prototype.assign = function(value){
    var self = this;
    return this.read()
      .then(function(doc){
        doc.tuples = self.type.dress(value);
        return self.write();
      });
  };

  Relvar.prototype.insert = function(value){
    var self = this;
    return this.read()
      .then(function(doc){
        var tuples = self.type.dress(value);
        _.each(tuples, function(t){
          doc.tuples.push(t);
        });
        return self.write();
      });
  };

  Relvar.prototype.update = function(pred, value){
    var self = this;
    return this.read()
      .then(function(doc){
        pred = Predicate(pred);
        _.each(doc.tuples, function(t){
          if (pred(t)){ t = _.extend(t, value); }
        });
        return self.write();
      });
  };

  Relvar.prototype.delete = function(pred){
    var self = this;
    return this.read()
      .then(function(doc){
        doc.tuples = _.filter(doc.tuples, function(t){
          return _.any(pred, function(value, name){
            return !(t[name] === value);
          });
        });
        return self.write();
      });
  };

  // private

  Relvar.prototype.read = function(){
    var self = this;
    return this.storage.get(this.id)
      .then(function(doc){
        self.doc = doc;

        // dress the tuples if a physical schema is used
        if (self.ptype){
          doc.tuples = self.type.dress(doc.tuples);
        }

        return doc;
      });
  };

  Relvar.prototype.write = function(){
    // this is what will be written
    var raw = this.doc;

    // undress if a physical type has been specified
    if (this.ptype){
      raw = _.clone(raw);
      raw.tuples = this.type.undress(raw.tuples, this.ptype);
    }

    // do the put
    var self = this;
    return this.storage.put(raw)
      .then(function(res){
        self.doc._rev = res.rev;
      });
  }

  return Relvar;
};
