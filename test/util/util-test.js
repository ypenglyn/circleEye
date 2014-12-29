var vows = require("vows"),
    assert = require("assert"),
    load = require("../load");

var suite = vows.describe("Utility Test");

suite.addBatch({
    "test util functions:": {
        topic: load("util/util").expression("ceye.util"),
        "delete duplicated elements from [1,1,2,3,4,5,1,] to [1,2,3,4,5]": function(util){
            var arr = new util().unique([1,1,2,3,4,5,1,2]);
            assert.deepEqual(arr, [1,2,3,4,5], "unique should be able to remove duplicated elements." + arr); 
        },
        "different messages has different hash values": function(util){
            var msg1 = "test abc";
            var msg2 = "test ab";    
            assert.notDeepEqual(new util().sha(msg1), new util().sha(msg2), "sha should generate different hash for different message.");
        }
    }
});

suite.export(module);
