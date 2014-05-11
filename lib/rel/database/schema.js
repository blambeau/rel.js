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

  var VarFactory = function(name, ltype, ptype, storage){
    switch (ltype.generator){
      case 'tuple':
        return new Tuplevar(name, ltype, ptype, storage);
      case 'relation':
        return new Relvar(name, ltype, ptype, storage);
      default:
        throw new Error("Unable to create a variable for " + ltype);
    }
  }

  /** Schema constructor */
  var Schema = function(metadata, options, storage){
    this.options = options;
    this.vars = this.createVars(storage);
    _.extend(this, this.metadata = metadata);
  };

  Schema.prototype.createVars = function(storage){
    var getType = function(arg){
      if (arg instanceof Finitio.System){ arg = arg.main };
      return arg;
    }
    var ls = getType(this.options.logical || this.options.schema);
    var ps = getType(this.options.physical);
    var vars = {};
    ls.heading.each(function(attr){
      var name  = attr.name;
      var ltype = attr.type;
      var ptype = ps && ps.heading.attributes[name].type;
      vars[name] = VarFactory(name, ltype, ptype, storage);
    });
    return vars;
  };

  /** Open a schema on `storage`, creating it if not existing */
  Schema.open = function(storage, options, callback){
    storage.get(STORAGE_METADATA_KEY, function(err, doc){
      // not found, initialize the database
      if (err && err.status == 404){
        Schema.create(storage, options, callback);
      }

      // no error, simply open it!
      else if (!err) {
        callback(null, new Schema(doc, options, storage));
      }

      // something wrong here, sorry
      else {
        console.log(err);
        callback(new Error("Unable to retrieve schema info: " + err.message));
      }
    });
  };

  /** Create a schema version on `storage` */
  Schema.create = function(storage, options, callback){
    var metadata = _.clone(METADATA);
    var schema = new Schema(metadata, options, storage);
    var docs = [ schema.metadata ];
    _.each(schema.vars, function(v, name){
      docs.push(v.emptyStorageDoc());
    });
    storage.bulkDocs(docs, function(err){
      if (err){ return callback(err); }
      callback(null, schema);
    });
  };

  return Schema;
};

