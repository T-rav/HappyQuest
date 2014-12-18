	function ViewModel(viewService){
		var self = this;
		self.viewService = viewService;

		self.taskButtonText = ko.observable("Start Task");
		self.taskMode = ko.observable(1); // 1 -- Start, 2 - Stop

		self.startTask = function(formData){
			self.toggleStartDock();
			$("#taskTimer").toggleClass("collapse");
			$("#startBarID").removeClass("startBar");
			$("#startBarID").addClass("stopBar");
			self.taskButtonText("Stop Task");
			self.taskMode(2);
			setTimeout(function(){
				if(self.taskMode() == 2){
					self.toggleStartDock();
				}
			},1500);
			// TODO : Adjust to proper time
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

		self.toggleAchievedDock = function(){
			$("#achievedDock").toggleClass("collapse");
			$("#achievedDockArrow").toggleClass("collapse");
		};

		self.closeAbout = function(){
			$("#aboutApp").toggleClass("collapse");
		};
	}
		