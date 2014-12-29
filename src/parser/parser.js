ceye.parser = function(util, circle){
    function me(){
        return "ceye.parser";
    }

    function clean(text){
        var lines = text.split('\n');
        var result = '';
        for (var i in lines){
            var line = lines[i].trim().replace(/\t/g," ").replace(/\s+/g," ");
            if(line.substr(0,1) != '#'){
                result += line + '\n';
            }
        }
        return result;
    }

    function isValidLine(line){
        return (
                line.toUpperCase().indexOf('MAILTO') !== 0
                && line.toUpperCase().indexOf('PATH') !== 0
                && line.toUpperCase().indexOf('SHELL') !== 0
                && line.toUpperCase().indexOf('HOME') !== 0
                && line.toUpperCase().indexOf('LOGNAME') !== 0
                && line.length > 0
        );
    }

    function getCollection(value){
        try{
            var collection = value.split(',');
            return collection
        } catch (e){
            return null;
        }
    }

    function getRange(value, min, max){
        if (value == '*'){
            return [min, max];
        }
        var range = value.split('-');
        return range;
    }

    function getStep(value){
        var step = value.split('/');
        return step;
    }

    function interpretMin(min){
        if (min === '*'){
            var mins = [];
            for (var i = 0; i < 60; i++){
                mins.push(""+i);
            }
            return mins;
        }
        return getInterpretation(min, 0, 59);
    }

    function lookupValue(value, loopup){
        if (value == parseInt(value) || !loopup){
            return value;
        }
        return loopup.indexOf(value);
    }

    function getInterpretation(value, min, max, map, loopup){
        var stepCollection = getCollection(value); 
        if(stepCollection == null){
            return null;
        }

        var collection = [];
        for (var i in stepCollection){
            var step = getStep(stepCollection[i]);
            var stepSize = parseInt(step[1]);
            if(!stepSize || stepSize <= 0) {
                stepSize = 1;
            }

            var range = getRange(step[0], min, max);
            if(range.length > 1){
                var start = parseInt(lookupValue(range[0], loopup));
                var end = parseInt(lookupValue(range[1], loopup));
                for (var r = start; r <= end && r <= max; r += stepSize ){
                    collection.push(r);
                }
            }else{
                collection.push(lookupValue(range[0], loopup));
            }
        }
        collection.sort(function(a,b){return b-a;});
        collection = util.unique(collection);
        return collection;
    }

    function interpretHour(hour){
        if(hour === '*'){
            return ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
        }
        return getInterpretation(hour, 0, 23);
    }

    function interpretDayOfMonth(dayOfMonth){
        if(dayOfMonth === '*'){
            var da = [];
            for (var i = 1; i <= 31; i++)
                da.push(""+i);
            return da;
        }
        return getInterpretation(dayOfMonth, 1, 31);
    }

    function interpretMonth(month) {
        if(month === '*'){
            return ['1','2','3','4','5','6','7','8','9','10','11','12'];
        }
        return getInterpretation(month, 1, 12);
    }

    function interpretDayOfWeek(dayOfWeek){
        if (dayOfWeek === '*'){
            return ['1','2','3','4','5','6','7'];
        }
        return getInterpretation(dayOfWeek, 1, 7);
    }

    function processLine(line){
        var data = line.split(' ');
        var minute = data[0];
        var hour = data[1];
        var day_of_month = data[2];
        var month = data[3];
        var day_of_week = data[4];

        var command = '';
        for (var i = 5; i < data.length; i++){
            command += data[i] + ' ';
        }
        command = command.trim();
        var setMinute = interpretMin(minute);
        var setHour = interpretHour(hour);
        var setDayOfMonth = interpretDayOfMonth(day_of_month);
        var setMonth = interpretMonth(month);
        var setDay = interpretDayOfWeek(day_of_week);
        
        return new circle(setMinute, setHour, setDayOfMonth, setMonth, setDay, command, util.sha, command.length);
    }

    function parse(data){
        var text = clean(data);
        var lines = text.split('\n');
        var result = [];
        for (var i in lines){
            var line = lines[i].trim();
            if(isValidLine(line)){
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
