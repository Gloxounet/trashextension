var checkboxs = ['trash-source-checkbox','trash-video-checkbox','focus-mode-checkbox'];

/*DOM*/
function getHtmlSlidersStates(){
	var dict = {};
	for (const element of checkboxs) {
		dict[element] = (document.getElementById(element).checked).toString();
	}
	return dict;
}

function setHtmlSlidersStates(settings){
	var tags = Object.keys(settings);
	var values = Object.values(settings);
	var n = tags.length;
	for (var i=0;i<n;i++){
		setHtmlSliderToState(tags[i],values[i])
	}
}

function setHtmlSliderToState(slider,state){
	try {
		sliderhtml = document.getElementById(slider);
		var bool_state;
		if (state==="true"){bool_state = true} else{bool_state = false};
		
		sliderhtml.checked = bool_state;
	} catch(e){console.log(e)}

}
/*STORAGE*/
function getSlidersFromStoragePromise(){
	return new Promise(function(resolve,reject){
	chrome.storage.local.get(checkboxs,function (result){
		resolve(result)
		})
	})
};

function setSlidersOnStorage(slidersDict){
	chrome.storage.local.set(slidersDict, function(res){})
};

/*On click change storage listener*/
function changeState(self){
	getSlidersFromStoragePromise().then(function(res){
		self = self.srcElement ;
		id = self.id;
		var prev_state = res[id]
		console.log(self.id,prev_state,res)
		if (prev_state==="true"){prev_state="false"}else{prev_state="true"};
		var dict = {};
		dict[self.id]=prev_state;
		setSlidersOnStorage(dict);
	})
	
}

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
			
			getSlidersFromStoragePromise().then(function(slidersState){
	    	var message  = {
				'type' : 'download_request',
	    		'url' : url,
	    		'quality': "highest",
	    		'filename': title,
	    		'format': "mp4",
				'sliders_states':JSON.stringify(slidersState)
	    		};
	    	chrome.runtime.sendMessage(message);
			})
		})
	};

	var sliderList = checkboxs.map(function(idd){return document.getElementById(idd)})
	for (var sliderButton of sliderList){
		sliderButton.onclick = changeState;
	}

	//Récupération de l'état des boutons checkés
	getSlidersFromStoragePromise().then(function(dict){
		if (dict.length == 0) {
			console.log("Data couldn't be retrieved from chrome.storage, default settings...");
			setSlidersOnStorage(getHtmlSlidersStates());
		}else {
			setHtmlSlidersStates(dict);
		}
	})
}