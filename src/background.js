//Log
const quickLog = function(txt){
    let message  = {
        'type' : 'log',
        'content':txt
        };
    chrome.runtime.sendMessage(message);
    
    if (txt=="Start"){
        chrome.storage.local.set({download_on:'yes'}, function(res){})
    }
    if (txt=="End"){
        chrome.storage.local.set({download_on:'no'}, function(res){})
    }
}

//Importations des modules node.js
var ytdl = require('ytdl-core')
const streamToBlob = require('stream-to-blob')

//HMS Manipulation
/*
function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
}
*/

function getReadableStreamFromYoutubeUrl(myUrl,type){
    //const debutHMS = convertHMS(debut)
    //console.log("Getting ReadableStream from " + myUrl + " starting from " + debut);
    console.log(`Getting ${type} ReadableStream from ${myUrl}`)
    var stream;
    switch (type){
    case 'audio':
        stream = ytdl(myUrl,{quality: 'highestaudio'});
        break;
    case 'video':
        stream = ytdl(myUrl,{ quality: 'highestvideo'});
        break;
    case _ :
        stream = ytdl(myUrl,{filter: 'audioandvideo', quality: 'highestvideo'});
        break;
    }
    return stream;
}

async function convertStreamToBlob(stream){
	const blob = await streamToBlob(stream)
	return blob
}

//trimVideoEnd(message['filename'],message['format'],message['fin'],message['debut'])
/*
async function trimVideoEnd(blob,title,format,end,start){
    const { createFFmpeg, fetchFile } = FFmpeg;
    quickLog("Initializing FFmpeg")
    const ffmpeg = createFFmpeg({
        log: false,
        corePath: await chrome.runtime.getURL('vendor/ffmpeg-core.js')
    });
    await ffmpeg.load();

    quickLog("Writing into the RAM for treatment")
    var buffer = await blob.arrayBuffer()
    let stringFileName = `${title}.${format}`;
    var stringFileNameTrim = `${title}_trimmed.${format}`;
    ffmpeg.FS('writeFile', stringFileName, new Uint8Array(buffer) );

    quickLog("Trimming video")
    await ffmpeg.run('-i', stringFileName, '-to', `${end-start}`, '-c' ,'copy', '-copyts',stringFileNameTrim);
    
    resArray = await ffmpeg.FS('readFile',stringFileNameTrim);
    quickLog("Returning blob")
    return new Promise((resolve)=>{resolve(new Blob([resArray]))})
}*/

async function trimVideoEndAndMerge(VideoBlob,AudioBlob,title,format,end,start){
    const { createFFmpeg, fetchFile } = FFmpeg;
    quickLog("Initializing FFmpeg")
    const ffmpeg = createFFmpeg({
        log: false,
        corePath: await chrome.runtime.getURL('vendor/ffmpeg-core.js')
    });
    await ffmpeg.load();

    quickLog("Writing into the RAM for treatment")
    var vbuffer = await VideoBlob.arrayBuffer()
    var abuffer = await AudioBlob.arrayBuffer()

    //Naming things
    let stringFileName =  `${title}.${format}`;
    let stringVideoName = `${title}_video.${format}`;
    let stringAudioName = `${title}_audio.${format}`;
    let stringFileNameTrim = `${title}_trimmed.${format}`;

    ffmpeg.FS('writeFile', stringVideoName, new Uint8Array(vbuffer) );
    ffmpeg.FS('writeFile', stringAudioName, new Uint8Array(abuffer) );

    quickLog("Merging audio/video and trimming if necessary")
    await ffmpeg.run(
        // Set inputs
        '-i', stringAudioName,
        '-i', stringVideoName,
        '-ss', `${start}`,
        '-to', `${end}`,
        // No re-encoding
        '-c', 'copy',
        //'-copyts',
        // Target file
        stringFileNameTrim
    );
    
    resArray = await ffmpeg.FS('readFile',stringFileNameTrim);
    quickLog("Returning blob")
    return new Promise((resolve)=>{resolve(new Blob([resArray]))})
}

async function getBitrate(url){
    return new Promise((resolve) => {
        let bitrate = 0;

        const info = function(url) {
            return ytdl.getBasicInfo(url,{filter: 'audioandvideo', quality: 'highestvideo'})
            .then(token => { return token } )
        };

        const vidInfo = info(url);
        vidInfo.then(function(result) {
            console.log(result.formats);
            bitrate = result.formats[0].bitrate;
        });
        resolve(bitrate)
    })
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

//Reception message download
chrome.runtime.onMessage.addListener(async function(message) {
	//Check message
	if (message['type']== 'download_request'){
        var sliderStates = JSON.parse(message['sliders_states'])
        quickLog("Start")
    
        // Partie téléchargement vidéo
        if (sliderStates['trash-video-checkbox']==="true"){
            console.log("Download has been requested at url : "+message['url']);
            var blob;
            //Récupération du ReadableStream
            quickLog("Getting video stream from Google API")
            //Video
            var StreamVideo = getReadableStreamFromYoutubeUrl(message['url'],'video');
            //Audio
            var StreamAudio = getReadableStreamFromYoutubeUrl(message['url'],'audio');

            //Get bitrate
            //var bitrate = await getBitrate(message['url']);

            //Convertion en blob
            quickLog("Downloading video stream")
            var BlobVideo = await convertStreamToBlob(StreamVideo);
            quickLog("Downloading audio stream")
            var BlobAudio = await convertStreamToBlob(StreamAudio);

            //Merge video and trim (default to end)
            blob = await trimVideoEndAndMerge(BlobVideo,BlobAudio,message['filename'],message['format'],message['fin'],message['debut'])
            //Create blob url for download purposes
            quickLog("Creating blob url")
            const blobUrl = window.URL.createObjectURL(blob);
            console.log("BlobUrl = "+blobUrl);

            quickLog("Downloading file")
            //Download trick
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `${message.filename}.${message.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            console.log("File " + message.filename + message.format + " has been downloaded");
            quickLog("End")
            quickLog("File downloaded")
        }
    }
});



