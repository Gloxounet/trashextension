window.onload = function() {
	//Récupération du bouton HTML
	var dButton = document.getElementById('download');

	//Event si bouton cliqué
	dButton.onclick = function(){
		console.log("Button has been clicked")
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	    	var cur_tab = tabs[0]
			var url = cur_tab.url
			var title = cur_tab.title
			
	    	var message  = {
	    		'url' : url,
	    		'quality': "highest",
	    		'filename': title,
	    		'format': "mp4"
	    	};
	    	chrome.runtime.sendMessage(message);
		});
	};
}