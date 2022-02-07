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
		if (prev_state==="true"){prev_state="false"}else{prev_state="true"};
		var dict = {};
		dict[self.id]=prev_state;
		setSlidersOnStorage(dict);
	})
	
}



/*Création png*/

var getVideoIdFromUrl = function (url) {
    var reg = /(?<==)[^\]]+/g;
    var id = reg.exec(url);
    return id[0];
  }

var trashSource = function (videoUrl) {

	var videoId = getVideoIdFromUrl(videoUrl)
	var apiKey = "AIzaSyA6JBlEEGPNq57EZu7VOMFg1BsGXpoNYes";

	/*Mise en place de l'élément source (récupération des donneés)*/
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + apiKey + "", false);
	xhr.send(null);
	var res = JSON.parse(xhr.responseText);
	var channelId = res.items[0].snippet.channelId;
	var videoTitle = res.items[0].snippet.title;
	var videoThumbnail = res.items[0].snippet.thumbnails.medium.url;

	xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + videoId + "&key=" + apiKey + "", false);
	xhr.send(null);
	res = JSON.parse(xhr.responseText);
	var videoViews = res.items[0].statistics.viewCount;

	xhr.open("GET", "https://www.googleapis.com/youtube/v3/channels?part=snippet&id=" + channelId + "&key=" + apiKey + "", false);
	xhr.send(null);
	res = JSON.parse(xhr.responseText);
	var channelTitle = res.items[0].snippet.title;
	var channelThumbnail = res.items[0].snippet.thumbnails.default.url;

	/*Injection des données*/
	var doc = document.getElementById('img');

	doc.querySelector('#videoTitle').innerHTML = videoTitle;
	doc.querySelector('#videoViews').innerHTML = videoViews.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " vues";
	doc.querySelector('#videoThumbnail').src = videoThumbnail;
	doc.querySelector('#channelTitle').innerHTML = channelTitle;
	doc.querySelector('#channelThumbnail').src = channelThumbnail;

	doc.style.visibility = "visible";
	html2canvas(doc, { allowTaint: true, scale: 1, windowWidth: 1920, windowHeight: 1080, width: 1920, height: 1080, backgroundColor: null }).then(function (canvas) {
	  console.log(canvas)
	  canvas.toBlob(function (blob) {
		var url = URL.createObjectURL(blob, 'image/jpeg', 1)
		/*Telechargement*/
		chrome.downloads.download({
		  url: url,
		  filename: videoTitle.replace(/[^\w\s]/gi, '') + ".png"
		});
		doc.style.visibility = "hidden";
	  })
	});
}


window.onload = function() {
	//Récupération du bouton HTML
	var dButton = document.getElementById('download');

	//Event si bouton cliqué
	dButton.onclick = function(){
		console.log("Button has been clicked")
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	    	var cur_tab = tabs[0]
			var url = cur_tab.url
			var title = cur_tab.title
			
			getSlidersFromStoragePromise().then(function(slidersState){
			slidersState = JSON.stringify(slidersState)
			console.log('Current sliders states are :' + (slidersState))
	    	var message  = {
				'type' : 'download_request',
	    		'url' : url,
	    		'quality': "highest",
	    		'filename': title,
	    		'format': "mp4",
				'sliders_states':slidersState
	    		};
	    	chrome.runtime.sendMessage(message);
			
			/*Partie téléchargement source (dépendant de popup.html)*/
			slidersState = JSON.parse(slidersState);
			if (slidersState['trash-source-checkbox']==="true"){
				trashSource(url);
				}
			});

			
		});
	};

	var sliderList = checkboxs.map(function(idd){return document.getElementById(idd)})
	for (var sliderButton of sliderList){
		sliderButton.onclick = changeState;
	}

	//Récupération de l'état des boutons checkés
	getSlidersFromStoragePromise().then(function(dict){
		if (Object.keys(dict).length < 3) {
			console.log("Data couldn't be retrieved from chrome.storage, default settings...");
			setSlidersOnStorage(getHtmlSlidersStates());
		}else {
			setHtmlSlidersStates(dict);
		}
	})
}