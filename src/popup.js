//Global variables
var checkboxs = ['trash-source-checkbox','trash-video-checkbox','focus-mode-checkbox'];

//Logs 
var quickLog = function(txt){
    try {
        var log = document.getElementById('log-text');
        log.innerHTML = txt;
		console.log(txt)
    } catch (e) {
        console.log(`Element log-text not found while trying to set log-text innerHTML to ${txt}`)
    }
}

//Manipulate date
function prettyDate2(date) {
	return date.toLocaleTimeString(navigator.language, {
	  hour: '2-digit',
	  minute:'2-digit'
	}).replace(':','h');
  }

//ContentScript & Reloading
var reloadPage = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
		var code = 'window.location.reload();';
		chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});
	});
}

var isContentScriptHere = function(){
	chrome.tabs.query({ currentWindow: true, active: true }, async function (tabs) {
		const cTab = tabs[0];
		if (cTab.url.toString().includes("youtube.com/watch")){
			chrome.tabs.sendMessage(cTab.id, {text: "are_you_there_content_script?"}, function(msg) {
				if (window.chrome.runtime.lastError) {
					reloadPage();
				}
			});
		}
	});
}

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

function getOptionsFromStoragePromise(){
	return new Promise(function(resolve,reject){
		chrome.storage.local.get({
			highresmode: false,
			datefilename: true
		  }, (items)=>{resolve(items)})})
};

//Changing slider state
function changeState(self){
	getSlidersFromStoragePromise().then(function(res){
		self = self.srcElement ;
		id = self.id;
		var prev_state = res[id]
		if (prev_state==="true"){prev_state="false"}else{prev_state="true"};
		var dict = {};
		dict[self.id]=prev_state;
		setSlidersOnStorage(dict);
		if (self.id == 'focus-mode-checkbox'){
			reloadPage();
		}
	})
}

function isDownloading(self){
	return new Promise(function(resolve,reject){
		chrome.storage.local.get('download_on',function (result){
			resolve(result.download_on=='yes')
			})
		})
}

/*STORAGE END*/

/*TRASH SOURCE*/
var getVideoIdFromUrl = function (url) {
    var reg = /(?<==)[^\]]+/g;
    var id = reg.exec(url);
    return id[0];
  }

var trashSource = function (videoUrl) {

	var videoId = getVideoIdFromUrl(videoUrl)
	var apiKey = "AIzaSyA6JBlEEGPNq57EZu7VOMFg1BsGXpoNYes";

	/*Mise en place de l'??l??ment source (r??cup??ration des donne??s)*/
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

	/*Injection des donn??es*/
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
/*TRASH SOURCE END*/

// Main downloading func
var onClickMain = async function(){
	quickLog("Button has been clicked")
	chrome.tabs.query({ currentWindow: true, active: true }, async function (tabs) {
		var cur_tab = tabs[0]
		var url = cur_tab.url
		var title = cur_tab.title
	
		//Getting time
		chrome.tabs.sendMessage(cur_tab.id,{type: "get_time"}, function(response) {

			if (chrome.runtime.lastError){
				var errorMsg = chrome.runtime.lastError.message;
				quickLog("Cannot read timestamps, please refresh page")
			}
			else {
				var debut = response['debut'];
				var fin = response['fin'];
				var total = response['duree'];
				quickLog(`Start ${debut} End ${fin} Total ${total}`)
				
				//Getting options
				getOptionsFromStoragePromise().then(function(optionsState){
					var highresmode = optionsState.highresmode;
					var datefilename = optionsState.datefilename;

					if (datefilename){
						let date = new Date()
						title = prettyDate2(date) + " - " + title;
					}

					//Getting sliders states and options
					getSlidersFromStoragePromise().then(function(slidersState){
						slidersState = JSON.stringify(slidersState)
						console.log('Current sliders states are :' + (slidersState))
						
						//Envoi du message final
						var message  = {
							'type' : 'download_request',
							'url' : url,
							'highquality': highresmode,
							'filename': title,
							'format': "mkv",
							'debut':debut,
							'fin':fin,
							'total':total,
							'sliders_states':slidersState
						};
						chrome.runtime.sendMessage(message);
						quickLog("Sending download")
						console.log("Download request sent to background.js : " + JSON.stringify(message))
						
						/*Partie t??l??chargement source (d??pendant de popup.html d'o?? pr??sence du code ici)*/
						slidersState = JSON.parse(slidersState);
						if (slidersState['trash-source-checkbox']==="true"){
							quickLog("Downloading trash source png")
							trashSource(url);
						}
					});
				});
			}
		});
	})
}

window.addEventListener("load",async function(event) {
	
	//Actualise if contentScript not loaded
	isContentScriptHere();

	//Check if background is running a download
	isDownloading().then((res)=>{
		if (res){
			quickLog("A download is still running")
		}
	})

	//Link to Option
	document.getElementById('go-to-options').addEventListener('click', function() {
		if (chrome.runtime.openOptionsPage) {
		  chrome.runtime.openOptionsPage();
		} else {
		  window.open(chrome.runtime.getURL('options.html'));
		}
	  });

	//R??cup??ration du bouton HTML
	var dButton = document.getElementById('download');
	dButton.onclick = onClickMain;

	//R??glage des liens boutons sliders avec chrome.storage
	var sliderList = checkboxs.map(function(idd){return document.getElementById(idd)})
	for (var sliderButton of sliderList){
		sliderButton.onclick = changeState;
	}

	//R??cup??ration de l'??tat des boutons check??s
	getSlidersFromStoragePromise().then(function(dict){
		if (Object.keys(dict).length < 3) {
			console.log("Data couldn't be retrieved from chrome.storage, default settings...");
			setSlidersOnStorage(getHtmlSlidersStates());
		} else {
			setHtmlSlidersStates(dict);
		}
	})
})