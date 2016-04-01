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
// console.log(audioBuffer.getChannelData(0));
 

var Grain = function(index) {
	this.index = index;
    // this.sine = ac.createOscillator();
    // this.sine.type = 'sine';
    // this.sine.frequency.value = 440;
	this.source = ac.createBufferSource();
    this.source.buffer = audioBuffer;
    this.amp = 2;
	this.gain = ac.createGain();
	this.source.connect(this.gain);
	this.gain.connect(ac.destination);
	this.source.start(0);
	this.playing = false;
}

// Set the audiobuffersourcenode -> starting position for grain -> duration change (arg) -> env design 

var synthBank = new Array();
for(var n=0;n<10;n++) {
	synthBank[n] = new Grain(n);
}

Grain.prototype.play = function() {
	if(this.playing == false) {
		var now = ac.currentTime;
		this.gain.gain.setValueAtTime(0,now);
		this.gain.gain.linearRampToValueAtTime(this.amp,now+0.005);
		this.gain.gain.linearRampToValueAtTime(0,now+0.405);
		this.playing = true;
	}
	// var index = this.index;
	setTimeout(function() {
		this.playing = false;
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

// somewhere else where we are using the class/object
var mySynth = new Grain();


function playASynthFromTheBank() {
var n;
for(n=0;n<10;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<10) { // we found one that is not playing
	synthBank[n].play();
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
