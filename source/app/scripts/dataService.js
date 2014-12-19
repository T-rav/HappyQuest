function DataService(){
    
	var self = this;

	self.persistTask = function(today, distractionList, taskDescription, taskMinutes, taskStart, taskStatus){

		var key = today+"_taskList";

		// look for entry, if empty create for persist
		var entry = self.fetchJson(key);
		if(entry === ""){
			entry = [];
			self.persistMasterDate();
		}

		entry.push({"distractionList": distractionList, "taskDescription" : taskDescription, "getTaskMinutes" : taskMinutes, "taskStart" : taskStart, "taskStatus" : taskStatus});
		self.persistJson(key, entry);

	};

	self.setLastTaskStatus = function(today, status){
		var key = today+"_taskList";
		var entry = self.fetchJson(key);
		if(entry === ""){
			return;
		}

		var len = entry.length-1;
		
		if(len >= 0){
			entry[len].taskStatus = status;
		}

		self.persistJson(key, entry);

	};

	self.persistMasterDate = function(today){

		var masterDate = self.fetch("masterDate");
		if(masterDate === ""){
			self.persist("masterDate", today);
		}
	};

	self.persistDailyMasterStats = function(today, entry){
		var key = today+"_masterStats";

		self.persistJson(key, entry);

	};

	self.fetchDailyMasterStats = function(today){
		var key = today+"_masterStats"
		var entry = self.fetchJson(key);
		if(entry === ""){
			entry = {};
			entry.attempts = 0;
			entry.achieved = 0;
		}

		return entry;
	};

	self.fetchGlobalStats = function(){
		var key = "globalStats"
		var entry = self.fetchJson(key);
		if(entry === ""){
			entry = {};
			entry.attempts = 0;
			entry.achieved = 0;
		}

		return entry;

	};

	self.persistGlobalStats = function(entry){
		var key = "globalStats";
		self.persistJson(key, entry);

	};

	self.persistJson = function(key, jsonableObject){
		prefs.store(noop, noop, key, JSON.stringify(jsonableObject));
	};

	self.persist = function(key, value){
		prefs.store(noop, noop, key, value);
	};

	self.fetchJson = function(key){
		var result = "";
		prefs.fetch(function (value) {
			result = JSON.parse(value);
		}, function (error) {}, key);
		return result;
	};

	self.fetch = function(key, value){
		var result = "";
		prefs.fetch(function (value) {
			result = value;
		}, function (error) {}, key);
		return result;
	};

}
