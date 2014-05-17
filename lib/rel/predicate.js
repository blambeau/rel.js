var _ = require('underscore');

var Pred = module.exports = function(){
  throw new Error("Predicate is an abstract class");
};

Pred.prototype.not = function(){
  var self = this;
  return function(){
    return !self.apply(self, arguments);
  };
};

Pred.prototype.and = function(other){
  var left  = this;
  var right = Pred.dress(other);
  return function(){
    return left.apply(left, arguments) && right.apply(right, arguments);
  };
};

Pred.prototype.or = function(other){
  var left  = this;
  var right = Pred.dress(other);
  return function(){
    return left.apply(left, arguments) || right.apply(right, arguments);
  };
};

Pred.dress = function(arg){
  if (arg instanceof Function){
    return _.extend(arg, Pred.prototype);
  } else {
    throw new Error("Unable to dress `" + arg + "` to a predicate");
  }
};
