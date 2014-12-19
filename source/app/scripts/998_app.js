'use strict';
(function() {
    
    // example usage:
    // webHelper.openUrl("http://www.google.com")

	var currentStatus = 0;
	
    var app = {
        init: function() {

			var waitTime = 600000;
            //var waitTime = 10000;
		
            this.fixBottomMenuItemsForSmallerScreens();
            var dataService = new DataService();
            var viewService = new ViewService();
            var viewModel = new ViewModel(viewService, dataService);

            this.bindApp(viewModel);
			
			this.activateMonitor(viewModel, waitTime);
        },
		activateMonitor: function(viewModel, waitTime){
			// refresh status
			setInterval(function(){viewModel.polledRefresh();}, waitTime);
		},
        fetchStatus:function(viewService, viewModel){
            viewService.fetchData(viewModel, false);
        },
        bindApp:function(viewModel){
            
            viewModel.init();

            // -- main
            ko.applyBindings(viewModel, document.getElementById("main"));
            ko.applyBindings(viewModel, document.getElementById("aboutApp"));

        },
        fixBottomMenuItemsForSmallerScreens: function() {
            // if you have a ul.bottom, this helps to place it on smaller screens
            var bottomList = $("ul.bottom");
            if (bottomList.length === 0) {
                return;
            }
            var bottomListTop = bottomList.position().top;
            var lastItem = $("ul.top li:last-child()");
            var lastItemBottom = lastItem.position().top + lastItem.height();
            if (bottomListTop <= lastItemBottom) {
                bottomList.css("position", "relative");
            }
        }
		/*
		registerPushNotificationHandler: function(){
			try{
				var pushNotification window.plugins.pushNotification; 
				pushNotification.register(
					function(result){
						window.plugin.notification.local.add({ message: 'Great app! '+result});
					},
					function(error){
						alert('error='+error);
					},
					{
						"senderID":"wise-program-789",
						"ecb":"onNotification"
					}
				);
			}catch(e){
				alert(e);
			}
		}*/
    };

    document.addEventListener('deviceready', function() {
       app.init();
    }, false);
})();
