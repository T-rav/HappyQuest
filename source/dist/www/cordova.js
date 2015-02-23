(function() {
        try {
            function hasScriptTagForCordova() {
                return $("body").find("script[src='cordova.js']").length > 0;
            }
            function addCordovaJs() {
                $("body").append("<scri" + "pt type='text/javascript' src='cordova.js'></scr" + "ipt>");
            }
            function doMagick() {
                if (window.$ === undefined) {
                    return false;
                }
                if (!hasScriptTagForCordova()) {
                    addCordovaJs();
                } else {
                    if (window.cordova === undefined) {
                        window.cordova = buildCordovaShim();
                        window.setTimeout(function checkDocumentReady() {
                            if (document.readyState === "complete") {
                                document.dispatchEvent(new CustomEvent("deviceready", {
                                            detail: {
                                            },
                                            bubbles: true,
                                            cancelable: true
                                }));
                            } else {
                                window.setTimeout(checkDocumentReady, 50);
                            }
                        }, 50);
                    }
                }
                return true;
            }
            function tryDoMagick() {
                if (!doMagick()) {
                    window.setTimeout(function() {
                        tryDoMagick();
                    }, 50);
                }
            }
            tryDoMagick();
		} catch (e) { 
		}
})();

// The subbing of exec is critical as this allows the browser to continue doing its thing ;)
function buildCordovaShim(){
	return {
		exec: function(onSuccess, onError, service, action, args){
			//alert("Service " + service);
			//setTimeout(function(){ }, 100);
		}
	};
}
