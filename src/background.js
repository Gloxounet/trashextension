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

function trimStream(){
    const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');

    const ffmpeg = createFFmpeg({ log: true });

    (async () => {
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'flame.avi', await fetchFile('../assets/flame.avi'));
    await ffmpeg.run('-i', 'flame.avi', '-ss', '0', '-to', '1', 'flame_trim.avi');
    //await fs.promises.writeFile('flame_trim.avi', ffmpeg.FS('readFile', 'flame_trim.avi'));
    process.exit(0);
    })();
}

function getEndTimeInSecond(end,total){return 700} //TODO

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
            var res = getReadableStreamFromYoutubeUrl(message['url'],message['debut'])

            //Convertion en blob url
            const blob = await convertStreamToBlob(res)
            const newBlob = new Blob([blob],{type:'video/mp4'});

            //Calcul du byte max
            //var end = getEndTimeInSecond(message['fin'],message['total']);
            //var blob_size = newBlob.size;
            //let max_byte = Math.floor((end/message['total'])*blob_size);
            
            //slicedBlob = newBlob.slice(0,max_byte);

            //console.log(`Start time : ${message['debut']} ; End time : ${message['fin']} ; Total time ${message['total']} ; Blob size ${blob_size} ; max_byte ${max_byte} ; newBlobSize ${slicedBlob.size}`)

            const blobUrl = window.URL.createObjectURL(newBlob);
            //const blobUrl = window.URL.createObjectURL(slicedBlob);
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


