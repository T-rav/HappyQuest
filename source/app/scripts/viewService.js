function ViewService(){
    var self = this;

    self.fetchData = function(viewModel, canDisplayMessage){
        $.ajax({
            url : "http://stoneagetechnologies.com/eskomloadshed/status/?jsoncallback=?",
            dataType : "jsonp",
            crossDomain : true,
            async: false,
            timeout: 1500, // in milliseconds
            success : function(data){
                viewModel.setMessageFromStatus(data);
				
				// if i can and it changed, display it ;)
				if(canDisplayMessage && viewModel.didStatusChange()){
					window.plugin.notification.local.add({ message: viewModel.message() });
				}
				
                //viewModel.setMessageFromStatus({"level":3});
                //viewModel.setError();
            },
            error : function(){
                viewModel.setError();
            }
        }); 
    };
}
