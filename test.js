var audioBufferOne; // sample one
var audioBufferTwo; // sample two
var audioBufferThree; // sample three
var sampleBuffer; // sample four (phone ring)
var sampleBufferFour; // final section audio
    
// Create the elements for the visual canvas
var canvas = document.createElement("canvas");
canvas.style.background = 'black';
var context = canvas.getContext('2d');

var ga = 0.0;
var timerId = 0;
var angle = 0;

// Global adjustments to the particles (vel and color not used yet)
var gvel = 0.1;
var gsize = 10;
var gcolor = 0;

// Make things only play for once iOS interaction
var playSimpleOnce = false;

// For iOS interaction
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

document.addEventListener('DOMContentLoaded',function() {
  // write label to top of document
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





// Visual code
var Rectangle = function(index){
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = Math.floor(Math.random()*canvas.height);
    this.width = 5;
    this.height = 5;
    this.fcolor = '#FFFFFF' // + Math.random().toString(16).slice(2, 8).toUpperCase();
    this.animTime = 1;
    this.alpha = 1;
    this.index = index;
    this.isAnimating = false;
}

Rectangle.prototype.draw = function(){
    if(this.animTime >= 0){
        context.beginPath();
        context.rect(this.x, this.y, this.width*gsize, this.height*gsize);
        context.fillStyle = this.fcolor;
        context.fill();
    
        this.animTime += (-0.05/this.dur); // += (-0.05/dur); (-this.dur/100)
    }
    
    else{
        this.isAnimating = false;
        this.animTime = 1;
        this.x = Math.floor(Math.random()*canvas.width);
        this.y = Math.floor(Math.random()*canvas.height);
        this.fcolor = '#FFFFFF' // + Math.random().toString(16).slice(2, 8).toUpperCase();
    }
}

Rectangle.prototype.setDur = function(dur){
    this.dur = dur;
}

Rectangle.prototype.queueDraw = function(){
    this.isAnimating = true;
}

Rectangle.prototype.isNotAnimating = function () {
	return (this.isAnimating == false);
}

 
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
});

function drawAParticleFromTheBank(dur){
    var j;
    
    for(j=0;j<100;j++){
        if(rectBank[j].isNotAnimating())break;
    }
    
    if(j<100) {
        rectBank[j].queueDraw();
        rectBank[j].setDur(dur);
    }
}
    
function animationLoop(){
    clear();
    for(var i=0;i<100;i++){
        if(rectBank[i].isAnimating){
            rectBank[i].draw();
        }
    }
    requestAnimationFrame(animationLoop);
}

    
function clear(){
    context.clearRect(0,0,canvas.width,canvas.height);
} 



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
    this.compressor = ac.createDynamicsCompressor();
	this.gain = ac.createGain();
    this.gain.connect(this.compressor);
    this.gain.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}


dbamp = function(x) {
    return Math.pow(10,x/20)
}

Grain.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 3.00;
    
    this.compressor.threshold.value = 20;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 4;
    this.compressor.reduction.value = 0;
    this.compressor.attack.value = 0.05;
    this.compressor.release.value = 0.1;
    this.compressor.connect(ac.destination);
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amp = dbamp(db)*dbamp(60);
    

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
	this.source.disconnect(this.compressor);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}



// Code for sample 2
var sampleTwo = function(index) {
    this.index = index; 
    this.compressor = ac.createDynamicsCompressor();
	this.sampletwo = ac.createGain();
	this.sampletwo.connect(this.compressor);
    this.sampletwo.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

sampleTwo.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 20;
    
    this.compressor.threshold.value = 20;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 4;
    this.compressor.reduction.value = 0;
    this.compressor.attack.value = 0.05;
    this.compressor.release.value = 0.1;
    this.compressor.connect(ac.destination);
    
    
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
	this.source.disconnect(this.compressor);
}

sampleTwo.prototype.notPlaying = function () {
	return (this.playing == false);
}



// Code for sample 3
var sampleThree = function(index) {
    this.index = index;   
    this.compressor = ac.createDynamicsCompressor();
	this.samplethree = ac.createGain();
	this.samplethree.connect(this.compressor);
    this.samplethree.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

dbamplitude = function(x) {
    return Math.pow(10,x/20)
}

sampleThree.prototype.play = function(db,dur,rate,start) {
    var sampleDur = 5;
    
    
    this.compressor.threshold.value = 20;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 4;
    this.compressor.reduction.value = 0;
    this.compressor.attack.value = 0.05;
    this.compressor.release.value = 0.1;
    this.compressor.connect(ac.destination);
    
    
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
	this.source.disconnect(this.compressor);
}

sampleThree.prototype.notPlaying = function () {
	return (this.playing == false);
}




// Code for phone ringing
var Sample = function(index) {
	this.index = index;    
	this.sample = ac.createGain();
	this.sample.connect(ac.destination);
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
        this.source.start(now,start,dur);
        
        this.sample.gain.setValueAtTime(0,now);
        this.sample.gain.linearRampToValueAtTime(amplitude*0.3,now+((dur/6))); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.3,now+((dur/6)*5)); 
        this.sample.gain.linearRampToValueAtTime(0,now+dur); 
        
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



// Code for fourth section (final)
var SampleFour = function(index) {
	this.index = index;    
	this.sampleFour = ac.createGain();
	this.sampleFour.connect(ac.destination);
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
        this.source.start(now,start,dur);
        
        this.sampleFour.gain.setValueAtTime(0,now);
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.6,now+((dur/6))); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sampleFour.gain.linearRampToValueAtTime(amplitude*0.6,now+((dur/6)*5)); 
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





// where everything loads onto apert
function apertInitialize() { 
    
    getDataOne();
    getDataTwo();
    getDataThree();

    loadSample();
    loadFinalSection();
    
    synthBank = new Array();
    synthBankTwo = new Array();
    synthBankThree = new Array();
    
    // samplePlay = new Array();
    rectBank = new Array();
    
    
    
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
   
    
    for(var k=0;k<100;k++) {
        rectBank[k] = new Rectangle(k);
    }
    animationLoop();   
}



function playSampleOne(dbamp,dur,rate,rmod,start,smod) {   
var n;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    // console.log(rate);
    
var startTime = (new Date()).getTime();
      
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    // console.log(start);
    
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


function callHim(dbamp,dur,rate,start) {
    samplePlay.play(dbamp,dur,rate,start);
}

function phoneCall(dbamp,dur,rate,start) {
    sampleFourPlay.play(dbamp,dur,rate,start);
}

   
function updateGrainPeriod(grainNum,nmod,grainPeriod,gmod) { 
    
    var randomGrainNum = Math.random() < 0.5 ? -1 : 1;
    var deviationNum = Math.random()*(randomGrainNum*nmod*0.01);
    grainNum = grainNum * Math.fround(deviationNum);
    // console.log(grainNum);
    
   // var randomGrainPeriod = Math.random() < 0.5 ? -1 : 1;
   // var deviationGrain = Math.random()*(randomGrainPeriod*gmod*0.01);
    
    var deviationGrain = Math.random()*gmod*2-gmod;
    grainPeriod = grainPeriod * Math.fround(deviationGrain);
    // console.log(grainPeriod);

    /*
    if (grainPeriod == null) {
        console.log("WARNING: grain period required");
        grainPeriod = 1000;
    }
    if (grainPeriod>1000) {
        console.log("WARNING: grain period greater than 1000");
        grainPeriod = 1000;
    }
    if (grainPeriod<100) {
        console.log("WARNING: grain period less than 100");
        grainPeriod = 100;
    } */
}


// code for sample one

var counter = 0;
// var id;

// function playGrainsSample(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
   // id = setInterval(playGrains(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
// }

playGrains = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleOne(dbamp,dur,rate,rmod,start,smod);
    drawAParticleFromTheBank(dur);
    
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



/* psudo code to fix the playback problem with the grains...


function playGrains(arguments?) {

var counter = 0

function playSampleOne() {

counter++

if counter == grainNum
    clearInterval(id)
    }
    
    var id = setInterval(playSampleOne, grainPeriod)
    }
    
    
*/   



// code for sample two

var counter = 0;

playGrainsTwo = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleTwo(dbamp,dur,rate,rmod,start,smod);
    drawAParticleFromTheBank(dur);   
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(playGrainsTwo(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}


// code for sample three

var counter = 0;

playGrainsThree = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleThree(dbamp,dur,rate,rmod,start,smod);
    drawAParticleFromTheBank(dur);   
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(playGrainsThree(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}

