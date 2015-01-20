'use strict';
(function() {
    
    // example usage:
    // webHelper.openUrl("http://www.google.com")

	var currentStatus = 0;
	
    var app = {
        init: function() {
		
            this.fixBottomMenuItemsForSmallerScreens();
            var dataService = new DataService();
            var viewService = new ViewService();
            var viewModel = new ViewModel(viewService, dataService);

            this.bindApp(viewModel);
			
			this.scheduleDailyReminder();
        },
		scheduleDailyReminder:function(){
			var now = new Date().getTime();
			var _5_seconds_from_now = new Date(now + 5*1000);

			window.plugin.notification.local.add({
				title:   'HappyQuest',
				message: 'Achieve flow and be happier today',
				repeat:  'daily',
				date:    _5_seconds_from_now,
				autoCancel: true
			});
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
