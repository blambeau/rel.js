module.exports = function(Rel, Finitio){

  var Tuplevar = module.exports = function(name, type, ptype, storage){
    this.name = name;
    this.type = type;
    this.ptype = ptype;
    this.storage = storage;
  };

  Tuplevar.prototype.docId = function(){
    return "$smartdoc.tuplevar." + this.name;
  };

  Tuplevar.prototype.emptyStorageDoc = function(){
    return { _id: this.docId(), value: {} };
  };

  Tuplevar.prototype.value = function(callback){
    this.storage.get(this.docId(), function(err, doc){
      if (err){ return callback(err); }
      callback(null, doc.value);
    });
  };

  return Tuplevar;
};
