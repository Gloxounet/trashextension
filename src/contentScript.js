'use strict';

function injection_curseurs(){
    const leftGeom = "M11.739,13.962c-0.087,0.086-0.199,0.131-0.312,0.131c-0.112,0-0.226-0.045-0.312-0.131l-3.738-3.736c-0.173-0.173-0.173-0.454,0-0.626l3.559-3.562c0.173-0.175,0.454-0.173,0.626,0c0.173,0.172,0.173,0.451,0,0.624l-3.248,3.25l3.425,3.426C11.911,13.511,11.911,13.789,11.739,13.962 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.148,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.148,17.521,10";
    const middleGeom = "M10.219,1.688c-4.471,0-8.094,3.623-8.094,8.094s3.623,8.094,8.094,8.094s8.094-3.623,8.094-8.094S14.689,1.688,10.219,1.688 M10.219,17.022c-3.994,0-7.242-3.247-7.242-7.241c0-3.994,3.248-7.242,7.242-7.242c3.994,0,7.241,3.248,7.241,7.242C17.46,13.775,14.213,17.022,10.219,17.022 M15.099,7.03c-0.167-0.167-0.438-0.167-0.604,0.002L9.062,12.48l-2.269-2.277c-0.166-0.167-0.437-0.167-0.603,0c-0.166,0.166-0.168,0.437-0.002,0.603l2.573,2.578c0.079,0.08,0.188,0.125,0.3,0.125s0.222-0.045,0.303-0.125l5.736-5.751C15.268,7.466,15.265,7.196,15.099,7.03";
    const rightGeom = "M12.522,10.4l-3.559,3.562c-0.172,0.173-0.451,0.176-0.625,0c-0.173-0.173-0.173-0.451,0-0.624l3.248-3.25L8.161,6.662c-0.173-0.173-0.173-0.452,0-0.624c0.172-0.175,0.451-0.175,0.624,0l3.738,3.736C12.695,9.947,12.695,10.228,12.522,10.4 M18.406,10c0,4.644-3.764,8.406-8.406,8.406c-4.644,0-8.406-3.763-8.406-8.406S5.356,1.594,10,1.594C14.643,1.594,18.406,5.356,18.406,10M17.521,10c0-4.148-3.374-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.147,17.521,10";
    var target = document.getElementsByClassName("ytp-right-controls")[0];
    var progressBar = document.getElementsByClassName('ytp-progress-bar')[0];
    var currentTime = document.getElementsByClassName('ytp-time-current')[0];
    var scrubber = document.getElementsByClassName('ytp-scrubber-container')[0];
    var debut = progressBar.getAttribute('aria-valuemin');
    var fin = progressBar.getAttribute('aria-valuemax');
    var total = progressBar.getAttribute('aria-valuemax');
    var leftIsShown  = false;
    var rightIsShown = false;

    var leftScrubber  = scrubber.cloneNode(true);
    leftScrubber.setAttribute('id','trashDebut');
    leftScrubber.setAttribute('aria-label','Set beginning');
    leftScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:black");

    var rightScrubber = scrubber.cloneNode(true);
    rightScrubber.setAttribute('id','trashFin');
    rightScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:black");
    leftScrubber.setAttribute('aria-label','Set end');

    //var container = document.getElementById('movie_player');
    //container.setAttribute('class',container.getAttribute('class')+' ytp-progress-bar-hover');

    function gauche(){
        debut=currentTime.innerText; //progressBar.getAttribute('aria-valuenow');
        leftScrubber.setAttribute('style',scrubber.getAttribute('style'));
        if (document.getElementById('trashDebut') == null){
            leftScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:white");
            progressBar.appendChild(leftScrubber);
            leftIsShown = true;
        }
    }

    function droite(){
        fin=currentTime.innerText;
        rightScrubber.setAttribute('style',scrubber.getAttribute('style'));
        if (document.getElementById('trashFin') == null){
            rightScrubber.firstChild.setAttribute("style","height: 13px; width:4px;background-color:white");
            progressBar.appendChild(rightScrubber);
            rightIsShown = true;
        }
    }

    function milieu(){
        alert('Segment paramétré ' + debut + ' à ' + fin + '  ✂️');
    }

    const fonctions=[gauche,milieu,droite];

    function InsertButton(geom,index){
        var btn = document.createElement("button");
        btn.setAttribute('class',target.lastChild.className);
        btn.setAttribute('aria-label','download');
        //icone
        var svgURI = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS( svgURI, 'svg' );
        svg.setAttribute( 'viewBox', '0 0 23 23' );
        svg.setAttribute( 'width', '100%');
        svg.setAttribute( 'height','100%');
        //tracé
        var path = document.createElementNS( svgURI, 'path' );
        path.setAttribute('class','class="ytp-svg-fill');
        path.setAttribute( 'd', geom );
        path.setAttribute('fill','#fff');
        svg.appendChild( path );
        btn.appendChild(svg);
        //onClick
        btn.addEventListener("click", fonctions[index]);
        target.insertBefore(btn,target.firstChild);
    }

    for (var i=0; i <= 4; i++) target.firstElementChild.remove();

    InsertButton(rightGeom,2);
    InsertButton(middleGeom,1);
    InsertButton(leftGeom,0);

    //Messaging on sliders states
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            
            if (request.type === "get_time")
                sendResponse({'debut': debut, 'fin':fin, 'total':total});
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
        console.log(focusState['focus-mode-checkbox'],focusState)
        if (focusState['focus-mode-checkbox']==="true" && (document.querySelector("#polymer-app") || document.querySelector("#masthead") || window.Polymer)) {
            justDoIt()
            setInterval(function () {
                justDoIt()
            }, 400);
        }
    })
}