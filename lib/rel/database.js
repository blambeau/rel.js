module.exports = function(Rel, Finitio){
  var PouchDB = require('pouchdb');
  var _ = require('underscore');
  var Schema = require('./database/schema')(Rel, Finitio);

  var Database = function(storage, schema){
    this.storage = storage;
    this.schema = schema;
    _.extend(this, schema);
    _.extend(this, this.schema.vars);
  };
  Database.Schema = Schema;

  /** Cleans any previous storage with name `name` */
  Database.destroy = function(name, options, callback){
    var storage = new PouchDB(name);
    storage.destroy(callback || options);
  };

  /** Create a database, destroying any existing one */
  Database.create = function(name, options, callback){
    Database.destroy(name, function(err){
      if (err){
        console.log(err);
        callback(new Error("Unable to destroy previous database: " + err.message));
      } else {
        Database.open(name, options, callback);
      }
    });
  };

  /** Open database and yields the callback with a database instance. */
  Database.open = function(name, options, callback){
    if (!(callback instanceof Function)){
      throw new Error("Callback expected, got " + callback);
    }
    var storage = new PouchDB(name);
    Schema.open(storage, options, function(err, schema){
      if (err){
        console.log(err);
        callback(new Error("Unable to retrieve database info: " + err.message));
      } else {
        callback(null, new Database(storage, schema));
      }
    });
  };

  return Database;
};
