var ac = new (window.AudioContext||window.webkitAudioContext)();
var audioBuffer = ac.createBuffer(1, 49152, 48000);

// load the audio sample
function getData() {   
  var request = new XMLHttpRequest();
  request.open('GET','Vowel-A.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Buffer Was Loaded.');
    var audioData = request.response;
    ac.decodeAudioData(audioData, function(buffer) {
    audioBuffer = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 

getData();

var Grain = function(index) {
	this.index = index;
    this.amp = 10;
    this.dur = 1;
	this.gain = ac.createGain();
	this.gain.connect(ac.destination);
    this.gain.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

// Set the audiobuffersourcenode [done] -> starting position for grain -> duration change (arg) [done] -> env design [done]

var synthBank = new Array();

for(var n=0;n<10;n++) {
    synthBank[n] = new Grain(n);
}


function hanning(index,x) {
    var win = 0.5 * (1 - Math.cos((2*(Math.PI)*(index))/(x-1)));
    return win;
}


Grain.prototype.play = function(amp,dur,rate,start,win) {
	if(this.playing == false) {
		var now = ac.currentTime;
        var x = 32;
		this.gain.gain.setValueAtTime(0,now);
        
        this.source = ac.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.gain);
        
        this.source.start(now,start,win); // this function should allow me to specify the start time of the audio sample and the window of the envelope to specifiy a specifct position in the audio sample to play
        
        for(n=0;n<=x;n++){
            this.gain.gain.linearRampToValueAtTime(amp*hanning(n,x),(this.dur*(n+1)/x)+now);
            console.log(hanning(n,x));
        }
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		synthBank[index].playing = false;
	},1000);
}


Grain.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.gain);
	this.gain.disconnect(ac.destination);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}

function playASynthFromTheBank(amp,dur,rate,start,win) {
var n;
for(n=0;n<10;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<10) { // we found one that is not playing
	synthBank[n].play(amp,dur,rate,start,win);
} else {
	console.log("sorry too many notes playing right now");
}
} 

// playASynthFromTheBank();

var grainPeriod = 1000;
function updateGrainPeriod(x) { // period x is in milliseconds
	grainPeriod = x;
}

// or if preferred
function updateGrainFrequency(x) {
	grainPeriod = 1000/x;
}

timeOutResponder = function() {
	playASynthFromTheBank(grainAmplitude);
	setTimeout(timeOutResponder,grainPeriod);
}


