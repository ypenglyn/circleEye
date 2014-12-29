var vows = require("vows"),
    assert = require("assert"),
    load = require("../load");

var suite = vows.describe("Parser Test");

suite.addBatch({
    "test parser:": {
        topic: load("parser/parser").expression("ceye.parser"),
        "loading parser, ": {
            topic: load("model/circle").expression("ceye.circle"),
            " load circle object": {
                topic: load("util/util").expression("ceye.util"),
                "load util function": {
                    topic: function(util, circle, parser){ 
                        var util = new util();
                        var parser = new parser(util,circle);
                        return {circle: circle, parser: parser, util: util};
                    },
                    "parser cleans line-text by removing tab and multiple space": function(handles){
                        var parser = handles.parser;
                        //console.log("<"+parser.clean(" 00 0  * *   * test  i2 ")+">");
                        assert.equal(parser.clean("  00 0    * *   * test  "), "00 0 * * * test\n", "unnecessary tab and space are removed.");
                        //console.log("<"+parser.clean(" # test")+">");
                        assert.equal(parser.clean("# test test"), "", "commented line should be ignored.");
                    },
                    "parser isValidLine removes crontab specific lines like: MAILTO, SHELL etc, al.": function(handles){
                        var parser = handles.parser;
                        //console.log("----");
                        assert.equal(parser.isValidLine("00 0 * * * test"), true, "hit normal case line");
                        assert.equal(parser.isValidLine("MAILTO"), false, "hit crontab specific line MAILTO");
                        assert.equal(parser.isValidLine("PATH"), false, "hit crontab specific line PATH");
                        assert.equal(parser.isValidLine("SHELL"), false, "hit crontab specific line SHELL");
                        assert.equal(parser.isValidLine("HOME"), false, "hit crontab specific line HOME");
                        assert.equal(parser.isValidLine("LOGNAME"), false, "hit crontab specific line LOGNAME");
                    },
                    "parser parse multiple line of cron": function(handles){
                        var circle = handles.circle;
                        var parser = handles.parser;
                        var cr = new circle(['0'],['0'],['1'],['1'],['1'],"test2",handles.util.sha,5); 
                        var text = "00 0 * * * java\n 0 0 1 1 1 test2\n";
                        var result = parser.parse(text);
                        //console.log(result[1]);
                        //console.log(cr);
                        assert.deepEqual(result[1].minute, cr.minute, "Parsed object shoud have same values 1.");
                        assert.deepEqual(result[1].hour, cr.hour, "Parsed object shoud have same values 2.");
                        assert.deepEqual(result[1].day, cr.day, "Parsed object shoud have same values 3.");
                        assert.deepEqual(result[1].month, cr.month, "Parsed object shoud have same values 4.");
                        assert.deepEqual(result[1].cmd, cr.cmd, "Parsed object shoud have same values 5.");
                        assert.deepEqual(result[1].hash, cr.hash, "Parsed object shoud have same values 6.");
                    }
                }
            }
        }
     }    
});

suite.export(module);
