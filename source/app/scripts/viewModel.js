	function ViewModel(viewService, dataService){
		var self = this;
		self.viewService = viewService;
		self.dataService = dataService;

		self.taskButtonText = ko.observable("Start Task");
		self.taskStart = ko.observable();
		self.taskDescription = ko.observable("");
		self.taskLength = [ "40 Minutes", "50 Minutes", "60 Minutes", "70 Minutes", "80 Minutes", "90 Minutes"];
		self.selectedLength = ko.observable("50 Minutes");
		self.prepMessage = ko.observable("Setup for Success");
		self.taskTimerValue = ko.observable("??:??");

		self.dailyAchieved = ko.observable("00");
		self.globalAchieved = ko.observable("00");
		self.globalAttempts = ko.observable("00");

		self.historyList = ko.observableArray();

		self.distractionList = [];
		self.naturalStop = false;
		
		self.taskMode = ko.observable(1); // 1 -- Start, 2 - Stop

		self.init = function(){
			var today = self.viewService.getToday();
			// update daily stats
			var statsObj = self.dataService.fetchDailyMasterStats(today);
			// update view model property
			self.dailyAchieved(statsObj.achieved);

			// update global stats
			var globalStatsObj = self.dataService.fetchGlobalStats();
			self.globalAchieved(globalStatsObj.achieved);
			self.globalAttempts(globalStatsObj.attempts);
			
			// pump history on start ;)
			var history = globalStatsObj.historyList;
			var keys = Object.keys(history);

			for(var i = 0 ; i < keys.length; i++){
				self.historyList().push({"dateOf":keys[i],"attempts" : history[keys[i]].attempts + " - Attempts ","achieved" : history[keys[i]].achieved + " - Achieved"});
			}

		};

		self.startTask = function(){

			if(!self.validate()){
				return;
			}

			self.toggleStartDock();
			$("#taskTimer").toggleClass("collapse");
			$("#startBarID").removeClass("startBar");
			$("#startBarID").addClass("stopBar");
			self.taskButtonText("Stop Task");
			self.taskMode(2);

			var today = self.viewService.getToday();
			var ts = self.viewService.getTimestamp();
			self.taskStart(ts);
			var totalTicks = self.calculateTimerPeriod();
			self.tickLoop(totalTicks,0);

			// Persist Task
			console.log("Persist Task");
			self.dataService.persistTask(today, self.distractionList, self.taskDescription(), self.getTaskMinutes(), ts, "IN_PROGRESS");

			// update daily stats
			var statsObj = self.dataService.fetchDailyMasterStats(today);
			statsObj.attempts += 1;
			self.dataService.persistDailyMasterStats(today, statsObj);
			console.log("Update Stats Attempts " + statsObj.attempts);

			// update global stats
			var globalStatsObj = self.dataService.fetchGlobalStats();
			globalStatsObj.attempts += 1;

			// mark today off as sweet ass ;)
			var obj = globalStatsObj.historyList[today];
			if(obj !== undefined){
				obj.attempts += 1;
			}else{
				obj = {};
				obj.attempts = 1;
				globalStatsObj.historyList[today] = obj;
			}

			self.dataService.persistGlobalStats(globalStatsObj);
			console.log("Lifetime Attempts " + globalStatsObj.attempts);
		};

		self.validate = function(){
			
			if(self.distractionList.length < 5){
				self.prepMessage("Touch every icon and actioning or defer the item.");
				$("#distractionList").addClass("redBoarder");
				$("#taskDescription").removeClass("redBoarder");
				return false;
			}else{
				$("#distractionList").removeClass("redBoarder");
				self.prepMessage("Setup for Success")
			}

			if(self.taskDescription().length < 5){
				self.prepMessage("Please enter a task description of at least 5 characters.");
				$("#taskDescription").addClass("redBoarder");
				return false;
			}else{
				$("#taskDescription").removeClass("redBoarder");
				self.prepMessage("Setup for Success")
			}

			return true;
		};

		self.tickLoop = function(totalTicks, currentTicks){
			var tick = 1000;
			var result = currentTicks + tick;
			var remainingTicks = totalTicks - currentTicks;
			self.taskTimerValue(self.viewService.printTimerTime(remainingTicks));

			if(remainingTicks <= 0){
				if(self.taskMode() == 2){
					self.naturalStop = true;
					self.toggleStartDock();
				}	
			}else{
				setTimeout(function(){
					self.tickLoop(totalTicks, result);
				},tick);
			}
		};
		
		self.getTaskMinutes = function(){
			return self.selectedLength().replace(" Minutes","");
		};
		
		self.calculateTimerPeriod = function(){
			var minutes = self.getTaskMinutes();
			var ms = minutes * 60000; 
			console.log("Task Period : " + ms);
			return ms;
		};
		
		self.toggleDistractions = function(item){
			var index = self.findDistractionIndex(item);
			$("#distractionList").removeClass("redBoarder");

			if(index == -1){
				$("#"+item).removeClass("unactiveBadge");
				$("#"+item).addClass("activeBadge");
				self.distractionList.push(item);
				self.setPrepMessage(item);
			}else{
				$("#"+item).removeClass("activeBadge");
				$("#"+item).addClass("unactiveBadge");
				self.distractionList.splice(index, 1);
				self.setPrepMessage("foo"); // fake a reset
			}
		};
		
		self.setPrepMessage = function(item){
			
			var msg = "Setup for Success";
			if(item == "body"){
				msg = "Change clothes, use the toilet, get comfortable.";
			}else if(item == "food"){
				msg = "Have a snack, hot or cold drink, prepare your body.";
			}else if(item == "monolog"){
				msg = "Acknowledge, discard or defer other thoughts. Focus.";
			}else if(item == "materials"){
				msg = "Do you have everything to complete this task?";
			}else if(item == "environment"){
				msg = "Noisy, slient or with music, make it ideal for you.";
			}
			
			self.prepMessage(msg);
		};
		
		self.findDistractionIndex = function(item){
			for(var i=0; i < self.distractionList.length; i++){
				if(self.distractionList[i] == item){
					return i;
				}
			}
			return -1;
		};

		self.toggleStartDock = function(){
			if(self.taskMode() == 1){
				$("#startDock").toggleClass("collapse");
			}else if(self.taskMode() == 2){
				self.stopTask();
			}else if(self.taskMode() == 4){
				$("#startBarID").removeClass("feedbackBar");
				$("#startBarID").addClass("startBar");
				
				self.taskButtonText("Start Task");
				self.taskMode(1);
			}
		};

		self.toggleHistoryDock = function(){
			$("#historyDock").toggleClass("collapse");
		};

		self.stopTask = function(){
			$("#startBarID").removeClass("stopBar");
			$("#startBarID").addClass("feedbackBar");
			$("#taskTimer").toggleClass("collapse");
			$("#startDock").toggleClass("collapse");
			
			self.taskButtonText("Reflect");
			self.taskMode(3);
			
			if(self.naturalStop){
				self.setLocalNotifiation("Time is up. Please feedback on your task.");
			}

			// TODO : Display reflection screen
			// Persist results to current entry if present ;)

			self.updateAchievedStats();
		};

		self.updateAchievedStats = function(){

			var today = self.viewService.getToday();

			// update daily stats
			var statsObj = self.dataService.fetchDailyMasterStats(today);
			statsObj.achieved += 1;
			self.dataService.persistDailyMasterStats(today, statsObj);
			console.log("Daily Achieved " + statsObj.achieved);

			// update global stats
			var globalStatsObj = self.dataService.fetchGlobalStats();
			globalStatsObj.achieved += 1;

			// update the daily stats for history
			if(globalStatsObj.historyList === undefined){
				globalStatsObj.historyList = {};
			}

			// mark today off as sweet ass ;)
			var obj = globalStatsObj.historyList[today];
			if(obj !== undefined){
				obj.achieved += 1;
			}else{
				obj = {};
				obj.achieved = 1;
				globalStatsObj.historyList[today] = obj;
			}

			self.dataService.persistGlobalStats(globalStatsObj);
			console.log("Lifetime Achieved " + globalStatsObj.achieved);

			// update view model property
			self.dailyAchieved(statsObj.achieved);
			self.globalAchieved(globalStatsObj.achieved);
			self.globalAttempts(globalStatsObj.attempts);
		};

		self.setLocalNotifiation = function(msg){
			try{
				window.plugin.notification.local.add({ message: msg });
			}catch(e){
				alert("Error : " + e);
			}
		};

		self.openFeedback = function(){
			closeMenu();
			var link = "http://goo.gl/forms/xYZSnachXN";
			webHelper.openUrl(link);
		};

		self.showAbout = function(){
			closeMenu();
			$("#aboutApp").toggleClass("collapse");
		};

		self.closeAbout = function(){
			$("#aboutApp").toggleClass("collapse");
		};

	}