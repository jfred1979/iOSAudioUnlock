# iOS Audio Unlock
Unlock audio on iOS after user touches screen, allows Web Audio to be played even when mute switch is on

Example:

import unlockAudio from 'ios-audio-unlock';

playAudio = () => {

  // play some audio
  
}

unlockAudio(myAudioContext, playAudio, false, true);
