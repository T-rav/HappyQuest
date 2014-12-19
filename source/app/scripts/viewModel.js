	function ViewModel(viewService){
		var self = this;
		self.viewService = viewService;

		self.taskButtonText = ko.observable("Start Task");
		self.taskDescription = ko.observable("");
		self.taskLength = [ '40 Minutes', '50 Minutes', '60 Minutes', '70 Minutes','80 Minutes','90 Minutes'];
		self.selectedLength = ko.observable('50 Minutes');
		self.prepMessage = ko.observable("Setup for Success");
		self.distractionList = [];
		
		self.taskMode = ko.observable(1); // 1 -- Start, 2 - Stop

		self.startTask = function(){
			self.toggleStartDock();
			$("#taskTimer").toggleClass("collapse");
			$("#startBarID").removeClass("startBar");
			$("#startBarID").addClass("stopBar");
			self.taskButtonText("Stop Task");
			self.taskMode(2);
			self.setCallback();
			
			viewService.writeTask(self.distractionList, self.taskDescription(), self.getTaskMinutes());
		};
		
		self.setCallback = function(){
			var callbackPeriod = self.calculateTimerPeriod();
			setTimeout(function(){
				if(self.taskMode() == 2){
					self.toggleStartDock();
				}
			},callbackPeriod);
		};
		
		self.getTaskMinutes = function(){
			self.selectedLength().replace(" Minutes","");
		};
		
		self.calculateTimerPeriod = function(){
			var minutes = self.getTaskMinutes();
			var ms = minutes * 60000;
			console.log("Task Period : " + ms);
			return ms;
		};
		
		self.toggleDistractions = function(item){
			var index = self.findDistractionIndex(item);
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
				$("#startBarID").removeClass("stopBar");
				$("#startBarID").addClass("feedbackBar");
				$("#taskTimer").toggleClass("collapse");
				$("#startDock").toggleClass("collapse");
				
				self.taskButtonText("Reflect");
				self.taskMode(3);
			}else if(self.taskMode() == 4){
				$("#startBarID").removeClass("feedbackBar");
				$("#startBarID").addClass("startBar");
				
				self.taskButtonText("Start Task");
				self.taskMode(1);
			}
		};
	}