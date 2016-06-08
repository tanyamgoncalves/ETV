var audioBuffer; // for the main part of the composition: part's I through III
var sampleBuffer; // for the final part of the composition: part IV
    

// Create the elements for the visual canvas
var canvas = document.createElement("canvas");
var context = canvas.getContext('2d');
var canvasRatio = canvas.height / canvas.width;
var windowRatio = window.innerHight / window.innerWidth;

var ga = 0.0;
var timerId = 0;
var angle = 0;

var width;
var height;

if (windowRatio < canvasRatio) {
    height = window.innerHeight;
    width = height / canvasRatio;
} else {
    width = window.innerWidth;
    height = width * canvasRatio;
}

canvas.style.background = 'black';
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

// Global adjustments to the particles (vel and color not used yet)
var gvel = 0.1;
var gsize = 200;
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
  var text = document.createTextNode('apert (test.js)');
  div.appendChild(text);
  document.body.appendChild(div);
  // create a clickable button and append to document
  var button = document.createElement("button");
  var label = document.createTextNode("simple test tone");
  button.appendChild(label);
  button.addEventListener('click',function() {
    simple(440,0.5);
  },false);
  document.body.appendChild(button);
  canvas.height = window.innerHeight; // height of HTML5 canvas
  canvas.width = window.innerWidth; // width
  context.fillStyle = "#000000"; // make the canvas black
  context.fillRect(0,0,window.innerHeight,window.innerWidth);
  document.body.appendChild(canvas);
},false);


// Visual code
var Rectangle = function(){
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = Math.floor(Math.random()*canvas.height);
    this.vx = Math.random()*0.5;
    this.vy = Math.random()*0.5;
    this.width = 1;
    this.height = 1;
    this.fcolor = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    this.radius = 10;
}

Rectangle.prototype.drawRectangle = function(){
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.fcolor;
    context.fill();

    var gradient = context.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.4, "white");
	gradient.addColorStop(0.4, this.fcolor);
    gradient.addColorStop(1, "white");
		
    context.fillStyle = gradient;
    context.arc(this.x, this.y, this.radius*gsize, Math.PI*2, false);
    context.fill();
    
    this.x += this.vx;
    this.y += this.vy;
		
    if(this.x < -50) this.x = canvas.width+50;
    if(this.y < -50) this.y = canvas.height+50;
    if(this.x > canvas.width+50) this.x = -50;
    if(this.y > canvas.height+50) this.y = -50;   
}

//initialize the rect bank
var rectBank = [];
 
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
});

//This populates the rectBank depending on how many grains are being played (number)
function createParticles(number){
    for (var j = 0; j<=number;j++){
        rectBank[j] = new Rectangle();
    }
}

//This function is called to loop through the animation
//Every time it is called it draws a single frame
function animationLoop(){
    clear();
    draw();
    queue();
}

//This clears the screen so a new fram can be drawn
function clear(){
    context.clearRect(0,0,canvas.width,canvas.height);
}

//This draws each rectangle in the list
function draw(){
    for(var i=0;i<rectBank.length;i++){
        rectBank[i].drawRectangle();
    }  
}

//This queues up the next frame to be drawn (sort of like timeOut but for animations)
function queue(){
    window.requestAnimationFrame(animationLoop);
}


// Load the audio sample for the composition, parts I, II, and III
function getData() {   
  var request = new XMLHttpRequest();
  request.open('GET','Ou-Why-Singing.wav', true);
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


// Load the audio sample for the final component of the composition, part IV
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

// Code for part IV
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


// Code for part's I, II, III
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
        this.source.buffer = audioBuffer;
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
    
    getData();
    loadSample();
    synthBank = new Array();
    samplePlay = new Array();
    
    for(var n=0;n<20;n++) {
        synthBank[n] = new Grain(n);
    }    
    
    for(var m=0;m<20;m++) {
        samplePlay[m] = new Sample(m);
    }   
}


function playASynthFromTheBank(dbamp,dur,rate,rmod,start,smod) {   
var n;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    console.log(rate);
    
var startTime = (new Date()).getTime();
      
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    console.log(start);
    
for(n=0;n<100;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<100) { // we found one that is not playing
	synthBank[n].play(dbamp,dur,rate,start);
} else {
	//console.log("sorry too many notes playing right now");
}
} 


function playPartFour(dbamp,dur,rate,start) {
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

// playPartFour();
   
function updateGrainPeriod(grainNum,nmod,grainPeriod,gmod) { // period x is in milliseconds
    
    var randomGrainNum = Math.random() < 0.5 ? -1 : 1;
    var deviationNum = Math.random()*(randomGrainNum*nmod*0.01)+2.5;
    grainNum = grainNum * Math.fround(deviationNum);
    console.log(grainNum);
    
    var randomGrainPeriod = Math.random() < 0.5 ? -1 : 1;
    var deviationGrain = Math.random()*(randomGrainPeriod*gmod*0.01)+1.5;
    grainPeriod = grainPeriod * Math.fround(deviationGrain);
    console.log(grainPeriod);

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

var counter = 0;

timeOutResponder = function(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod) {
	playASynthFromTheBank(dbamp,dur,rate,rmod,start,smod);
    
   if(counter==0){
        //start the animation loop
        animationLoop();
       
        //clear the rect bank
        rectBank = [];
       
        //create one particle for each grain
        createParticles(grainNum);
       
        //adjust global variables depending on dur
        gsize = dur;
        gvel = dur;
        gcolor = dur;
       
        //increment the counter
        counter++;
    }
    
    else if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
    setTimeout(timeOutResponder(dbamp,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod),grainPeriod,gmod);
}
