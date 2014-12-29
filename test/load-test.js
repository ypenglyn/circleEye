var vows = require("vows"),
    load = require("./load"),
    assert = require("chai").assert,
    jsdom = require("jsdom"),
    fs = require("fs");

var suite = vows.describe("Source Loading Test");

suite.addBatch({
    "load sources from fs:": {
        topic: load("util/util").expression("ceye.util"),
        "function object is loaded by smash": function(util){
            //console.log(" "+util);
            assert.equal(typeof util, "function", "Object should be loaded properly.");      
        },
        "create object by new": function(util){
            //console.log(test);
            assert.equal(new util().me(), "ceye.util", "util should have me function."); 
        }
     },
     "add source to document:": {
        topic: load("util/util").expression("ceye.util"),
        "create document object using jsdom": {
            topic: function(util){
                //console.log("var ceye ="+ util);
                return jsdom.jsdom("<html></html>",null, {src: "var ceye="+util+";"});
            },
            "document innerHTML should loaded as injected": function(document){
                //console.log(document.innerHTML);
                assert.deepEqual(document.innerHTML, "<html></html>", "document can not be created properly.");
            },
            "-> load document template from fs": {
                topic: function() {
                    //console.log(__dirname);
                    fs.readFile(__dirname+"/template/helloworld.html",{encoding: "utf8"}, this.callback);     
                },
                "and customizing": {
                    topic: function(html, browser, util){
                        return {document: jsdom.jsdom(html, null, {src: ["var ceye ="+util+";"]}), util:util};
                    },
                    "update document contents dynamically": function(handles){
                        var document = handles.document;
                        //console.log(document.innerHTML);
                         
                        var util = handles.util;
                        if(document.getElementById("foo").fireEvent){
                            document.getElementById("foo").attachEvent("onclick", update());
                            document.getElementById("foo").fireEvent("onclick");   
                        }else if(document.getElementById("foo").dispatchEvent){
                            document.getElementById("foo").addEventListener("click", update(), false);
                            var clickevent = document.createEvent("MouseEvents");
                            clickevent.initEvent("click", true, true);
                            document.getElementById("foo").dispatchEvent(clickevent);   
                        }
                        //console.log(util()); 
                        function update(){
                            //console.log(document.getElementById("foo").value);
                            //console.log(util().me());    
                            document.getElementById("foo").value = util().me();
                        }
                        //console.log(document.innerHTML);
                        assert.match(document.innerHTML, /[ -/:-@\[-\`\{-\~a-zA-Z0-9]*ceye\.util[ -/:-@\[-\`\{-\~a-zA-Z0-9]*/, "document can be updated manually.");
                    }
                }     
            }
        }    
     }
});

suite.export(module);
