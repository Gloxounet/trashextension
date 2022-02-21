//Log
const quickLog = function(txt){
    let message  = {
        'type' : 'log',
        'content':txt
        };
    chrome.runtime.sendMessage(message);
}

//Importations des modules node.js
var ytdl = require('ytdl-core')
const streamToBlob = require('stream-to-blob')


function getReadableStreamFromYoutubeUrl(myUrl,debut){
    console.log("Getting ReadableStream from " + myUrl + " starting from " + debut);
    var stream = ytdl(myUrl,{filter: 'audioandvideo', quality: 'highestvideo', begin:debut});
    return stream;
}

async function convertStreamToBlob(stream){
	const blob = await streamToBlob(stream)
	return blob
}

//trimVideoEnd(message['filename'],message['format'],message['fin'],message['debut'])
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
    await ffmpeg.run('-i', stringFileName, '-to', `${end}`, '-c' ,'copy', '-copyts',stringFileNameTrim);
    
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
    
        // Partie téléchargement vidéo
        if (sliderStates['trash-video-checkbox']==="true"){
            console.log("Download has been requested at url : "+message['url']);

            //Récupération du ReadableStream
            quickLog("Getting video stream from Google API")
            var res = getReadableStreamFromYoutubeUrl(message['url'],message['debut']);

            //Get bitrate
            //var bitrate = await getBitrate(message['url']);

            //Convertion en blob
            quickLog("Converting stream to blob")
            var blob = await convertStreamToBlob(res)

            //Trim videoblob if needed
            if (message['fin']!=message['total']){
                console.log("Trimming video...")
                blob = await trimVideoEnd(blob,message['filename'],message['format'],message['fin'],message['debut'])
            }

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
            quickLog("File downloaded")
        }
    }
});



