var setInnerTxt = function(txt){
    try {
        var log = document.getElementById('log-text');
        log.innerHTML = txt;
    } catch (e) {
        console.log(`Element log-text not found while trying to set log-text innerHTML to ${txt}`)
    }
}

window.addEventListener("load", function(event) {
	//Récupération de la zone textuelle
	var log = document.getElementById('log-text');


    //Add 'log' listener
    chrome.runtime.onMessage.addListener(async function(message) {
        if (message['type'] == 'log'){
            setInnerTxt(message['content'])
        }
    });

})