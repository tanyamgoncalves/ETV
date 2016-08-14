// EMBRACING THE VOICE

var audioBufferOne; // sample one
var audioBufferTwo; // sample two
var audioBufferThree; // sample three
var sampleBuffer; // final section audio (phone ring)
var sampleBufferFour; // final section audio (phone call conversation)

var compressor; // compressor for audio samples
var globalGain; // global gain for all samples
    

// Create the elements for the visual canvas on mobile phones
var canvas = document.createElement("canvas");
canvas.style.background = 'black';
var context = canvas.getContext('2d');


// Make things only play for once iOS interaction
var playSimpleOnce = false;


// For iOs interaction
function simple(freq,amp) {
  apertStartAudio();
    
    // simple will only place once upon clicking the button
    if(playSimpleOnce == true) return;
    playSimpleOnce = true; 

	var sine = ac.createOscillator();
	sine.type = 'sine';
	sine.frequency.value = freq;
	var gain = ac.createGain();
	sine.connect(gain);
	gain.connect(ac.destination);
	sine.start();
	// envelope
	var now = ac.currentTime;
	gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(amp,now+0.005);
    gain.gain.linearRampToValueAtTime(0,now+0.405);
	// schedule cleanup
	setTimeout(function() {
		sine.stop();
		sine.disconnect(gain);
		gain.disconnect(ac.destination);
	},1000);
};


// Start button for audiences to click 
document.addEventListener('DOMContentLoaded',function() {
  var div = document.createElement('div');
  document.body.appendChild(div);
    
  // create a clickable button and append to document
  var button = document.createElement("IMG");
  button.src = "start-button.png";
    
    button.height = 500;
    button.width = 500;
    
  var label = document.createTextNode("simple test tone");
  button.appendChild(label);
  button.addEventListener('click',function() {
    simple(440,0.5);
      button.parentNode.removeChild(button);
      document.body.appendChild(canvas);
  },false);
  document.body.appendChild(button);
  canvas.height = document.documentElement.clientHeight; // height of HTML5 canvas
  canvas.width = document.documentElement.clientWidth; // width
  context.fillStyle = "#000000"; // make the canvas black
  context.fillRect(0,0,canvas.height,canvas.width);
},false);


// Buffer sources (audio sample loaders)
function getDataOne() {   
  var request = new XMLHttpRequest();
  request.open('GET','why-vocals.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Why Vocals Loaded.');
    var audioData = request.response;
    ac.decodeAudioData(audioData, function(buffer) {
    audioBufferOne = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 

function getDataTwo() {   
  var request = new XMLHttpRequest();
  request.open('GET','humming-vocals.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Humming Vocals Loaded.');
    var audioDataTwo = request.response;
    ac.decodeAudioData(audioDataTwo, function(buffer) {
    audioBufferTwo = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 

function getDataThree() {   
  var request = new XMLHttpRequest();
  request.open('GET','hey-vocals.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Hey Vocals Loaded.');
    var audioDataThree = request.response;
    ac.decodeAudioData(audioDataThree, function(buffer) {
    audioBufferThree = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 

function loadSample() {
  var request = new XMLHttpRequest();
  request.open('GET','ringing-phone-tone.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Ring Tone Loaded.');
    var sampleData = request.response;
    ac.decodeAudioData(sampleData, function(buffer) {
    sampleBuffer = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 

function loadFinalSection() {
  var request = new XMLHttpRequest();
  request.open('GET','mono-version-4.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Fourth Section Loaded.');
    var sampleDataFour = request.response;
    ac.decodeAudioData(sampleDataFour, function(buffer) {
    sampleBufferFour = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 


// Code for sample one 
var Grain = function(index) {
	this.index = index;
	this.gain = ac.createGain();
    this.gain.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamp = function(x) {
    return Math.pow(10,x/20)
}

Grain.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 3.00;
    
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amp = dbamp(db)*dbamp(35);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 0.05;
    }
    if (dur<0.005) {
        console.log("WARNING: dur below 5ms");
        dur = 0.005;
    }
    if (dur>3.00) {
        console.log("WARNING: dur above 3s");
        dur = 3.00;
    }
    
    
    if (rate == null) {
        console.log("WARNING: rate param required");
        rate = 1;
    }
    if (rate<0.05) {
        console.log("WARNING: rate too low");
        rate = 0.05;
    }
    if (rate>8) {
        console.log("WARNING: rate too high");
        rate = 8;
    }
        
    
    if (start == null) {
        console.log("WARNING: start param required");
        start = 0;
    }
    if (start<0) {
        console.log("WARNING: start less than 0");
        start = 0;
    }
    if (start+dur>sampleDur) {
        console.log("WARNING: start position and duration not valid");
        start = sampleDur-dur;
    }
    
	if(this.playing == false) {
		var now = ac.currentTime;
        
		this.gain.gain.setValueAtTime(0,now);
        this.source = ac.createBufferSource();
        this.source.buffer = audioBufferOne;
        this.source.connect(this.gain);
        this.gain.connect(compressor);
        this.source.start(now,start,dur);
        
        this.gain.gain.setValueAtTime(0,now);
        this.gain.gain.linearRampToValueAtTime(amp*0.2,now+((dur/6))); 
        this.gain.gain.linearRampToValueAtTime(amp*0.8,now+((dur/6)*2)); 
        this.gain.gain.linearRampToValueAtTime(amp*1,now+((dur/6)*3)); 
        this.gain.gain.linearRampToValueAtTime(amp*0.8,now+((dur/6)*4)); 
        this.gain.gain.linearRampToValueAtTime(amp*0.2,now+((dur/6)*5)); 
        this.gain.gain.linearRampToValueAtTime(0,now+dur); 
        
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
	this.source.disconnect(compressor);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}


// Code for sample 2
var sampleTwo = function(index) {
    this.index = index; 
	this.sampletwo = ac.createGain();
    this.sampletwo.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

sampleTwo.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 20;
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amplitude = dbamplitude(db)*dbamplitude(35);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 20;
    }
    if (dur<0.005) {
        console.log("WARNING: dur below 0.005ms");
        dur = 0.005;
    }
    if (dur>20) {
        console.log("WARNING: dur above 20s");
        dur = 20;
    }
    
    
    if (rate == null) {
        console.log("WARNING: rate param required");
        rate = 1;
    }
     if (rate<0.05) {
        console.log("WARNING: rate too low");
        rate = 0.05;
    }
    if (rate>8) {
        console.log("WARNING: rate too high");
        rate = 8;
    }
        
    
    if (start == null) {
        console.log("WARNING: start param required");
        start = 0;
    }
    if (start<0) {
        console.log("WARNING: start less than 0");
        start = 0;
    }
    if (start+dur>sampleDur) {
        console.log("WARNING: start position and duration not valid");
        start = sampleDur-dur;
    }
    
	if(this.playing == false) {
		var now = ac.currentTime;
        
		this.sampletwo.gain.setValueAtTime(0,now);
        this.source = ac.createBufferSource();
        this.source.buffer = audioBufferTwo;
        this.source.connect(this.sampletwo);
        this.sampletwo.connect(compressor);
        this.source.start(now,start,dur);
        
        this.sampletwo.gain.setValueAtTime(0,now);
        this.sampletwo.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6))); 
        this.sampletwo.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sampletwo.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.sampletwo.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sampletwo.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6)*5)); 
        this.sampletwo.gain.linearRampToValueAtTime(0,now+dur); 
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		synthBankTwo[index].playing = false;
	},dur*1000+100);
}

sampleTwo.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(compressor);
}

sampleTwo.prototype.notPlaying = function () {
	return (this.playing == false);
}


// Code for sample 3
var sampleThree = function(index) {
    this.index = index;   
	this.samplethree = ac.createGain();
    this.samplethree.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

sampleThree.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 5;
    
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amplitude = dbamplitude(db)*dbamplitude(20);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 5;
    }
    if (dur<0.005) {
        console.log("WARNING: dur below 0.005ms");
        dur = 0.005;
    }
    if (dur>5) {
        console.log("WARNING: dur above 5s");
        dur = 5;
    }
    
    
    if (rate == null) {
        console.log("WARNING: rate param required");
        rate = 1;
    }
     if (rate<0.05) {
        console.log("WARNING: rate too low");
        rate = 0.05;
    }
    if (rate>8) {
        console.log("WARNING: rate too high");
        rate = 8;
    }
        
    
    if (start == null) {
        console.log("WARNING: start param required");
        start = 0;
    }
    if (start<0) {
        console.log("WARNING: start less than 0");
        start = 0;
    }
    if (start+dur>sampleDur) {
        console.log("WARNING: start position and duration not valid");
        start = sampleDur-dur;
    }
    
	if(this.playing == false) {
		var now = ac.currentTime;
        
		this.samplethree.gain.setValueAtTime(0,now);
        this.source = ac.createBufferSource();
        this.source.buffer = audioBufferThree;
        this.source.connect(this.samplethree);
        this.samplethree.connect(compressor);
        this.source.start(now,start,dur);
        
        this.samplethree.gain.setValueAtTime(0,now);
        this.samplethree.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6))); 
        this.samplethree.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.samplethree.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.samplethree.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.samplethree.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6)*5)); 
        this.samplethree.gain.linearRampToValueAtTime(0,now+dur); 
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		synthBankThree[index].playing = false;
	},dur*1000+100);
}

sampleThree.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(compressor);
}

sampleThree.prototype.notPlaying = function () {
	return (this.playing == false);
}


// Code for final section (phone ringing)
var Sample = function(index) {
	this.index = index;    
	this.sample = ac.createGain();
    this.sample.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

Sample.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 30;
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amplitude = dbamplitude(db)*dbamplitude(40);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 30;
    }
    if (dur<0.5) {
        console.log("WARNING: dur below 0.5s");
        dur = 0.5;
    }
    if (dur>30) {
        console.log("WARNING: dur above 213s");
        dur = 30;
    }
    
    
    if (rate == null) {
        console.log("WARNING: rate param required");
        rate = 1;
    }
        
    
    if (start == null) {
        console.log("WARNING: start param required");
        start = 0;
    }
    if (start<0) {
        console.log("WARNING: start less than 0");
        start = 0;
    }
    if (start+dur>sampleDur) {
        console.log("WARNING: start position and duration not valid");
        start = sampleDur-dur;
    }
    
	if(this.playing == false) {
		var now = ac.currentTime;
        
		this.sample.gain.setValueAtTime(0,now);
        this.source = ac.createBufferSource();
        this.source.buffer = sampleBuffer;
        this.source.connect(this.sample);
        this.sample.connect(compressor);
        this.source.start(now,start,dur);
        
        this.sample.gain.setValueAtTime(0.2,now);
        this.sample.gain.linearRampToValueAtTime(amplitude*0.6,now+((dur/6))); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.9,now+((dur/6)*3)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.6,now+((dur/6)*5)); 
        this.sample.gain.linearRampToValueAtTime(0.2,now+dur); 
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		samplePlay.playing = false;
	},dur*1000+100);
}

Sample.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.sample);
}

Sample.prototype.notPlaying = function () {
	return (this.playing == false);
}


// Code for final section (phone call conversation)
var SampleFour = function(index) {
	this.index = index;    
	this.sampleFour = ac.createGain();
    this.sampleFour.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

SampleFour.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 140;
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amplitude = dbamplitude(db)*dbamplitude(20);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 140;
    }
    if (dur<140) {
        console.log("WARNING: dur below 0.5s");
        dur = 140;
    }
    if (dur>140) {
        console.log("WARNING: dur above 240s");
        dur = 140;
    }
    
    
    if (rate == null) {
        console.log("WARNING: rate param required");
        rate = 1;
    }
        
    
    if (start == null) {
        console.log("WARNING: start param required");
        start = 0;
    }
    if (start<0) {
        console.log("WARNING: start less than 0");
        start = 0;
    }
    if (start+dur>sampleDur) {
        console.log("WARNING: start position and duration not valid");
        start = sampleDur-dur;
    }
    
	if(this.playing == false) {
		var now = ac.currentTime;
        
		this.sampleFour.gain.setValueAtTime(0,now);
        this.source = ac.createBufferSource();
        this.source.buffer = sampleBufferFour;
        this.source.connect(this.sampleFour);
        this.sampleFour.connect(compressor);
        this.source.start(now,start,dur);
        
        this.sampleFour.gain.setValueAtTime(0.3,now);
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.6,now+((dur/6))); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.3,now+((dur/6)*5)); 
        this.sampleFour.gain.linearRampToValueAtTime(0,now+dur); 
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		sampleFourPlay.playing = false;
	},dur*1000+100);
}

Sample.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.sampleFour);
}

Sample.prototype.notPlaying = function () {
	return (this.playing == false);
}


// Where everything loads onto Apert
function apertInitialize() { 
    
    compressor = ac.createDynamicsCompressor(); // compressor design for audio samples
    compressor.threshold.value = -15;
    compressor.ratio.value = 20;

    globalGain = ac.createGain(); // global gain to control audio sample levels
    globalGain.gain.value = dbamplitude(10);

    compressor.connect(globalGain);
    globalGain.connect(ac.destination);
   
    getDataOne();
    getDataTwo();
    getDataThree();

    loadSample();
    loadFinalSection();
    
    synthBank = new Array();
    synthBankTwo = new Array();
    synthBankThree = new Array();
    
    for(var n=0;n<5;n++) {
        synthBank[n] = new Grain(n);
    } 
    
    for(var o=0;o<5;o++) {
        synthBankTwo[o] = new sampleTwo(o);
    }  
    
    for(var p=0;p<5;p++) {
        synthBankThree[p] = new sampleThree(p);
    }  
 
    samplePlay = new Sample;
    sampleFourPlay = new SampleFour; 
}


// Functions for each sample, integrated randomness (asynchronous features for rate and start position)
function playSampleOne(dbamp,dur,rate,rmod,start,smod) {   
var n;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    
var startTime = (new Date()).getTime();
      
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    
for(n=0;n<5;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<5) { // we found one that is not playing
	synthBank[n].play(dbamp,dur,rate,start);
} else {
	console.log("sorry too many notes playing right now");
}
} 


function playSampleTwo(dbamp,dur,rate,rmod,start,smod) {   
var o;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    
var startTime = (new Date()).getTime();
      
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    
for(o=0;o<5;o++) {
	if(synthBankTwo[o].notPlaying())break;
}
if(o<5) { 
	synthBankTwo[o].play(dbamp,dur,rate,start);
} else {
	console.log("sorry too many notes playing right now");
}
} 


function playSampleThree(dbamp,dur,rate,rmod,start,smod) {   
var p;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    
var startTime = (new Date()).getTime();
      
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    
for(p=0;p<5;p++) {
	if(synthBankThree[p].notPlaying())break;
}
if(p<5) { 
	synthBankThree[p].play(dbamp,dur,rate,start);
} else {
	console.log("sorry too many notes playing right now");
}
} 


// Function to update in samples 1 to 3 (asychronous features for grain number and grain period)
function updateGrainPeriod(grainNum,nmod,grainPeriod,gmod) { 
    
    var randomGrainNum = Math.random() < 0.5 ? -1 : 1;
    var deviationNum = Math.random()*(randomGrainNum*nmod*0.01);
    grainNum = grainNum * Math.fround(deviationNum);
    
    var deviationGrain = Math.random()*gmod*2-gmod;
    grainPeriod = grainPeriod * Math.fround(deviationGrain);

}


// Function for phone rining sample
function callHim(dbamp,dur,rate,start) {
    samplePlay.play(dbamp,dur,rate,start);
}


// Function for phone call conversation sample
function phoneCall(dbamp,dur,rate,start) {
    sampleFourPlay.play(dbamp,dur,rate,start);
}
 

// Code for sample one
var counter = 0;

playGrains = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleOne(dbamp,dur,rate,rmod,start,smod);
    
    console.log(counter);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
     setTimeout(playGrains(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}


// Code for sample two
var counter = 0;

playGrainsTwo = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleTwo(dbamp,dur,rate,rmod,start,smod);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(playGrainsTwo(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}


// Code for sample three
var counter = 0;

playGrainsThree = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleThree(dbamp,dur,rate,rmod,start,smod);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(playGrainsThree(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}