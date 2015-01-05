ceye.draw = function(gw,gh,lw,lh,margin){
    function me(){
        return "ceye.draw";
    }
    
    function total(data){
        var sum = 0;
        for(var i = 0; i < data.length; i++){
            sum += parseInt(data[i]);
        }
        return sum;
    }

    function avg(data){
        var mean = total(data) / data.length;
        return mean;
    }

    function merge(raw_data, prop){
        var data = [];
        for(var i = 0; i < raw_data.length; i++){
            for(var j = 0; j < raw_data[i][prop].length; j++){
               data.push({prop:raw_data[i][prop][j], cmd: raw_data[i].cmd, hash: raw_data[i].hash, length: raw_data[i].length}); 
            }
        }
        return data;
    }

    function sum(raw_data, prop){
        var output = [];
        for(var i = 0; i < raw_data.length; i++){
            output.push({prop: raw_data[i][prop], cmd: raw_data[i].cmd, hash: raw_data[i].hash, length: raw_data[i].length});
        }
        return output;
    }

    function spec(data, prop){
        var output = [];
        for(var i = 0; i < data[prop].length; i++){
            output.push({prop:data[prop][i], cmd: data.cmd, hash: data.hash, length: data.length});
        }
        return output;
    }

    function rndx(data){
        var id = Math.round(Math.random()*data.length);
        if (id >= data.length){
            id = data.length - 1;
        }
        return id;
    }

    var chart = d3.select("body").append("svg")
                        .attr("class", "chart")
                        .attr("width", gw)
                        .attr("height", gh);
    
    // define axis
    var x1 = d3.scale.linear().domain([0,59]).range([0,lw]);
    var x2 = d3.scale.linear().domain([0,23]).range([0,lw]);
    var x3 = d3.scale.linear().domain([1,7]).range([0,lw]);
    var x4 = d3.scale.linear().domain([1,31]).range([0,lw]);
    var x5 = d3.scale.linear().domain([1,12]).range([0,lw]);

    var x1axis = d3.svg.axis().scale(x1).ticks(12).orient("bottom");
    var x2axis = d3.svg.axis().scale(x2).ticks(24).orient("bottom");
    var x3axis = d3.svg.axis().scale(x3).ticks(7).orient("bottom");
    var x4axis = d3.svg.axis().scale(x4).ticks(31).orient("bottom");
    var x5axis = d3.svg.axis().scale(x5).ticks(12).orient("bottom");

    var g1 = chart.append("g").attr("transform", "translate("+margin.left+",0)");
    var g2 = chart.append("g").attr("transform", "translate("+margin.left+","+(0.5*lh)+")");
    var g3 = chart.append("g").attr("transform", "translate("+margin.left+","+(3.5*lh)+")");
    var g4 = chart.append("g").attr("transform", "translate("+margin.left+","+(4*lh)+")");
    var g5 = chart.append("g").attr("transform", "translate("+margin.left+","+(4.5*lh)+")");
    var g0 = chart.append("g").attr("transform", "translate("+margin.left+","+(0.5*lh)+")");
 
    var y1, y2 ,y3, y4, y5;

    var tip = d3.select("body").append("div").attr("class","tooltip").style("opacity",1e-6);

    // calculate circle radius
    function radius(d){
        return parseInt((d.hash.charCodeAt(0))*0.082,10);
    }

    // calculate circle color
    function fill(d){
        return "rgb("+parseInt(d.hash.charCodeAt(0)*2.1,10)+","+parseInt(d.hash.charCodeAt(1)*2.1,10)+","+parseInt(d.hash.charCodeAt(2)*2.1,10)+")";
    }

    // show tip contents
    function tipup(d){
        //var d = this.__data__;
        //var contents = '';
        var ctx_size = 50;
        if(d.cmd.length > ctx_size){
            contents = d.cmd.substring(1,ctx_size) + "..."; 
        }else{
            contents = d.cmd;
        }
        console.log(contents);
        tip.text(contents).style("left",(d3.event.pageX-100)+"px").style("top", (d3.event.pageY-40)+"px");
        tip.transition().duration(500).style("opacity",1);
    }

    // hide tip
    function tipout(){
        tip.transition().duration(500).style("opacity",1e-6); 
    }

    function init(){
        return chart; 
    }

    // find data item by condition value
    function find(data, cond, cont){
        var tmp;
        for(var i = 0; i < data.length; i++){
           if(data[i][cond] === cont){
            tmp = data[i];
           } 
        }
        return tmp;
    }
    
    function redraw(item_minute, item_hour, item_week, item_day, item_month){
        g1.selectAll("circle").data([]).exit().remove();
        g3.selectAll("circle").data([]).exit().remove();
        g4.selectAll("circle").data([]).exit().remove();
        g5.selectAll("circle").data([]).exit().remove();
        
        g5.selectAll("circle").data(item_month).enter().append("circle")
            .attr("cy", y1(1)).attr("cx", function(d){return x5(d.prop);}).attr("r",8)
            .style("fill", fill).style("opacity", 0.7).style("stroke", "black");
        g5.selectAll("circle").data(item_month).exit().remove();
 
        g4.selectAll("circle").data(item_day).enter().append("circle")
            .attr("cy", y1(1)).attr("cx", function(d){return x4(d.prop);}).attr("r",8)
            .style("fill", fill).style("opacity", 0.7).style("stroke", "black");
        g4.selectAll("circle").data(item_day).exit().remove();
 
        g3.selectAll("circle").data(item_week).enter().append("circle")
            .attr("cy", y1(1)).attr("cx", function(d){return x3(d.prop);}).attr("r",8)
            .style("fill", fill).style("opacity", 0.7).style("stroke", "black");
        g3.selectAll("circle").data(item_week).exit().remove();
 
        g1.selectAll("circle").data(item_minute).enter().append("circle")
            .attr("cy", y1(1)).attr("cx", function(d){return x1(d.prop);}).attr("r",8)
            .style("fill", fill).style("opacity", 0.7).style("stroke", "black");
        g1.selectAll("circle").data(item_minute).exit().remove();
    }

    function draw(data){
        var hour_data = sum(data, "hour");
        
        // define height of each scale
        y1 = d3.scale.linear().domain([0,2]).range([0.5*lh, margin.top + margin.bottom]);
        y2 = d3.scale.linear().domain([0,d3.max(hour_data, function(d,i){return i;})]).range([2.5*lh, margin.top + margin.bottom]);
        y3 = d3.scale.linear().domain([0,2]).range([0.5*lh, margin.top + margin.bottom]);
        y4 = d3.scale.linear().domain([0,2]).range([0.5*lh, margin.top + margin.bottom]);
        y5 = d3.scale.linear().domain([0,2]).range([0.5*lh, margin.top + margin.bottom]);
        
        // draw hour data by default
        g2.selectAll("circle").data(hour_data).enter().append("circle")
            .attr("cy", function(d,i){return y2(i);})
            .attr("cx", function(d){var id = rndx(d.prop); return x2(d.prop[id]);})
            .attr("r", radius)
            .style("fill", fill)
            .style("opacity",0.7)
            .style("stroke", "black")
            .on("mousedown", function(){
                var d = this.__data__;
                var item = find(data, "hash", d.hash); 
                var item_minute = spec(item, "minute");
                var item_week = spec(item, "week");
                var item_day = spec(item, "day");
                var item_month = spec(item, "month");
                var item_hour = spec(item, "hour");

                // show details of current selected item
                redraw(item_minute, item_hour, item_week, item_day, item_month);

                // reserve current(click point) status
                var cur_r = d3.select(this).attr("r");
                var cur_cy = d3.select(this).attr("cy");
                var cur_cx = d3.select(this).attr("cx");

                g0.selectAll("circle").data([]).exit().remove();
                g0.selectAll("circle").data(item_hour).enter().append("circle")
                    .attr("cy", cur_cy)
                    .attr("cx", cur_cx)
                    .attr("r", 0)
                    .style("fill", fill)
                    .style("opacity", 0.1)
                    .style("stroke", "black")
                    .transition()
                    .duration(100)
                    .attr("cy", cur_cy)
                    .attr("cx", function(d){return x2(d.prop);})
                    .attr("r", radius)
                    .style("fill", fill)
                    .style("opacity", 0.7)
                    .style("stroke", "black");
                d3.select(this).transition().duration(500).attr("r",20).transition().delay(450).attr("r", cur_r);

                g2.style("opacity",1).transition().duration(500).style("opacity",0.2);
                g0.style("opacity",0).transition().duration(500).style("opacity",1);
                g0.style("opacity",1).transition().duration(500).delay(2000).style("opacity",0);
                g2.style("opacity",0.2).transition().duration(1000).delay(2000).style("opacity",1);
                g0.select("circle").transition().delay(2000).remove();
                //tipup(d);
            })
            .on("mouseout",tipout)
            .on("mouseover", function(){
                var d = this.__data__;
                tipup(d);
            });

        g5.append("g").attr("class","x axis").attr("transform", "translate(0,"+(0.5*lh)+")").call(x5axis);
        g4.append("g").attr("class","x axis").attr("transform", "translate(0,"+(0.5*lh)+")").call(x4axis);
        g3.append("g").attr("class","x axis").attr("transform", "translate(0,"+(0.5*lh)+")").call(x3axis);
        g2.append("g").attr("class","x axis").attr("transform", "translate(0,"+(3*lh)+")").call(x2axis);
        g1.append("g").attr("class","x axis").attr("transform", "translate(0,"+(0.5*lh)+")").call(x1axis);
        g0.append("g").attr("class","x axis").attr("transform", "translate(0,"+(3*lh)+")").call(x2axis);
        g0.style("opacity",0);

        chart.append("text").attr("class","x axis").attr("text-anchor","end").attr("x",(margin.left-10)).attr("y",0.5*lh).text("Minute");
        chart.append("text").attr("class","x axis").attr("text-anchor","end").attr("x",(margin.left-10)).attr("y",3.5*lh).text("Hour");
        chart.append("text").attr("class","x axis").attr("text-anchor","end").attr("x",(margin.left-10)).attr("y",4*lh).text("Week");
        chart.append("text").attr("class","x axis").attr("text-anchor","end").attr("x",(margin.left-10)).attr("y",4.5*lh).text("Day");
        chart.append("text").attr("class","x axis").attr("text-anchor","end").attr("x",(margin.left-10)).attr("y",5*lh).text("Month");
    }

    function clean(){
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
