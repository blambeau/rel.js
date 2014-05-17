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
  Database.destroy = function(dbspec){
    var storage = new PouchDB(dbspec.name);
    return storage.destroy();
  };

  /** Create a database, destroying any existing one */
  Database.create = function(dbspec, callback){
    return Database
      .destroy(dbspec)
      .then(function(){
        return Database.open(dbspec);
      });
  };

  /** Open database and yields the callback with a database instance. */
  Database.open = function(dbspec, callback){
    var storage = new PouchDB(dbspec.name);
    return Schema
      .open(storage, dbspec)
      .then(function(schema){
        return new Database(storage, schema);
      });
  };

  return Database;
};
