var ac = new (window.AudioContext||window.webkitAudioContext)();
var audioBuffer;

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
    this.amp = 1;
    this.dur = 1;
	this.gain = ac.createGain();
	this.gain.connect(ac.destination);
    this.gain.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

// Set the audiobuffersourcenode [done] -> starting position for grain -> duration change (arg) [done] -> env design [done]

var synthBank = new Array();

for(var n=0;n<20;n++) {
    synthBank[n] = new Grain(n);
}


function hanning(index,nPoints) {
    var win = 0.5 * (1 - Math.cos((2*(Math.PI)*(index))/(nPoints-1)));
    return win;
} 


Grain.prototype.play = function(amp,dur,rate,start) {
	if(this.playing == false) {
		var now = ac.currentTime;

		this.gain.gain.setValueAtTime(0,now);
        
        this.source = ac.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.gain);
        
        this.source.start(now,start,dur); // this function should allow me to specify the start time of the audio sample and the window of the envelope to specifiy a specifct position in the audio sample to play
        
        // 1. identifies zones of interest within sample
        // 2. put grains together 
        // 3. make simple things
        
        this.gain.gain.setValueAtTime(0,now);
        this.gain.gain.linearRampToValueAtTime(amp*0.2,now+((dur/6))); 
        this.gain.gain.linearRampToValueAtTime(amp*0.8,now+((dur/6)*2)); 
        this.gain.gain.linearRampToValueAtTime(amp*1,now+((dur/6)*3)); 
        this.gain.gain.linearRampToValueAtTime(amp*0.8,now+((dur/6)*4)); 
        this.gain.gain.linearRampToValueAtTime(amp*0.2,now+((dur/6)*5)); 
        this.gain.gain.linearRampToValueAtTime(0,now+dur); 
        
        /* var nPoints = 32;

        for(n=0;n<=nPoints;n++){
            this.gain.gain.linearRampToValueAtTime(amp*hanning(n,nPoints),(this.dur*(n+1)/nPoints)+now);
            console.log(hanning(n,nPoints));
        }   */
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		synthBank[index].playing = false;
	},dur*1000+100);
}


Grain.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.gain);
	this.gain.disconnect(ac.destination);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}

function playASynthFromTheBank(amp,dur,rate,start) {
var n;
for(n=0;n<20;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<20) { // we found one that is not playing
	synthBank[n].play(amp,dur,rate,start);
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

grainAmp = 5;
grainDur = 0.05;
grainRate = 1;
grainStart = 0;

timeOutResponder = function() {
	playASynthFromTheBank(grainAmp,grainDur,grainRate,grainStart);
	setTimeout(timeOutResponder,grainPeriod);
}


