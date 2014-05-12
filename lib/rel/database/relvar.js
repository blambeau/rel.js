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

  Relvar.prototype.value = function(callback){
    this.read(function(err, doc){
      if (err){ return callback(err); }
      callback(null, doc.tuples);
    });
  };

  Relvar.prototype.one = function(cond, callback){
    this.value(function(err, tuples){
      if (err){ return callback(err); }

      // find the tuple that matches the restriction
      var found = _.find(tuples, Predicate(cond));

      // return it if found
      if (found){
        callback(null, found);
      } else {
        callback(new Error("No such tuple " + cond));
      }
    });
  };

  Relvar.prototype.assign = function(value, callback){
    this.read(function(err, doc) {
      if (err){ return callback(err); }

      // dress the tuples with the logical type
      doc.tuples = this.type.dress(value);

      // write the document
      this.write(callback);
    }.bind(this));
  };

  Relvar.prototype.insert = function(value, callback){
    this.read(function(err, doc) {
      if (err){ return callback(err); }

      // dress the tuples with the logical type
      var tuples = this.type.dress(value);
      _.each(tuples, function(t){
        doc.tuples.push(t);
      });

      // write the document
      this.write(callback);
    }.bind(this));
  };

  Relvar.prototype.update = function(pred, value, callback){
    this.read(function(err, doc) {
      if (err){ return callback(err); }

      // dress the tuples with the logical type
      pred = Predicate(pred);
      _.each(doc.tuples, function(t){
        if (pred(t)){
          t = _.extend(t, value);
        }
      });

      // write the document
      this.write(callback);
    }.bind(this));
  };

  Relvar.prototype.delete = function(pred, callback){
    this.read(function(err, doc) {
      if (err){ return callback(err); }

      // dress the tuples with the logical type
      doc.tuples = _.filter(doc.tuples, function(t){
        return _.any(pred, function(value, name){
          return !(t[name] === value);
        });
      });

      // write the document
      this.write(callback);
    }.bind(this));
  };

  // private

  Relvar.prototype.read = function(callback){
    // return the document immediately if in cache
    if (this.doc){
      callback(null, this.doc);
    }

    // not in cache, load it
    else {
      this.storage.get(this.id, function(err, doc){
        if (err){ return callback(err); }

        // save the document
        this.doc = doc;

        // dress the tuples if a physical schema is used
        if (this.ptype){
          doc.tuples = this.type.dress(doc.tuples);
        }

        callback(null, doc);
      }.bind(this));
    }
  };

  Relvar.prototype.write = function(callback){
    // this is what will be written
    var raw = _.clone(this.doc);

    // undress if a physical type has been specified
    if (this.ptype){
      raw.tuples = this.type.undress(raw.tuples, this.ptype);
    }

    // do the put
    this.storage.put(raw, function(err, res){
      if (err){
        return callback(err);
      }
      this.doc._rev = res.rev;
      callback(null, this);
    }.bind(this));
  }

  return Relvar;
};
