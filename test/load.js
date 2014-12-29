var smash = require("smash");

module.exports = function() {
    var files = [].slice.call(arguments).map(function(d){return "src/"+d;}),
        expression = "ceye",
        sandbox = {console: console, Date: Date};
    files.unshift("src/start");
    files.push("src/end");

    function topic() {
        var callback = this.callback;
        smash.load(files, expression, sandbox, function(error, result){
            if(error) console.trace(error.stack);
            callback(error, result);
        });    
    }

    topic.expression = function(_){
        expression = _;
        return topic;    
    };

    topic.sandbox = function(_){
        sandbox = _;
        return topic;  
    };

    return topic;
};
