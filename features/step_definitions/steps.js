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

  var self = this;
  var prom = {
    delegate: function(to, description, test){
      return self[to](description, function(){
        var callback = arguments[arguments.length - 1];
        var result = test.apply(this, arguments);
        if (result && result.then) {
          result.then(function(){
            callback();
          })
          .catch(function(err){
            callback.fail(err);
          });
        } else {
          callback();
        }
      });
    },
    Given: function(description, test){
      return this.delegate('Given', description, test);
    },
    Then: function(description, test){
      return this.delegate('Then', description, test);
    }
  }
  
  prom.Given(/^I create a logical\/physical data using the schema$/, function(src) {
    dbSystem = kernel.parse(src, fioOpts);
    dbOpts = {
      name: "testdb",
      system:   dbSystem,
      logical:  dbSystem['Logical'],
      physical: dbSystem['Physical']
    };
    return Rel.create(dbOpts);
  });

  prom.Given(/^I open the database$/, function() {
    return Rel.open(dbOpts)
      .then(function(db){
        database = db;
      });
  });
  
  var json = function(str){
    return JSON.parse(str);
  }
  
  prom.Given(/^I assign the following value to `documents`$/, function(str){
    var value = json(str);
    return database.documents.assign(value);
  });
  
  prom.Given(/^I insert the following value to `documents`$/, function (str) {
    var value = json(str);
    return database.documents.insert(value);
  });
  
  prom.Then(/^`documents` has one tuple$/, function(){
    return database.documents.value()
      then(function(rel){
        expect(rel.length).to.eql(1);
      });
  });
  
  prom.Then(/^`documents` has two tuples$/, function(){
    return database.documents.value()
      .then(function(rel){
        expect(rel.length).to.eql(2);
      });
  });
  
  prom.Then(/^`documents` has three tuples$/, function() {
    return database.documents.value()
      .then(function(rel){
        expect(rel.length).to.eql(3);
      });
  });
  
  prom.Then(/^`documents` is empty$/, function(){
    return database.documents.value()
      .then(function(rel){
        console.log("empty");
        expect(rel.length).to.eql(0);
      });
  });
  
  prom.Given(/^I delete from `documents` with the following predicate:$/, function (str, callback) {
    var pred = json(str);
    return database.documents.delete(pred);
  });
  
  prom.Then(/^the document with `(.*?)` does not exist$/, function (cond) {
    var cond = json(cond);
    return database.documents.one(cond)
      .then(function(){
        expect(false).to.eql(true);
      })
      .catch(function(){
      });
  });
  
  prom.Given(/^I update `documents` where `(.*?)` with the following updating:$/, function(cond, updt){
    var pred = json(cond);
    var updt = json(updt);
    return database.documents.update(pred, updt);
  });
  
  prom.Given(/^I ask for the only document with `(.*?)`$/, function(cond){
    var cond = json(cond);
    return database.documents.one(cond)
      .then(function(tuple){
        resTuple = tuple;
      });
  });
  
  prom.Then(/^the resulting tuple's `at` is a javascript time$/, function(){
    expect(resTuple).not.to.be(undefined);
    expect(resTuple['at']).to.be.a(Date);
  });
  
  prom.Then(/^the resulting tuple's `title` is "([^"]*)"$/, function(str){
    expect(resTuple).not.to.be(undefined);
    expect(resTuple['title']).to.eql(str);
  });

}
