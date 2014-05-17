module.exports = function(Rel, Finitio){
  var Relvar   = require('./relvar')(Rel, Finitio);
  var Tuplevar = require('./tuplevar')(Rel, Finitio);
  var _ = require('underscore');

  // Key for the metadata document
  var STORAGE_METADATA_KEY = '$smartdoc.metadata';

  // Metadata
  var METADATA = {
    _id:          STORAGE_METADATA_KEY,
    reljsVersion: Rel.VERSION
  };

  var varFactory = function(name, ltype, ptype, storage){
    switch (ltype.generator){
      case 'tuple':
        return new Tuplevar(name, ltype, ptype, storage);
      case 'relation':
        return new Relvar(name, ltype, ptype, storage);
      default:
        throw new Error("Unable to create a variable for " + ltype);
    }
  };

  /** Schema constructor */
  var Schema = function(storage, dbspec, metadata){
    this.dbspec = dbspec;
    this.vars = this.createVars(storage);
    this.metadata = metadata;
    _.extend(this, metadata);
  };

  Schema.prototype.createVars = function(storage){
    var getType = function(arg){
      if (arg instanceof Finitio.System){ arg = arg.main; }
      return arg;
    };
    var ls = getType(this.dbspec.logical || this.dbspec.schema);
    var ps = getType(this.dbspec.physical);
    var vars = {};
    ls.heading.each(function(attr){
      var name  = attr.name;
      var ltype = attr.type;
      var ptype = ps && ps.heading.attributes[name].type;
      vars[name] = varFactory(name, ltype, ptype, storage);
    });
    return vars;
  };

  /** Open a schema on `storage`, creating it if not existing */
  Schema.open = function(storage, dbspec){
    return storage
      .get(STORAGE_METADATA_KEY)
      .then(function(metadata){
        return new Schema(storage, dbspec, metadata);
      })
      .catch(function(err){
        if (err.status == 404){
          return Schema.create(storage, dbspec);
        } else {
          throw new Error("Unable to retrieve schema info: " + err.message);
        }
      });
  };

  /** Create a schema version on `storage` */
  Schema.create = function(storage, dbspec){
    var metadata = _.clone(METADATA);
    var schema = new Schema(storage, dbspec, metadata);

    // create initial docs
    var docs = [ schema.metadata ];
    _.each(schema.vars, function(v, name){
      docs.push(v.emptyStorageDoc());
    });

    // save them then return the schema
    return storage
      .bulkDocs(docs)
      .then(function(){
        return schema;
      });
  };

  return Schema;
};

