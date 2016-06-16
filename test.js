var audioBufferOne; 
var audioBufferTwo;
// var audioBufferThree;
var sampleBuffer; 
    
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
    this.fcolor = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
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
        this.fcolor = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
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

/*
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
} */


function loadSample() {
  var request = new XMLHttpRequest();
  request.open('GET','mono.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Sound File for Part IV was Loaded.');
    var sampleData = request.response;
    ac.decodeAudioData(sampleData, function(buffer) {
    sampleBuffer = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
} 




// Code for sample 2
var sampleTwo = function(index) {
    this.index = index;    
	this.sampletwo = ac.createGain();
	this.sampletwo.connect(ac.destination);
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
		samplePlay[index].playing = false;
	},dur*1000+100);
}

sampleTwo.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.sample);
}

sampleTwo.prototype.notPlaying = function () {
	return (this.playing == false);
}


















// Code for sample 4
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
    var sampleDur = 213;
    
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
        dur = 213;
    }
    if (dur<0.5) {
        console.log("WARNING: dur below 0.5s");
        dur = 0.5;
    }
    if (dur>213) {
        console.log("WARNING: dur above 213s");
        dur = 213;
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
        this.sample.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6))); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*2)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*1,now+((dur/6)*3)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.8,now+((dur/6)*4)); 
        this.sample.gain.linearRampToValueAtTime(amplitude*0.2,now+((dur/6)*5)); 
        this.sample.gain.linearRampToValueAtTime(0,now+dur); 
        
        this.source.playbackRate.value = rate;
        this.playing = true;
	}
	var index = this.index;
	setTimeout(function() {
		samplePlay[index].playing = false;
	},dur*1000+100);
}

Sample.prototype.dealloc = function() {
	this.source.stop();
	this.source.disconnect(this.sample);
}

Sample.prototype.notPlaying = function () {
	return (this.playing == false);
}




// Code for sample one 

var Grain = function(index) {
	this.index = index;    
	this.gain = ac.createGain();
	this.gain.connect(ac.destination);
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
	this.source.disconnect(this.gain);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}












function apertInitialize() { 
    
    getDataOne();
    getDataTwo();
    
    loadSample();
    
    synthBank = new Array();
    synthBankTwo = new Array();
    
    samplePlay = new Array();
    rectBank = new Array();
    
    
    
    for(var n=0;n<100;n++) {
        synthBank[n] = new Grain(n);
    } 
    
    for(var o=0;o<100;o++) {
        synthBankTwo[o] = new sampleTwo(o);
    }    

    
    
    for(var m=0;m<100;m++) {
        samplePlay[m] = new Sample(m);
    } 
    
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
    
for(n=0;n<100;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<100) { // we found one that is not playing
	synthBank[n].play(dbamp,dur,rate,start);
} else {
	//console.log("sorry too many notes playing right now");
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
    
for(o=0;o<100;o++) {
	if(synthBankTwo[o].notPlaying())break;
}
if(o<100) { 
	synthBankTwo[o].play(dbamp,dur,rate,start);
} else {
	
}
} 


function callHim(dbamp,dur,rate,start) {
    var m;
    
    for(m=0;m<100;m++) {
	   if(samplePlay[m].notPlaying())break;
    }
    if(m<100) { // we found one that is not playing
        samplePlay[m].play(dbamp,dur,rate,start);
    } else {
        // console.log("sorry too many notes playing right now");
    }
}

   
function updateGrainPeriod(grainNum,nmod,grainPeriod,gmod) { // period x is in milliseconds
    
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

playGrains = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playSampleOne(dbamp,dur,rate,rmod,start,smod);
    drawAParticleFromTheBank(dur);   
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(playGrains(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}


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
