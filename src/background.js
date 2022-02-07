//Importations des modules node.js
var ytdl = require('ytdl-core') 
const streamToBlob = require('stream-to-blob')

function getReadableStreamFromYoutubeUrl(myUrl){
    console.log("Getting ReadableStream from " + myUrl);
    var stream = ytdl(myUrl,{filter: 'audioandvideo', quality: 'highestvideo'});
    return stream;
}

async function convertStreamToBlob(stream){
	const blob = await streamToBlob(stream)
	return blob
}

async function downloadVideo(message){
    
}

//Initialisation du background
chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { hostContains: 'youtube'}
				}) 
			],
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}]);
	});

});

chrome.runtime.onMessage.addListener(async function(message) {
	//Check message
	if (message['type']== 'download_request'){
        var sliderStates = JSON.parse(message['sliders_states'])
    
        // Partie téléchargement vidéo
        if (sliderStates['trash-video-checkbox']==="true"){
            console.log("Download has been requested at url : "+message['url'])
            //Récupération du ReadableStream
            var res = getReadableStreamFromYoutubeUrl(message['url'])

            //Convertion en blob url
            const blob = await convertStreamToBlob(res)
            const newBlob = new Blob([blob]);
            const blobUrl = window.URL.createObjectURL(newBlob);
            console.log("BlobUrl = "+blobUrl)

            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `${message.filename}.${message.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            console.log("File " + message.filename + message.format + " has been downloaded")
            alert('Vidéo en cours de téléchargement')
        }

    }
});

