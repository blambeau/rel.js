module.exports = function(Rel, Finitio){

  var Relvar = module.exports = function(name, type, ptype, storage){
    this.name = name;
    this.type = type;
    this.ptype = ptype;
    this.storage = storage;
    this.id = this.docId();
    this.doc = null;
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
      var found = _.find(tuples, function(t){
        return _.every(cond, function(value, name){
          return t[name] === value;
        });
      });

      // return it if found
      if (found){
        callback(null, found);
      } else {
        throw new Error("No such tuple " + cond);
      }
    });
  };

  Relvar.prototype.affect = function(value, callback){
    this.read(function(err, doc) {
      if (err){ return callback(err); }

      // dress the tuples with the logical type
      doc.tuples = this.type.dress(value);

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
    var raw = this.doc;

    // undress if a physical type has been specified
    if (this.ptype){
      raw = _.clone(raw);
      raw.tuples = this.type.undress(raw.tuples, this.ptype);
    }

    // do the put
    this.storage.put(raw, this.doc._id, this.doc._rev, function(err, res){
      if (err){ return callback(err); }
      this.doc._rev = res._rev;
      callback(null, this);
    }.bind(this));
  }

  return Relvar;
};
