var ac = new (window.AudioContext||window.webkitAudioContext)();
var source = ac.createBuffer(1, 49152, 48000);
var hanning = ac.createScriptProcessor(256, 1, 1);   


// grains with audio sample integration

function getData() {   
  request = new XMLHttpRequest();
  request.open('GET','Vowel-A.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData = request.response;
 
    ac.decodeAudioData(audioData, function(buffer) {
    myBuffer = buffer;   
    source = myBuffer;
        console.log(myBuffer.getChannelData(0));

  },
    function(e){"Error with decoding audio data" + e.err});
  }
  request.send();
}


function grain(amp,dur){   
     var sr = ac.sampleRate;
     var nn = 0; // nn how many samples so far, n is the individual grain
     
    hanning.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        
        // apply hanning window 
        var period = dur * sr;
        for(var n=0;n<input.length;n++) {
            var win = amp * (1 - Math.cos((2*(Math.PI)*(n+nn))/(period)));
            if((n+nn)>=period) output[n] = 0; // the grain that you are currently on + where you started. if that is greater than or = to the period (duration of sample) than do not output anything (stop playing)
            else output[n] = win*input[n]*2;
        }
    nn += input.length;   // start at the end of the previous sample  
        
    }; 
 }

function buttonClick() {
    getData();
    grain(20,5);
    
    var playsource = ac.createBufferSource(); // for repetitive pressing you need to create a new source
    playsource.playbackRate.value = 1; // this will be added to a proper function later to change
    
    playsource.buffer = source;
    playsource.connect(hanning);
    hanning.connect(ac.destination);
    playsource.start();
}

source.onended = function() {
    source.stop();
    source.disconnect(hanning);
    hanning.disconnect(ac.destination);
}