	if (typeof define === "function" && define.amd){
		define(ceye);
	} else if (typeof module === "object" && module.exports){
        module.exports = ceye;    
    } else {
        this.ceye = ceye;    
    }
}();
