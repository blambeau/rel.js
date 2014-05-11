module.exports = function(){
  Rel = require('../../lib/rel');
  Finitio = require('finitio.js');
  fs = require('fs');
  expect = require('expect.js');

  var fioOpts = { world: { Finitio: Finitio } };
  var kernelSrc = fs.readFileSync('features/step_definitions/kernel.fio').toString();
  var kernel = Finitio.parse(kernelSrc, fioOpts);
  var dbSystem = null;
  var dbOpts   = null;
  var database = null;
  var resTuple = null;
  
  this.Given(/^I create a logical\/physical data using the schema$/, function (src, callback) {
    dbSystem = kernel.parse(src, fioOpts);
    dbOpts = {
      system:   dbSystem,
      logical:  dbSystem['Logical'],
      physical: dbSystem['Physical']
    };
    Rel.create('testdb', dbOpts, function(err, db){
      if (err){ return callback.fail(err); }
      callback();
    });
  });

  this.Given(/^I open the database$/, function (callback) {
    Rel.open('testdb', dbOpts, function(err, db){
      if (err){ return callback.fail(err); }
      database = db;
      callback();
    });
  });

  var json = function(str, callback){
    try {
      return JSON.parse(str);
    } catch (e) {
      return callback.fail(e);
    }
  }

  var valueOf = function(varname, done){
    database[varname].value(done);
  };

  var one = function(varname, cond, callback){
    database[varname].one(cond, function(err, res){
      if (err){ return callback.fail(err); }
      expect(resTuple = res).to.be.defined;
      callback();
    });
  }

  var assign = function(varname, value, callback){
    rv = database[varname];
    rv.assign(value, function(err, res){
      if (err){
        console.log(err);
        return callback.fail(err);
      }
      expect(res).to.be(rv);
      callback();
    });
  }

  var isEmpty = function(callback){
    return function(err, r){
      if (err){ return callback.fail(err); }
      expect(r).to.be.empty;
      callback();
    }
  };

  var hasOneTuple = function(callback){
    return function(err, r){
      if (err){ return callback.fail(err); }
      expect(r.length).to.eql(1);
      callback();
    }
  };

  this.Given(/^I affect the following value to `documents`$/, function (str, callback) {
    var value = json(str, callback);
    affect('documents', value, callback);
  });

  this.Then(/^`documents` has one tuple$/, function (callback) {
    valueOf('documents', hasOneTuple(callback));
  });

  this.Then(/^`documents` is empty$/, function (callback) {
    valueOf('documents', isEmpty(callback));
  });

  this.Given(/^I ask for the only document with `(.*?)`$/, function (cond, callback) {
    var cond = json(cond, callback);
    one('documents', cond, callback);
  });

  this.Then(/^the resulting tuple's `at` is a javascript time$/, function (callback) {
    expect(resTuple).to.be.defined;
    expect(resTuple['at']).to.be.a(Date);
    callback();
  });

}
