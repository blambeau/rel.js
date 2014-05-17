var Prom = module.exports = {};

Prom.it = function(description, test){
  it(description, function(done){
    test()
      .then(function(){ done(); })
      .catch(function(err){ done(err); });
  });
};

Prom.before = function(task){
  before(function(done){
    task()
      .then(function(){ done(); })
      .catch(function(err){ done(err); });
  });
};

Prom.after = function(task){
  after(function(done){
    task()
      .then(function(){ done(); })
      .catch(function(err){ done(err); });
  });
};

