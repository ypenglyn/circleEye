!function() {
  var ceye = {
    version: "0.1.0"
  };
  ceye.circle = function(minute, hour, day, month, week, cmd, sha, length) {
    this.minute = minute;
    this.hour = hour;
    this.day = day;
    this.month = month;
    this.week = week;
    this.cmd = cmd;
    this.length = length;
    this.hash = sha(this.cmd);
  };
  ceye.parser = function(util, circle) {
    function me() {
      return "ceye.parser";
    }
    function clean(text) {
      var lines = text.split("\n");
      var result = "";
      for (var i in lines) {
        var line = lines[i].trim().replace(/\t/g, " ").replace(/\s+/g, " ");
        if (line.substr(0, 1) != "#") {
          result += line + "\n";
        }
      }
      return result;
    }
    function isValidLine(line) {
      return line.toUpperCase().indexOf("MAILTO") !== 0 && line.toUpperCase().indexOf("PATH") !== 0 && line.toUpperCase().indexOf("SHELL") !== 0 && line.toUpperCase().indexOf("HOME") !== 0 && line.toUpperCase().indexOf("LOGNAME") !== 0 && line.length > 0;
    }
    function getCollection(value) {
      try {
        var collection = value.split(",");
        return collection;
      } catch (e) {
        return null;
      }
    }
    function getRange(value, min, max) {
      if (value == "*") {
        return [ min, max ];
      }
      var range = value.split("-");
      return range;
    }
    function getStep(value) {
      var step = value.split("/");
      return step;
    }
    function interpretMin(min) {
      if (min === "*") {
        var mins = [];
        for (var i = 0; i < 60; i++) {
          mins.push("" + i);
        }
        return mins;
      }
      return getInterpretation(min, 0, 59);
    }
    function lookupValue(value, loopup) {
      if (value == parseInt(value) || !loopup) {
        return value;
      }
      return loopup.indexOf(value);
    }
    function getInterpretation(value, min, max, map, loopup) {
      var stepCollection = getCollection(value);
      if (stepCollection == null) {
        return null;
      }
      var collection = [];
      for (var i in stepCollection) {
        var step = getStep(stepCollection[i]);
        var stepSize = parseInt(step[1]);
        if (!stepSize || stepSize <= 0) {
          stepSize = 1;
        }
        var range = getRange(step[0], min, max);
        if (range.length > 1) {
          var start = parseInt(lookupValue(range[0], loopup));
          var end = parseInt(lookupValue(range[1], loopup));
          for (var r = start; r <= end && r <= max; r += stepSize) {
            collection.push(r);
          }
        } else {
          collection.push(lookupValue(range[0], loopup));
        }
      }
      collection.sort(function(a, b) {
        return b - a;
      });
      collection = util.unique(collection);
      return collection;
    }
    function interpretHour(hour) {
      if (hour === "*") {
        return [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23" ];
      }
      return getInterpretation(hour, 0, 23);
    }
    function interpretDayOfMonth(dayOfMonth) {
      if (dayOfMonth === "*") {
        var da = [];
        for (var i = 1; i <= 31; i++) da.push("" + i);
        return da;
      }
      return getInterpretation(dayOfMonth, 1, 31);
    }
    function interpretMonth(month) {
      if (month === "*") {
        return [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" ];
      }
      return getInterpretation(month, 1, 12);
    }
    function interpretDayOfWeek(dayOfWeek) {
      if (dayOfWeek === "*") {
        return [ "1", "2", "3", "4", "5", "6", "7" ];
      }
      return getInterpretation(dayOfWeek, 1, 7);
    }
    function processLine(line) {
      var data = line.split(" ");
      var minute = data[0];
      var hour = data[1];
      var day_of_month = data[2];
      var month = data[3];
      var day_of_week = data[4];
      var command = "";
      for (var i = 5; i < data.length; i++) {
        command += data[i] + " ";
      }
      command = command.trim();
      var setMinute = interpretMin(minute);
      var setHour = interpretHour(hour);
      var setDayOfMonth = interpretDayOfMonth(day_of_month);
      var setMonth = interpretMonth(month);
      var setDay = interpretDayOfWeek(day_of_week);
      return new circle(setMinute, setHour, setDayOfMonth, setMonth, setDay, command, util.sha, command.length);
    }
    function parse(data) {
      var text = clean(data);
      var lines = text.split("\n");
      var result = [];
      for (var i in lines) {
        var line = lines[i].trim();
        if (isValidLine(line)) {
          var parsedObj = processLine(line);
          result.push(parsedObj);
        }
      }
      return result;
    }
    return {
      me: me,
      clean: clean,
      isValidLine: isValidLine,
      parse: parse
    };
  };
  ceye.util = function() {
    function me() {
      return "ceye.util";
    }
    function unique(array) {
      var hash = {}, result = [];
      for (var i = 0, l = array.length; i < l; ++i) {
        if (!hash.hasOwnProperty(array[i])) {
          hash[array[i]] = true;
          result.push(array[i]);
        }
      }
      return result;
    }
    function sha(msg) {
      function rotate_left(n, s) {
        var t4 = n << s | n >>> 32 - s;
        return t4;
      }
      function lsb_hex(val) {
        var str = "";
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
          vh = val >>> i * 4 + 4 & 15;
          vl = val >>> i * 4 & 15;
          str += vh.toString(16) + vl.toString(16);
        }
        return str;
      }
      function cvt_hex(val) {
        var str = "";
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
          v = val >>> i * 4 & 15;
          str += v.toString(16);
        }
        return str;
      }
      function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if (c > 127 && c < 2048) {
            utftext += String.fromCharCode(c >> 6 | 192);
            utftext += String.fromCharCode(c & 63 | 128);
          } else {
            utftext += String.fromCharCode(c >> 12 | 224);
            utftext += String.fromCharCode(c >> 6 & 63 | 128);
            utftext += String.fromCharCode(c & 63 | 128);
          }
        }
        return utftext;
      }
      var blockstart;
      var i, j;
      var W = new Array(80);
      var H0 = 1732584193;
      var H1 = 4023233417;
      var H2 = 2562383102;
      var H3 = 271733878;
      var H4 = 3285377520;
      var A, B, C, D, E;
      var temp;
      msg = Utf8Encode(msg);
      var msg_len = msg.length;
      var word_array = new Array();
      for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
      }
      switch (msg_len % 4) {
       case 0:
        i = 2147483648;
        break;

       case 1:
        i = msg.charCodeAt(msg_len - 1) << 24 | 8388608;
        break;

       case 2:
        i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 32768;
        break;

       case 3:
        i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 128;
        break;
      }
      word_array.push(i);
      while (word_array.length % 16 != 14) word_array.push(0);
      word_array.push(msg_len >>> 29);
      word_array.push(msg_len << 3 & 4294967295);
      for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
          temp = rotate_left(A, 5) + (B & C | ~B & D) + E + W[i] + 1518500249 & 4294967295;
          E = D;
          D = C;
          C = rotate_left(B, 30);
          B = A;
          A = temp;
        }
        for (i = 20; i <= 39; i++) {
          temp = rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 1859775393 & 4294967295;
          E = D;
          D = C;
          C = rotate_left(B, 30);
          B = A;
          A = temp;
        }
        for (i = 40; i <= 59; i++) {
          temp = rotate_left(A, 5) + (B & C | B & D | C & D) + E + W[i] + 2400959708 & 4294967295;
          E = D;
          D = C;
          C = rotate_left(B, 30);
          B = A;
          A = temp;
        }
        for (i = 60; i <= 79; i++) {
          temp = rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 3395469782 & 4294967295;
          E = D;
          D = C;
          C = rotate_left(B, 30);
          B = A;
          A = temp;
        }
        H0 = H0 + A & 4294967295;
        H1 = H1 + B & 4294967295;
        H2 = H2 + C & 4294967295;
        H3 = H3 + D & 4294967295;
        H4 = H4 + E & 4294967295;
      }
      var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
      return temp.toLowerCase();
    }
    return {
      me: me,
      unique: unique,
      sha: sha
    };
  };
  var ceye_util = ceye.util;
  ceye.draw = function(gw, gh, lw, lh, margin) {
    function me() {
      return "ceye.draw";
    }
    function total(data) {
      var sum = 0;
      for (var i = 0; i < data.length; i++) {
        sum += parseInt(data[i]);
      }
      return sum;
    }
    function avg(data) {
      var mean = total(data) / data.length;
      return mean;
    }
    function merge(raw_data, prop) {
      var data = [];
      for (var i = 0; i < raw_data.length; i++) {
        for (var j = 0; j < raw_data[i][prop].length; j++) {
          data.push({
            prop: raw_data[i][prop][j],
            cmd: raw_data[i].cmd,
            hash: raw_data[i].hash,
            length: raw_data[i].length
          });
        }
      }
      return data;
    }
    function sum(raw_data, prop) {
      var output = [];
      for (var i = 0; i < raw_data.length; i++) {
        output.push({
          prop: raw_data[i][prop],
          cmd: raw_data[i].cmd,
          hash: raw_data[i].hash,
          length: raw_data[i].length
        });
      }
      return output;
    }
    function spec(data, prop) {
      var output = [];
      for (var i = 0; i < data[prop].length; i++) {
        output.push({
          prop: data[prop][i],
          cmd: data.cmd,
          hash: data.hash,
          length: data.length
        });
      }
      return output;
    }
    function rndx(data) {
      var id = Math.round(Math.random() * data.length);
      if (id >= data.length) {
        id = data.length - 1;
      }
      return id;
    }
    var chart = d3.select("body").append("svg").attr("class", "chart").attr("width", gw).attr("height", gh);
    var x1 = d3.scale.linear().domain([ 0, 59 ]).range([ 0, lw ]);
    var x2 = d3.scale.linear().domain([ 0, 23 ]).range([ 0, lw ]);
    var x3 = d3.scale.linear().domain([ 1, 7 ]).range([ 0, lw ]);
    var x4 = d3.scale.linear().domain([ 1, 31 ]).range([ 0, lw ]);
    var x5 = d3.scale.linear().domain([ 1, 12 ]).range([ 0, lw ]);
    var x1axis = d3.svg.axis().scale(x1).ticks(12).orient("bottom");
    var x2axis = d3.svg.axis().scale(x2).ticks(24).orient("bottom");
    var x3axis = d3.svg.axis().scale(x3).ticks(7).orient("bottom");
    var x4axis = d3.svg.axis().scale(x4).ticks(31).orient("bottom");
    var x5axis = d3.svg.axis().scale(x5).ticks(12).orient("bottom");
    var g1 = chart.append("g").attr("transform", "translate(" + margin.left + ",0)");
    var g2 = chart.append("g").attr("transform", "translate(" + margin.left + "," + .5 * lh + ")");
    var g3 = chart.append("g").attr("transform", "translate(" + margin.left + "," + 3.5 * lh + ")");
    var g4 = chart.append("g").attr("transform", "translate(" + margin.left + "," + 4 * lh + ")");
    var g5 = chart.append("g").attr("transform", "translate(" + margin.left + "," + 4.5 * lh + ")");
    var g0 = chart.append("g").attr("transform", "translate(" + margin.left + "," + .5 * lh + ")");
    var y1, y2, y3, y4, y5;
    var tip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1e-6);
    function radius(d) {
      return parseInt(d.hash.charCodeAt(0) * .082, 10);
    }
    function fill(d) {
      return "rgb(" + parseInt(d.hash.charCodeAt(0) * 2.1, 10) + "," + parseInt(d.hash.charCodeAt(1) * 2.1, 10) + "," + parseInt(d.hash.charCodeAt(2) * 2.1, 10) + ")";
    }
    function tipup(d) {
      var ctx_size = 50;
      if (d.cmd.length > ctx_size) {
        contents = d.cmd.substring(1, ctx_size) + "...";
      } else {
        contents = d.cmd;
      }
      console.log(contents);
      tip.text(contents).style("left", d3.event.pageX - 100 + "px").style("top", d3.event.pageY - 40 + "px");
      tip.transition().duration(500).style("opacity", 1);
    }
    function tipout() {
      tip.transition().duration(500).style("opacity", 1e-6);
    }
    function init() {
      return chart;
    }
    function find(data, cond, cont) {
      var tmp;
      for (var i = 0; i < data.length; i++) {
        if (data[i][cond] === cont) {
          tmp = data[i];
        }
      }
      return tmp;
    }
    function redraw(item_minute, item_hour, item_week, item_day, item_month) {
      g1.selectAll("circle").data([]).exit().remove();
      g3.selectAll("circle").data([]).exit().remove();
      g4.selectAll("circle").data([]).exit().remove();
      g5.selectAll("circle").data([]).exit().remove();
      g5.selectAll("circle").data(item_month).enter().append("circle").attr("cy", y1(1)).attr("cx", function(d) {
        return x5(d.prop);
      }).attr("r", 8).style("fill", fill).style("opacity", .7).style("stroke", "black");
      g5.selectAll("circle").data(item_month).exit().remove();
      g4.selectAll("circle").data(item_day).enter().append("circle").attr("cy", y1(1)).attr("cx", function(d) {
        return x4(d.prop);
      }).attr("r", 8).style("fill", fill).style("opacity", .7).style("stroke", "black");
      g4.selectAll("circle").data(item_day).exit().remove();
      g3.selectAll("circle").data(item_week).enter().append("circle").attr("cy", y1(1)).attr("cx", function(d) {
        return x3(d.prop);
      }).attr("r", 8).style("fill", fill).style("opacity", .7).style("stroke", "black");
      g3.selectAll("circle").data(item_week).exit().remove();
      g1.selectAll("circle").data(item_minute).enter().append("circle").attr("cy", y1(1)).attr("cx", function(d) {
        return x1(d.prop);
      }).attr("r", 8).style("fill", fill).style("opacity", .7).style("stroke", "black");
      g1.selectAll("circle").data(item_minute).exit().remove();
    }
    function draw(data) {
      var hour_data = sum(data, "hour");
      y1 = d3.scale.linear().domain([ 0, 2 ]).range([ .5 * lh, margin.top + margin.bottom ]);
      y2 = d3.scale.linear().domain([ 0, d3.max(hour_data, function(d, i) {
        return i;
      }) ]).range([ 2.5 * lh, margin.top + margin.bottom ]);
      y3 = d3.scale.linear().domain([ 0, 2 ]).range([ .5 * lh, margin.top + margin.bottom ]);
      y4 = d3.scale.linear().domain([ 0, 2 ]).range([ .5 * lh, margin.top + margin.bottom ]);
      y5 = d3.scale.linear().domain([ 0, 2 ]).range([ .5 * lh, margin.top + margin.bottom ]);
      g2.selectAll("circle").data(hour_data).enter().append("circle").attr("cy", function(d, i) {
        return y2(i);
      }).attr("cx", function(d) {
        var id = rndx(d.prop);
        return x2(d.prop[id]);
      }).attr("r", radius).style("fill", fill).style("opacity", .7).style("stroke", "black").on("mousedown", function() {
        var d = this.__data__;
        var item = find(data, "hash", d.hash);
        var item_minute = spec(item, "minute");
        var item_week = spec(item, "week");
        var item_day = spec(item, "day");
        var item_month = spec(item, "month");
        var item_hour = spec(item, "hour");
        redraw(item_minute, item_hour, item_week, item_day, item_month);
        var cur_r = d3.select(this).attr("r");
        var cur_cy = d3.select(this).attr("cy");
        var cur_cx = d3.select(this).attr("cx");
        g0.selectAll("circle").data([]).exit().remove();
        g0.selectAll("circle").data(item_hour).enter().append("circle").attr("cy", cur_cy).attr("cx", cur_cx).attr("r", 0).style("fill", fill).style("opacity", .1).style("stroke", "black").transition().duration(100).attr("cy", cur_cy).attr("cx", function(d) {
          return x2(d.prop);
        }).attr("r", radius).style("fill", fill).style("opacity", .7).style("stroke", "black");
        d3.select(this).transition().duration(500).attr("r", 20).transition().delay(450).attr("r", cur_r);
        g2.style("opacity", 1).transition().duration(500).style("opacity", .2);
        g0.style("opacity", 0).transition().duration(500).style("opacity", 1);
        g0.style("opacity", 1).transition().duration(500).delay(2e3).style("opacity", 0);
        g2.style("opacity", .2).transition().duration(1e3).delay(2e3).style("opacity", 1);
        g0.select("circle").transition().delay(2e3).remove();
      }).on("mouseout", tipout).on("mouseover", function() {
        var d = this.__data__;
        tipup(d);
      });
      g5.append("g").attr("class", "x axis").attr("transform", "translate(0," + .5 * lh + ")").call(x5axis);
      g4.append("g").attr("class", "x axis").attr("transform", "translate(0," + .5 * lh + ")").call(x4axis);
      g3.append("g").attr("class", "x axis").attr("transform", "translate(0," + .5 * lh + ")").call(x3axis);
      g2.append("g").attr("class", "x axis").attr("transform", "translate(0," + 3 * lh + ")").call(x2axis);
      g1.append("g").attr("class", "x axis").attr("transform", "translate(0," + .5 * lh + ")").call(x1axis);
      g0.append("g").attr("class", "x axis").attr("transform", "translate(0," + 3 * lh + ")").call(x2axis);
      g0.style("opacity", 0);
      chart.append("text").attr("class", "x axis").attr("text-anchor", "end").attr("x", margin.left - 10).attr("y", .5 * lh).text("Minute");
      chart.append("text").attr("class", "x axis").attr("text-anchor", "end").attr("x", margin.left - 10).attr("y", 3.5 * lh).text("Hour");
      chart.append("text").attr("class", "x axis").attr("text-anchor", "end").attr("x", margin.left - 10).attr("y", 4 * lh).text("Week");
      chart.append("text").attr("class", "x axis").attr("text-anchor", "end").attr("x", margin.left - 10).attr("y", 4.5 * lh).text("Day");
      chart.append("text").attr("class", "x axis").attr("text-anchor", "end").attr("x", margin.left - 10).attr("y", 5 * lh).text("Month");
    }
    function clean() {
      chart.selectAll("*").remove();
      d3.select("svg").remove();
    }
    return {
      me: me,
      init: init,
      draw: draw,
      clean: clean
    };
  };
  if (typeof define === "function" && define.amd) {
    define(ceye);
  } else if (typeof module === "object" && module.exports) {
    module.exports = ceye;
  } else {
    this.ceye = ceye;
  }
}();