var audioBuffer;
// var sampleBuffer;

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

var canvas = document.createElement("canvas");
var context = canvas.getContext('2d');
var ga = 0.0;
var timerId = 0;
var angle = 0;

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
  canvas.height = 1000;
  canvas.width = 1500;
  context.fillStyle = "#000000";
  context.fillRect(0,0,canvas.width,canvas.height);
  document.body.appendChild(canvas);
},false);

// load the audio sample for the composition, parts I, II, and III
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

/*
// load the audio sample for the final component of the composition, part IV
function loadSample() {
  var request = new XMLHttpRequest();
  request.open('GET','', true);
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
} */
    

/*
function startup() {
    var el = document.getElementsByTagName("touchArea")[0];
    el.addEventListener("touchstart",apertStartAudio,false);
} */


var Rectangle = function(width,height,borderWidth,bcolor,rspeed){
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = Math.floor(Math.random()*canvas.height);
    this.width = width;
    this.height = height;
    this.borderWidth = borderWidth;
    this.fcolor = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    this.bcolor = bcolor;
    this.rspeed = rspeed;
    this.vx = Math.random()*20-10;
    this.vy = Math.random()*20-10;
    this.radius = Math.random()*20+20;
}

Rectangle.prototype.drawRectangle = function(){
    context.beginPath();
    context.rect(this.x,this.y, this.width, this.height);
    context.fillStyle = this.fcolor;
    context.fill();
    context.lineWidth = this.borderWidth;
    context.strokeStyle = this.bcolor;
    context.stroke();

    var gradient = context.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.4, "white");
	gradient.addColorStop(0.4, this.fcolor);
    gradient.addColorStop(1, "black");
		
    context.fillStyle = gradient;
    context.arc(this.x, this.y, this.radius, Math.PI*2, false);
    context.fill();
		
    this.x += this.vx;
    this.y += this.vy;
		
    if(this.x < -50) this.x = canvas.width+50;
    if(this.y < -50) this.y = canvas.height+50;
    if(this.x > canvas.width+50) this.x = -50;
    if(this.y > canvas.height+50) this.y = -50;
    
}

Rectangle.prototype.animate = function(canvas,context,startTime,dur){
    // update
    var time = (new Date()).getTime() - startTime;

    var linearSpeed = 100;
    // pixels / second
    var newX = linearSpeed * time / 1000;

    if(newX < this.width - this.width - this.borderWidth / 2) {
      this.x = newX;
    }

    // clear
    //context.clearRect(0, 0, canvas.width, canvas.height);

    this.drawRectangle();

    // request new frame
    //requestAnimFrame(function() {
    //    this.animate(canvas, context, startTime, dur);
    //});  
}

function fadeIn(){
    context.clearRect(0,0, canvas.width,canvas.height);
    context.globalAlpha = ga;
    ga = ga + 0.1;

    if (ga > 1.0)
    {
        fadeOut();
        goingUp = false;
        clearInterval(timerId);
    }
}

function fadeOut(){
    context.clearRect(0,0, canvas.width,canvas.height);
    context.globalAlpha = ga;

    ga = ga - 0.1;

    if (ga < 0){
        goingUp = false;
        clearInterval(timerId);
    }
}

var rectBank = new Array();

function partOne(){
    createParticles(1);
    setInterval(draw, 33);
}

function draw(){
    for(var i=0;i<rectBank.length;i++){
        rectBank[i].drawRectangle();
    }  
}

function createParticles(number){
    for (var j = 0; j<=number;j++){
        rectBank[j] = new Rectangle(5,5,0,'black',Math.floor(Math.random()*100));
    }
}
                          
window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();


var Grain = function(index) {
	this.index = index;    
	this.gain = ac.createGain();
    
    //this.biquadFilter = ac.createBiquadFilter();
    //this.convolver = ac.createConvolver();
    
	this.gain.connect(ac.destination);
    this.gain.gain.setValueAtTime(0,ac.currentTime);
	this.playing = false;
}

/* 
function hanning(index,nPoints) {
    var win = 0.5 * (1 - Math.cos((2*(Math.PI)*(index))/(nPoints-1)));
    return win;
}*/ 

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
        // this.source.connect(this.biquadFilter);
        
        this.source.connect(this.gain);
        
        //this.biquadFilter.connect(this.gain);
        // this.convolver.connect(this.gain);
        
       // this.biquadFilter.type = "lowshelf";
       // this.biquadFilter.frequency.value = 1000;
        
        this.source.start(now,start,dur);
        
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
    
    //this.source.disconnect(this.biquadFilter);
	//this.gain.disconnect(ac.destination);
}

Grain.prototype.isNotPlaying = function () {
	return (this.playing == false);
}

function apertInitialize() { 
    
    getData();
    synthBank = new Array();
    
    for(var n=0;n<20;n++) {
        synthBank[n] = new Grain(n);
    }    
}


function playASynthFromTheBank(dbamp,dur,rate,rmod,start,smod) {   
var n;

var randomRate = Math.random() < 0.5 ? -1 : 1;
var deviationRate = Math.random()*(randomRate*rmod*0.01)+1.00;
    rate = rate * Math.fround(deviationRate);
    console.log(rate);
var startTime = (new Date()).getTime();
//var rectangle = new Rectangle(50,50,0,'black');
    //rectangle.drawRectangle(context);
    //timerId = setInterval("fadeIn()", 300);
    //rectangle.animate(canvas,context,startTime,1);
    
    
    partOne(); // part I design call 
    
    
var randomStart = Math.random() < 0.5 ? 1 : 1;
var deviationStart = Math.random()*(randomStart*smod*0.01)+2.00;
    start = start * Math.fround(deviationStart);
    console.log(start);
    
for(n=0;n<20;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<20) { // we found one that is not playing
	synthBank[n].play(dbamp,dur,rate,start);
} else {
	console.log("sorry too many notes playing right now");
}
} 

// playASynthFromTheBank();

var grainPeriod = 1000;
function updateGrainPeriod(x) { // period x is in milliseconds
	grainPeriod = x;
    
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
    }
}


var counter = 0;

timeOutResponder = function(dbamp,dur,rate,rmod,start,smod,grainNum,grainPeriod) {
	playASynthFromTheBank(dbamp,dur,rate,rmod,start,smod);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    else{
        counter++; // counter = counter + 1
        setTimeout(timeOutResponder(dbamp,dur,rate,rmod,start,smod,grainNum,grainPeriod),grainPeriod);
    }
}