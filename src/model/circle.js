//import "../util/util";

ceye.circle = function (minute, hour, day, month, week, cmd, sha, length) {
    this.minute = minute;
    this.hour = hour;
    this.day = day;
    this.month = month;
    this.week = week;
    this.cmd = cmd;
    this.length = length;
    this.hash = sha(this.cmd);
};
