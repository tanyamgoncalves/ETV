//var AudioContext = window.AudioContext || window.webkitAudioContext;
//var ac = new AudioContext();
var canvas = document.createElement("canvas");
canvas.style.background = 'black';
var context = canvas.getContext('2d');

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

var synthBanks = new Array(3);

// where everything loads onto apert
function apertInitialize() { 
    getData();
    
    //Initialize Banks
    var bankOne = new SampleBank(5);
    var bankTwo = new SampleBank(5);
    var bankThree = new SampleBank(5);
    
    synthBanks[0] = bankOne;
    synthBanks[1] = bankTwo;
    synthBanks[2] = bankThree;
    
    for(var i = 0 ; i < synthBanks.length; i++){
        synthBanks[i].initialize();
    }
}

/* UTILITY FUNCTIONS */

var audioBuffer;

// Get buffer data from specified audio file
function getData(soundfile) {   
  var request = new XMLHttpRequest();
 // var audioBuffer;
  request.open('GET','why-vocals.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
      console.log('Audio Files Loaded.');
    var audioData = request.response;
    ac.decodeAudioData(audioData, function(buffer) {
    audioBuffer = buffer;
  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
  return audioBuffer;
} 

// 50/50 - 1 or -1
coinflip = function(){
    return (Math.random() < 0.5 ? -1 : 1);
}

// Conversion of db to dbamp
dbamp = function(x) {
    return Math.pow(10,x/20)
}

/* OBJECTS */

// Synth Object Constructor
var Synth = function(index) {
	this.index = index; 
    this.compressor = ac.createDynamicsCompressor();
    this.gain = ac.createGain();
    this.gain.connect(this.compressor);
    this.source = ac.createBufferSource();
	this.playing = false;
}

// Plays the synth
Synth.prototype.play = function(db,dur,sdur,rate,rmod,start,smod,audiofile) {
    // Amp conversion
    this.amp = dbamp(db)*dbamp(60);
    
    // Sets the source buffer to the data received from the audiofile
    // this.source.buffer = getData(audiofile);
    if(this.source.buffer == null){
        this.source.buffer = audioBuffer;
    }
    
    // Randomizes rate and start values
    this.source.playbackRate.value = rate * Math.fround(Math.random()*(coinflip()*rmod*0.01)+1.00);
    start = start * Math.fround(Math.random()*(smod*0.01)+2.00);
    
    // Applies a compressor
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
    if (start+dur>sdur) {
        console.log("WARNING: start position and duration not valid");
        start = sdur-dur;
    }
    
    /* FIX cannot call start more than once */
    
    if(this.playing == false) {
        var now = ac.currentTime;
        this.gain.gain.setValueAtTime(0,ac.currentTime);
        this.gain.gain.setValueAtTime(0,now);
        this.gain.gain.linearRampToValueAtTime(this.amp*0.2,now+((dur/6))); 
        this.gain.gain.linearRampToValueAtTime(this.amp*0.8,now+((dur/6)*2)); 
        this.gain.gain.linearRampToValueAtTime(this.amp*1,now+((dur/6)*3)); 
        this.gain.gain.linearRampToValueAtTime(this.amp*0.8,now+((dur/6)*4)); 
        this.gain.gain.linearRampToValueAtTime(this.amp*0.2,now+((dur/6)*5)); 
        this.gain.gain.linearRampToValueAtTime(0,now+dur); 
		this.gain.gain.setValueAtTime(0,now);
        this.source.connect(this.gain);
        this.source.start(now,start,dur);
        this.playing = true;
	}
    
    var index = this.index;
    
	setTimeout(function() {
		synthBanks[0].bank[index].playing = false;
	},dur*1000+100);
}

// Stops source and disconnects compressor and gain
Synth.prototype.dealloc = function() {
	this.source.stop();
    this.source.disconnect(this.gain);
    //this.source.disconnect(this.compressor);
	//this.source.disconnect(this.gain);
}

// Bank Object Constructor
var SampleBank = function(grainNum){
    this.bank = new Array();
    this.grainNum = grainNum;
}

// Initializes the bank by adding synth objects to its array, the number of synths 
// can be randomized by using nmod
SampleBank.prototype.initialize = function(){

    for(var m =0;m<this.grainNum;m++) {
        this.bank[m] = new Synth(m);
    } 

}

/* FIX not indexing through synths in bank */

// Looks for a synth from the bank that isn't playing and plays it
SampleBank.prototype.play = function(dur,sdur,db,rate,start,rmod,smod,audiofile){
    var n;
    for(n=0;n<5;n++) {
        if(this.bank[n].playing == false)break;
    }
    if(n<5) { // we found one that is not playing
	   this.bank[n].play(db,dur,sdur,rate,rmod,start,smod,audiofile);
    } else {
	   console.log("sorry too many notes playing right now");
    }
    console.log(this.bank);
}

/* PLAY FUNCTIONS */

// Creates a new synth and plays the specified sample with it
function playSample(dbamp,dur,sdur,rate,start,rmod,smod,audiofile){
    var synth = new Synth(0);
    synth.play(dbamp,dur,sdur,rate,rmod,start,smod,audiofile);
}

var counter = 0;

// Plays and creates a synth for each grain, specified by grainNum
playGrains = function(index,db,dur,sdur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod,audiofile) {
    synthBanks[index].play(dur,sdur,db,rate,start,rmod,smod,audiofile);
    
    var deviationGrain = Math.random()*gmod*2-gmod;
    grainPeriod = grainPeriod * Math.fround(deviationGrain);
    
    
    //var randomGrainNum = Math.random() < 0.5 ? -1 : 1;
    //var deviationNum = Math.random()*(randomGrainNum*nmod*0.01);
    //grainNum = grainNum * Math.fround(deviationNum);
    

    //drawAParticleFromTheBank(dur);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
     setTimeout(playGrains(index,db,dur,sdur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod,audiofile),grainPeriod,gmod);
}

// Can pass sequences for any variables
playGrainsSequence = function(index,db,dur,sdur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod,audiofile){
    synthBanks[index].play(dur,sdur,db,rate,start,rmod,smod,audiofile);
    
    var deviationGrain = Math.random()*gmod*2-gmod;
    grainPeriod = grainPeriod * Math.fround(deviationGrain);
    //drawAParticleFromTheBank(dur);
    
    if(counter==grainNum){
        counter=0;
        return;
    }
    
    else{
        counter++; // counter = counter + 1
    }
     setTimeout(playGrains(index,db,dur,sdur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod,audiofile),grainPeriod,gmod);
}
