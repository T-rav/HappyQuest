function ViewService(){
    var self = this;

	self.getToday = function(){
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
			dd='0'+dd
		} 

		if(mm<10) {
			mm='0'+mm
		} 

		today = mm+'/'+dd+'/'+yyyy;
		
		return today;
	};
	
	self.writeTask = function(distractions, task, duration){
		
		var db = window.sqlitePlugin.openDatabase({name: "happyQuest.db"});

		var a = 1;
		db.transaction(function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text, data_num integer)');
		},
		function(e) {
		  alert("ERROR: " + e.message);
		});
	};
}
