var vows = require("vows"),
    load = require("../load"),
    assert = require("assert"),
    d3 = require("d3"),
    jsdom = require("jsdom"),
    ctx = require('contextify'),
    fs = require("fs");

var suite = vows.describe("Draw Test");

suite.addBatch({
    "load draw function": {
        topic: load("draw/draw").expression("ceye.draw"),
        "function object is loaded by smash": function(draw){
            assert.equal(typeof draw, "function", "Object should be loaded properly.");      
        },
        "create object by new": function(draw){
            var sandbox = ctx({console:console, d3: d3});
            var src = "var ceye = " +draw+ ";";
            var exc = "var result = new ceye(1000,1000,100,100,{top:25,right:20,bottom:25,left:20}).me()";
            sandbox.run(src+" "+exc);
            //console.log(sandbox.result);
            assert.equal(sandbox.result, "ceye.draw", "draw should have me function."); 
            sandbox.dispose();
        }
     },
     "prepare to draw svg": {
        topic: load("draw/draw").expression("ceye.draw"),
        "load d3 object and document to sandbox": function(draw){
            var html = fs.readFileSync(__dirname+"/../template/chart.html",{encoding: "utf8"});     
            var doc = jsdom.jsdom(html, null, {});
            var win = doc.createWindow();
            //console.log(doc.documentElement);
            //console.log(doc.innerHTML);
            //console.log(win.document.innerHTML);
            var sandbox = ctx({console:console, d3: d3, document: doc, window: win});
            //sandbox.run("var ver = d3.version;");
            //console.log(sandbox.ver);
            //assert.equal(sandbox.run("console.log('test')"), "test", "run draw code with injected console");
            var src = "var ceye="+draw+";";
            var exc = "var result = new ceye(1000,1000,100,100,{top:25,right:20,bottom:25,left:20});";
            var cht = "var chart = result.init();"
            sandbox.run(src+" "+exc+" "+cht);
            //console.log(sandbox.chart+" ");
            assert.equal(sandbox.chart.__proto__.length, 0, "should be 0");
            sandbox.dispose();
        }
     },
    "draw svg by local data:": {
        topic: load("parser/parser").expression("ceye.parser"),
        "load parser -> ": {
            topic: load("model/circle").expression("ceye.circle"),
            " load model -> ": {
                topic: load("util/util").expression("ceye.util"),
                "load util -> ": {
                    topic: load("draw/draw").expression("ceye.draw"),
                    "load draw -> ": {
                        topic: function(draw, util, circle, parser){ 
                            var util = new util();
                            var parser = new parser(util,circle);
                            var text = "00 1 * * * test\n 0 0 1 1 1 test2\n";
                            var cron = parser.parse(text);

                            return {circle: circle, cron: cron, draw: draw};
                        },
                        "draw svg": function(handles){
                            var draw = handles.draw;
                            var cron = handles.cron;
                            //console.log(" "+JSON.stringify(cron));
                            var html = fs.readFileSync(__dirname+"/../template/chart.html",{encoding: "utf8"});     
                            var doc = jsdom.jsdom(html, null, {});
                            var win = doc.createWindow();
                            var sandbox = ctx({console:console, d3: d3, document: doc, window: win, cron: cron});
                            var src = "var ceye="+draw+";";
                            var exc = "var result = new ceye(1000,1000,100,100,{top:25,right:20,bottom:25,left:20});";
                            var cht = "var chart = result.init();"
                            var paint = "var paint = result.draw(cron);";
                            
                            sandbox.run(src+" "+exc+" "+cht+" "+paint);
                            assert.equal(sandbox.chart.__proto__.length, 0, "should be 0");
                            sandbox.dispose();
                        }
                    }
                }
            }
        }
     } 
});

suite.export(module);
