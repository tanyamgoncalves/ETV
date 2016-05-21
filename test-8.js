//var ac = new (window.AudioContext||window.webkitAudioContext)();
var audioBuffer;

$( document ).ready(function() {
    $('<div/>', { id: 'theButton' }).appendTo('body').css({
        'width' : '50%', 'height' : '20%',
        'position' : 'absolute', 'top': '10%', 'left' : '25%',
        'background-color': 'rgba(170, 240, 38,0.5)',
        'border-radius' : '100px'
      })
});

$(window).on("touchend", function(event){
    unlock();
});



// load the audio sample
function getData() {   
  var request = new XMLHttpRequest();
  request.open('GET','Threw-Me-Away.wav', true);
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
function startup() {
    var el = document.getElementsByTagName("touchArea")[0];
    el.addEventListener("touchstart",apertStartAudio,false);
} */


var Grain = function(index) {
	this.index = index;    
	this.gain = ac.createGain();
    
    this.biquadFilter = ac.createBiquadFilter();
   //  this.convolver = ac.createConvolver();
    
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

Grain.prototype.play = function(db,dur,rate,start,filter) {
    var sampleDur = 2.00;
    
    if (db == null) {
        console.log("WARNING: amp param required");
        db = -20;
    }
    if (db>-2) {
        console.log("WARNING: amp too high above -2db");
        db = -2;
    }
    
    var amp = dbamp(db)*dbamp(40);
    

    if (dur == null) {
        console.log("WARNING: dur param required");
        dur = 0.25;
    }
    if (dur<0.01) {
        console.log("WARNING: dur below 10ms");
        dur = 0.01;
    }
    if (dur>0.25) {
        console.log("WARNING: dur above 0.25s");
        dur = 0.25;
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
        this.source.connect(this.biquadFilter);
        
       // this.source.connect(this.gain);
        
        this.biquadFilter.connect(this.gain);
        // this.convolver.connect(this.gain);
        
        this.biquadFilter.type = "lowshelf";
        this.biquadFilter.frequency.value = 1000;
        
        this.source.start(now,start,dur,filter);
        
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
    
	// this.source.disconnect(this.gain);
    
    this.source.disconnect(this.biquadFilter);
	this.gain.disconnect(ac.destination);
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


function playASynthFromTheBank(dbamp,dur,rate,start,filter) {   
var n;
// var dur = 0.25;
// var start = 0;
    
for(n=0;n<20;n++) {
	if(synthBank[n].isNotPlaying())break;
}
if(n<20) { // we found one that is not playing
	synthBank[n].play(dbamp,dur,rate,start,filter);
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

grainAmp = 5;
grainDur = 0.05;
grainRate = 1;
grainStart = 0;
grainFilter = 1000;

timeOutResponder = function() {
	playASynthFromTheBank(grainAmp,grainDur,grainRate,grainStart,grainFilter);
	setTimeout(timeOutResponder,grainPeriod);
}