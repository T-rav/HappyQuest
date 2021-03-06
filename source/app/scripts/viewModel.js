	function ViewModel(viewService, dataService){
		var self = this;
		self.viewService = viewService;
		self.dataService = dataService;

		self.taskButtonText = ko.observable("Start Task");
		self.taskStart = ko.observable();
		self.taskDescription = ko.observable("");
		self.taskLength = [ "40 Minutes", "50 Minutes", "60 Minutes", "70 Minutes", "80 Minutes", "90 Minutes"];
		self.selectedLength = ko.observable("50 Minutes");
		self.selectedStatus = ko.observable("");
		self.taskStatus = ["Yes","No"];
		self.prepMessage = ko.observable("Setup for Success");
		self.taskTimerValue = ko.observable("??:??");
		self.didAchieve = ko.observable(false);
		self.dailyAchieved = ko.observable("00");
		self.globalAchieved = ko.observable("00");
		self.globalAttempts = ko.observable("00");
		self.whatWorked = ko.observable("");
		self.didNotWork = ko.observable("");
		self.doDifferently = ko.observable("");

		self.historyList = ko.observableArray();

		self.distractionList = [];
		self.naturalStop = false;
		self.radioInit = false;
		self.terminated = false;
	
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
			
			self.buildHistory(globalStatsObj);
			
		};
		
		self.buildHistory = function(globalStatsObj){
			var history = globalStatsObj.historyList;
			if(history !== undefined){
				
				var keys = Object.keys(history);
				for(var i = 0 ; i < keys.length; i++){
					self.historyList().push({"dateOf":keys[i],"attempts" : history[keys[i]].attempts + " - Attempts ","achieved" : history[keys[i]].achieved + " - Achieved"});
				}
			}
		};
		
		self.updateTodayHistoryEntry = function(globalStatsObj){
			var today = self.viewService.getToday();
			
			var history = globalStatsObj.historyList;
			if(history !== undefined){
				var index = self.historyList().length - 1;
				self.historyList().splice(index, 1);
				// TODO : Pop last entry, rebuild and push
				self.historyList().push({"dateOf":today,"attempts" : history[today].attempts + " - Attempts ","achieved" : history[today].achieved + " - Achieved"});
			}
			self.historyList.valueHasMutated();
		};

		self.startTask = function(){

			if(!self.validate()){
				return;
			}

			self.terminated = false;
			self.didAchieve(false);
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
			if(globalStatsObj.historyList !== undefined){
				var obj = globalStatsObj.historyList[today];
				if(obj !== undefined){
					obj.attempts += 1;
				}else{
					obj = {};
					obj.attempts = 1;
					globalStatsObj.historyList[today] = obj;
				}
			}

			self.dataService.persistGlobalStats(globalStatsObj);
			console.log("Lifetime Attempts " + globalStatsObj.attempts);

			// we need to clear the form data
			self.selectedLength("50 Minutes");
			// reset the distraction icons ;(

			var total = self.distractionList.length;
			for(var i = 0; i < total; i++){
				self.toggleDistractions(self.distractionList[0]);	
			}
			
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
				if(!self.terminated){
					setTimeout(function(){
						self.tickLoop(totalTicks, result);
					},tick);
				}
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
			}else if(item == "monologue"){
				msg = "Acknowledge, discard or defer other thoughts. Focus.";
			}else if(item == "materials"){
				msg = "Do you have everything to complete this task?";
			}else if(item == "environment"){
				msg = "Noisy, silent or with music, make it ideal for you.";
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
				$("#reflectForm").addClass("collapse");
				$("#startForm").removeClass("collapse");

			}else if(self.taskMode() == 2){
				self.stopTask();
			}else if(self.taskMode() == 4){
				$("#startBarID").removeClass("feedbackBar");
				$("#startBarID").addClass("startBar");
				$("#startDock").toggleClass("collapse");
			
				$("#startForm").removeClass("collapse");
				$("#reflectForm").addClass("collapse");
				
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
			
			$("#startForm").addClass("collapse");
			$("#reflectForm").removeClass("collapse");
			
			self.taskButtonText("Reflect");
			self.taskMode(3);
			
			if(self.naturalStop){
				self.setLocalNotifiation("Time is up. Please feedback on your task.");
			}

			self.terminated = true;
		};

		self.updateAchievedStats = function(){

			var today = self.viewService.getToday();

			// update daily stats
			var statsObj = self.dataService.fetchDailyMasterStats(today);
			// update global stats
			var globalStatsObj = self.dataService.fetchGlobalStats();

			// TODO : Update the current entry with reflect data ;)
			var status = "ATTEMPTED";
			if(self.selectedStatus() == "Yes"){
				status = "COMPLETED";	
				self.didAchieve(true);
				statsObj.achieved += 1;
				globalStatsObj.achieved += 1;
			}

			self.dataService.setLastTaskStatus(today, status);
			self.dataService.persistDailyMasterStats(today, statsObj);
			console.log("Daily Achieved " + statsObj.achieved);

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
				if(self.didAchieve()){
					obj.achieved = 1;
				}else{
					obj.achieved = 0;
				}
				obj.attempts = 1;
				globalStatsObj.historyList[today] = obj;
			}

			// Update the history data
			self.updateTodayHistoryEntry(globalStatsObj,self.didAchieve());
			
			self.dataService.persistGlobalStats(globalStatsObj);
			console.log("Lifetime Achieved " + globalStatsObj.achieved);

			// update view model property
			self.dailyAchieved(statsObj.achieved);
			self.globalAchieved(globalStatsObj.achieved);
			self.globalAttempts(globalStatsObj.attempts);

		};

		self.setLocalNotifiation = function(msg){
			try{
				window.plugin.notification.local.add({ message: msg, autoCancel: true });
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
		
		self.showTips = function(){
			closeMenu();
			$("#tipsScreen").toggleClass("collapse");
		};

		self.closeTips = function(){
			$("#tipsScreen").toggleClass("collapse");
		};
		
		self.showExpandedTip = function(id){
			closeMenu();
			$("#tip"+id+"Info").toggleClass("collapse");
		};

		self.closeExapandedTip = function(id){
			$("#tip"+id+"Info").toggleClass("collapse");
		};

		self.closeReflect = function(){

			if(self.selectedStatus() === ""){
				$("#achieveRegion").addClass("redBoarder");
				return;
			}else{
				$("#achieveRegion").removeClass("redBoarder");
			}
			
			if(self.whatWorked().length < 2){
				$("#whatWorked").addClass("redBoarder");
				return;
			}else{
				$("#whatWorked").removeClass("redBoarder");
			}
			
			if(self.didNotWork().length < 2){
				$("#didNotWork").addClass("redBoarder");
				return;
			}else{
				$("#didNotWork").removeClass("redBoarder");
			}
			
			if(self.doDifferently().length < 2){
				$("#doDifferently").addClass("redBoarder");
				return;
			}else{
				$("#doDifferently").removeClass("redBoarder");
			}

			self.updateAchievedStats();
			self.taskMode(4);
			self.toggleStartDock();
			self.taskDescription("");
			self.radioInit = false;
			
			// clear out the feedback form too ;)
			self.whatWorked("");
			self.didNotWork("");
			self.doDifferently("");
			self.selectedStatus("");
			
		};    

    	self.sourceIcon = function(link){

			var value = link.toLowerCase();

			var img = "images/rewards/";

			if(value === "1" && self.globalAchieved() >= 1){
				return img+"star.png";
			}else if(value === "10"  && self.globalAchieved() >= 10){
				return img+"bolt.png";
			}else if(value === "25" && self.globalAchieved() >= 25){
				return img+"bullseye.png";
			}else if(value === "50" && self.globalAchieved() >= 50){
				return img+"silver_medal.png";
			}else if(value === "100" && self.globalAchieved() >= 100){
				return img+"gold_metal.png";
			}else if(value === "500" && self.globalAchieved() >= 250){
				return img+"up_arrow.png";
			}else if(value === "500" && self.globalAchieved() >= 500){
				return img+"trophy.png";
			}else if(value === "1000" && self.globalAchieved() >= 1000){
				return img+"crown.png";
			}

			return img+"locked.png";

		};    

		self.sourceMsg = function(link){

			var value = link.toLowerCase();
			// cryptocoinsnews
			// CoinDesk
			// BitcoinMagazine
			// Generic

			var img = "images/rewards/";

			if(value === "1" && self.globalAchieved() >= 1){
				return "Success";
			}else if(value === "10"  && self.globalAchieved() >= 10){
				return "Triumph";
			}else if(value === "25" && self.globalAchieved() >= 25){
				return "Victory";
			}else if(value === "50" && self.globalAchieved() >= 50){
				return "Fulfillment";
			}else if(value === "100" && self.globalAchieved() >= 100){
				return "Proficiency";
			}

			return "???";
		};    


	}
