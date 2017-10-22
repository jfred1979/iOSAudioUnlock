export default function unlockAudio(context, completeCallback, addOverlay, params) {
    var overlayContainer;
    var overlayTextNode;
    if(addOverlay) {
        overlayContainer = document.createElement('div');
        overlayTextNode = document.createElement('span');
        overlayTextNode.innerHTML = (params !== undefined && params.overlayText !== undefined) ? params.overlayText : 'tap to begin';
        overlayTextNode.className = 'overlayTextNode';
        overlayContainer.appendChild(overlayTextNode);
        if(params !== undefined && params.overlayClassName !== undefined) {
            overlayContainer.className = params.overlayClassName;
        } else {
            overlayContainer.className = 'unlockAudioPrompt';
            overlayContainer.style.display = 'flex';
            overlayContainer.style.justifyContent = 'center';
            overlayContainer.style.alignItems = 'center';
            overlayContainer.style.zIndex = '1000';
            overlayContainer.style.position = 'static';
            overlayContainer.style.width = '100%';
            overlayContainer.style.height = '100%';
            overlayContainer.style.color = '#ffffff';
            overlayContainer.style.fontFamily = 'Arial';
            overlayContainer.style.fontSize = '2em';
            overlayContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        }
        document.body.insertBefore(overlayContainer, document.body.childNodes[0]);
    }

    var complete = () => {
        if(overlayContainer !== undefined) {
            document.body.removeChild(overlayContainer);
            overlayContainer = null;
            overlayTextNode = null;
        }
        if(completeCallback !== undefined && completeCallback !== null) {
            completeCallback();
        }
    }

    var isWebAudioUnlocked = false;
    var isHTMLAudioUnlocked = false;

    var unlock = () => {
        if(overlayTextNode !== undefined) {
            overlayTextNode.style.transition = 'all .25s ease-in-out';
            overlayTextNode.style.opacity = '0';
        }
        document.body.removeEventListener('click', unlock, false);
        document.body.removeEventListener('touchend', unlock, false);

        if (context.state === 'suspended') {
            context.resume();
        }
        // Unlock WebAudio - create short silent buffer and play it
        // This will allow us to play web audio at any time in the app
        var buffer = context.createBuffer(1, 1, 22050); // 1/10th of a second of silence
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = function()
        {
            isWebAudioUnlocked = true;
            if (isWebAudioUnlocked && isHTMLAudioUnlocked)
            {
                //console.log("WebAudio unlocked and playable w/ mute toggled on!");
                complete();
            }
        };
        source.start();

        // Unlock HTML5 Audio - load a data url of short silence and play it
        // This will allow us to play web audio when the mute toggle is on
        var silenceDataURL = "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        var tag = document.createElement("audio");
        tag.controls = false;
        tag.preload = "auto";
        tag.loop = false;
        tag.src = silenceDataURL;
        tag.onended = function()
        {
            isHTMLAudioUnlocked = true;
            if (isWebAudioUnlocked && isHTMLAudioUnlocked)
            {
                //console.log("WebAudio unlocked and playable w/ mute toggled on!");
                complete();
            }
        };
        tag.play();
    }
    document.body.addEventListener('click', unlock, false);
    document.body.addEventListener('touchend', unlock, false);
}