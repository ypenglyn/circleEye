var vows = require("vows"),
    assert = require("assert"),
    load = require("../load");

var suite = vows.describe("Model Test");

suite.addBatch({
        "test model:": {
            topic: load("util/util").expression("ceye.util"),
            "adding util to circle, ": {
                topic: load("model/circle").expression("ceye.circle"),
                "creating object": {
                    topic: function(circle, util){
                        var util = new util();
                        return {circle: circle, util: util};
                    },
                    "circle model can set and get field properly": function(handles){
                        var circle = handles.circle;
                        var cr = new circle(1,1,1,1,1,"cmd",handles.util.sha,1);
                        //console.log(ci.hash);
                        assert.equal(cr.minute, 1, "circle's minute field should equal to 1.");
                    },
                    "circle can utilize sha function denpending on util" : function(handles){
                        var circle = handles.circle;
                        var msg = "test abc";
                        var shaed = handles.util.sha(msg);
                        var cr = new circle(1,1,1,1,1,"test abc", handles.util.sha,1);
                        assert.deepEqual(cr.hash, shaed, "Object circle should have same hash value.");
                     }
            }
        }
     }
});

suite.export(module);
