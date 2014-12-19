function ViewService(){
    var self = this;

	self.getToday = function(){
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
			dd='0'+dd;
		} 

		if(mm<10) {
			mm='0'+mm;
		} 

		today = mm+'/'+dd+'/'+yyyy;
		
		return today;
	};

	self.getTimestamp = function(){
		var today = new Date();
		var hr = today.getHours();
		var min = today.getMinutes();

		if(hr<10) {
			hr='0'+hr;
		} 

		if(min<10) {
			min='0'+min;
		} 

		today = self.getToday() + " "+hr+":"+min+":00";
		
		return today;
	};

	self.printTimerTime = function(remainingTicks){

		// min, sec
		var mins = Math.floor(remainingTicks / 60000);
		var secs =  (remainingTicks - (mins * 60000));
		secs = secs.toString().substring(0,2);

		if(mins<10) {
			mins='0'+mins;
		} 

		if(secs<10) {
			secs='0'+secs;
		} 


		return mins+":"+secs;;

	};
}
