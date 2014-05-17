var path = require('path');
var filteredPathPrefix = path.resolve(__dirname, '..', '..');
var originalPrepareStackTrace;

if (originalPrepareStackTrace = Error.prepareStackTrace) {
  Error.prepareStackTrace = function (error, stack) {
    var originalString = originalPrepareStackTrace(error, stack);
    var string = 'Error: ' + error.message + "\n";
    var lines = originalString
      .replace('Error: ' + error.message + "\n", '')
      .replace(/\s*$/, '')
      .split("\n");
    var i;
    var matchObject = function(str){
      return str.match(/node_modules/);
    };
    var sameCallSite = function(str){
      return str.getFileName().indexOf(filteredPathPrefix) == 0;
    }
    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      var callSite = stack[i];
      if (sameCallSite(callSite) && !matchObject(line))
        string = string + line + "\n";
    };
    return string;
  };
}