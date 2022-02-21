'use strict';

function injection_curseurs(){
    const leftGeom = "m31.19102,30.26599c-0.00001,0.34397 -0.0391,0.58632 -0.11726,0.72705c-0.07818,0.14071 -0.19024,0.21107 -0.33615,0.21108l-4.00257,0c-0.12509,0 -0.24495,-0.01825 -0.35961,-0.05472c-0.11466,-0.03649 -0.21889,-0.09642 -0.3127,-0.17981c-0.09381,-0.08339 -0.16938,-0.19545 -0.22671,-0.33616c-0.05733,-0.14072 -0.08599,-0.31532 -0.08599,-0.52378l0,-24.68825c0,-0.19803 0.02866,-0.36741 0.08599,-0.50815c0.05733,-0.1407 0.1329,-0.25535 0.22671,-0.34398c0.0938,-0.08858 0.19804,-0.15112 0.3127,-0.18762c0.11465,-0.03646 0.23452,-0.0547 0.35961,-0.05472l4.00257,0c0.06253,0.00002 0.12247,0.01566 0.1798,0.04691c0.05732,0.03129 0.10683,0.08862 0.14853,0.17199c0.04169,0.08341 0.07296,0.18504 0.09381,0.30489c0.02084,0.11989 0.03126,0.26843 0.03127,0.44561c-0.00001,0.33357 -0.0391,0.57332 -0.11726,0.71923c-0.07818,0.14595 -0.19024,0.21891 -0.33615,0.2189l-2.54851,0l0,23.0778l2.54851,0c0.06253,0 0.12247,0.01563 0.1798,0.04691c0.05732,0.03127 0.10683,0.08599 0.14853,0.16417c0.04169,0.07817 0.07296,0.1772 0.09381,0.29707c0.02084,0.11987 0.03126,0.2684 0.03127,0.44561z"
    const middleGeom = "m28.36087,13.56966l-5.87348,0l0,-8.81022l-8.81022,0l0,8.81022l-5.87348,0l10.27859,10.27859l10.27859,-10.27859zm-20.55719,13.21533l0,2.93674l20.55719,0l0,-2.93674l-20.55719,0z";
    const rightGeom = "m4.1908,30.51599c0.00001,0.34397 0.03366,0.58632 0.10095,0.72705c0.06731,0.14071 0.16377,0.21107 0.28939,0.21108l3.44577,0c0.10769,0 0.21088,-0.01825 0.30958,-0.05472c0.09871,-0.03649 0.18844,-0.09642 0.2692,-0.17981c0.08076,-0.08339 0.14582,-0.19545 0.19517,-0.33616c0.04935,-0.14072 0.07403,-0.31532 0.07403,-0.52378l0,-24.68825c0,-0.19803 -0.02467,-0.36741 -0.07403,-0.50815c-0.04935,-0.1407 -0.11441,-0.25535 -0.19517,-0.34398c-0.08076,-0.08858 -0.17049,-0.15112 -0.2692,-0.18762c-0.0987,-0.03646 -0.2019,-0.0547 -0.30958,-0.05472l-3.44577,0c-0.05383,0.00002 -0.10543,0.01566 -0.15479,0.04691c-0.04935,0.03129 -0.09197,0.08862 -0.12787,0.17199c-0.03589,0.08341 -0.06281,0.18504 -0.08076,0.30489c-0.01794,0.11989 -0.02691,0.26843 -0.02692,0.44561c0.00001,0.33357 0.03366,0.57332 0.10095,0.71923c0.06731,0.14595 0.16377,0.21891 0.28939,0.2189l2.19399,0l0,23.0778l-2.19399,0c-0.05383,0 -0.10543,0.01563 -0.15479,0.04691c-0.04935,0.03127 -0.09197,0.08599 -0.12787,0.16417c-0.03589,0.07817 -0.06281,0.1772 -0.08076,0.29707c-0.01794,0.11987 -0.02691,0.2684 -0.02692,0.44561z";
    const viewBox=['0 0 36 36','0 0 36 36','0 0 36 36'];
    
    var target = document.getElementsByClassName("ytp-right-controls")[0];
    var progressBar = document.getElementsByClassName('ytp-progress-bar')[0];
    var currentTime = document.getElementsByClassName('ytp-time-current')[0];
    var scrubber = document.getElementsByClassName('ytp-scrubber-container')[0];
    var debut = progressBar.getAttribute('aria-valuemin');
    var fin = progressBar.getAttribute('aria-valuemax');
    var duree = progressBar.getAttribute('aria-valuemax');
    var widthTarget = document.getElementsByClassName("ytp-chrome-bottom")[0]
    var totalPxWidth = parseInt(widthTarget.style.width);

    var leftScrubber  = scrubber.cloneNode(true);
    leftScrubber.setAttribute('id','trashDebut');
    leftScrubber.setAttribute('aria-label','Set beginning');
    leftScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:black");

    var rightScrubber = scrubber.cloneNode(true);
    rightScrubber.setAttribute('id','trashFin');
    rightScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:black");
    leftScrubber.setAttribute('aria-label','Set end');

    var loadBar = document.getElementsByClassName('ytp-play-progress ytp-swatch-background-color')[0];
    var selection = loadBar.cloneNode(true);
    selection.setAttribute('id','trashSelection');

    function setProgressBar(){
        totalPxWidth = parseInt(widthTarget.style.width);
        const longueurRatio = (fin-debut)/duree;
        const translation = Math.floor(totalPxWidth * debut / duree);
        selection.setAttribute('style','transform : translateX('+translation+'px) scaleX(' + longueurRatio +'); height:10px; background:blue; opacity:0.5' );
    }

    function gauche(){
        debut=progressBar.getAttribute('aria-valuenow');
        leftScrubber.setAttribute('style',scrubber.getAttribute('style'));
        setProgressBar();

        if (document.getElementById('trashDebut') == null){
            leftScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:white");
            progressBar.appendChild(leftScrubber);
            loadBar.parentNode.appendChild(selection);
        }
    }

    function droite(){
        fin=progressBar.getAttribute('aria-valuenow');
        rightScrubber.setAttribute('style',scrubber.getAttribute('style'));
        setProgressBar();

        if (document.getElementById('trashFin') == null){
            rightScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:white");
            progressBar.appendChild(rightScrubber);
            loadBar.parentNode.appendChild(selection);
        }
    }

    function milieu(){
        //TODO
    }

    const fonctions=[gauche,milieu,droite];

    function InsertButton(geom,index){
        var btn = document.createElement("button");
        btn.setAttribute('class',target.lastChild.className);
        btn.setAttribute('aria-label','download');
        //icone
        var svgURI = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS( svgURI, 'svg' );
        svg.setAttribute( 'viewBox', viewBox[index] );
        svg.setAttribute( 'width', '100%');
        svg.setAttribute( 'height','100%');
        //tracé
        var path = document.createElementNS( svgURI, 'path' );
        path.setAttribute('class','ytp-svg-fill');
        path.setAttribute( 'd', geom );
        path.setAttribute('fill','#fff');
        svg.appendChild( path );
        btn.appendChild(svg);
        //onClick
        btn.addEventListener("click", fonctions[index]);
        target.insertBefore(btn,target.firstChild);
    }

    //for (var i=0; i <= 4; i++) target.firstElementChild.remove();

    InsertButton(rightGeom,2);
    InsertButton(middleGeom,1);
    InsertButton(leftGeom,0);

    //Messaging on sliders states
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            
            if (request.type === "get_time")
                sendResponse({'debut': debut, 'fin':fin, 'duree':duree});
            }
      );
}


//Comments & Recommandations remover on youtube.com/watch
var justDoIt = function (){
    let noti_element = document.querySelector(".notification-button-style-type-default");
    (noti_element) ? noti_element.remove() : null;

    /*
    if (window.location.href.indexOf("watch?v=") < 0) {
        let recommended_element = document.querySelector("#dismissable")
        let side_menu = document.querySelector("#guide-content");
        document.querySelector("#primary").style.display = "none";

        if(recommended_element){
            recommended_element.style.display = "none";
        }
        if(side_menu){
            side_menu.style.display = "none";
        }
    } else {*/
        let related_element = document.querySelector("#related")
        let comments_element = document.querySelector("#comments")
        if(related_element){
            related_element.parentElement.parentElement.style.display= "none";
        }
        if(comments_element){
            comments_element.style.display = "none";
        }
    }
//}

function IsFocusModeOnPromise(){
    return new Promise(function(resolve,reject){
        chrome.storage.local.get('focus-mode-checkbox',function (result){
            resolve(result)
        })
    })
};
	

//This content script will automatically be injected into pages as youtube.com
if (location.toString().includes("youtube.com/watch")){
    //INSERTIONS DES BOUTONS TEMPS
    injection_curseurs();

    IsFocusModeOnPromise().then(function(focusState){
        //DELETIONS DES RECOMMANDATIONS & COMMENTAIRES
        if (focusState['focus-mode-checkbox']==="true" && (document.querySelector("#polymer-app") || document.querySelector("#masthead") || window.Polymer)) {
            justDoIt()
            setInterval(function () {
                justDoIt()
            }, 400);
        }
    })
}