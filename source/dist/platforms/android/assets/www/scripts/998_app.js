'use strict';
(function() {

    var app = {
        init: function() {
		
            this.fixBottomMenuItemsForSmallerScreens();
            var dataService = new DataService();
            var viewService = new ViewService();
            var viewModel = new ViewModel(viewService, dataService);

            this.bindApp(viewModel);
			this.initGCM();
			
			//this.scheduleDailyReminder();
        },
		scheduleDailyReminder:function(){
			var tomorrowAt9am = new Date();
			tomorrowAt9am.setMinutes(0);
			tomorrowAt9am.setHours(9);

			window.plugin.notification.local.add({
				id: 1,
				title:   'HappyQuest',
				message: 'Achieve flow and be happier today',
				repeat:  'daily',
				date:    tomorrowAt9am,
				autoCancel: true
			});
		},
        bindApp:function(viewModel){
            
            viewModel.init();

            ko.applyBindings(viewModel, document.getElementById("main"));
            ko.applyBindings(viewModel, document.getElementById("aboutApp"));
			ko.applyBindings(viewModel, document.getElementById("tipsScreen"));

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
        },
		initGCM:function()
		{
			var GOOGLE_PROJECT_ID = "914619978947";
			var PUSHAPPS_APP_TOKEN = "c258fa45-4394-4dfe-a82e-b3ce51d20198";
		
			PushNotification.registerDevice(GOOGLE_PROJECT_ID, PUSHAPPS_APP_TOKEN, function (pushToken) {
												console.log('registerDevice, push token' + pushToken);
											}, function (error) {
												alert(error);
											});
		
			document.removeEventListener('pushapps.message-received');
			document.addEventListener('pushapps.message-received', function(event) {
										  var notification = event.notification;
										  
										  var devicePlatform = device.platform;
										  if (devicePlatform === "iOS") {
											console.log("message-received, Message: " + notification.aps.alert + " , D: " + notification.D);
										  } else {
											console.log("message-received, Message: " + notification.Message + " , Title: " + notification.Title + " , D: " + notification.D);
										  }
									  });
		
		}
    };

    document.addEventListener('deviceready', function() {
       app.init();
    }, false);
})();
