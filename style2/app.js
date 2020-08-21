// Grabbing the canvas (i just felt like i had to put a comment)
const canvas = document.getElementById("canvas");
// Babylon.js setup
const engine = new BABYLON.Engine(canvas, true);
//-----------------------------------------------//

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(15 / 255, 20 / 255, 22 / 255)
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
//  
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
camera.keysUp.push(87);    // W
camera.keysDown.push(83)   // D        
camera.keysLeft.push(65);  // A            
camera.keysRight.push(68); // S
// Light
var light = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
// Rows of blocks, 25 x 25
var blocks = [];
for (i = 0; i < 1024; i += 1) {
    var box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
    box.position.x = i;
    blocks.push(box);
}
//----------------Audio Handling-----------------//

var audioBuffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var track = null;

var dataArray;
var analyser = context.createAnalyser;

var ready = false;

function playSound(buffer) {
    track = context.createBufferSource();
    track.buffer = buffer;
    //
    track.connect(analyser);
    //
    const gainNode = context.createGain();
    gainNode.gain.value = 0.25;
    track.connect(gainNode).connect(context.destination);
    // Analyser time
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    //
    track.start(0);
    ready = true;
}
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
  
    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        audioBuffer = buffer;
        playSound(buffer)
      }, );
    }
    request.send();
}
loadSound("https://raw.githubusercontent.com/AzzaDeveloper/visualizer/master/rain.mp3");
// Creating analyser
var analyser = context.createAnalyser();
// pass it into the audio context
// Play
//------------------------------------------------//

function lerp(a, b, t) {
    return a + (b - a) * t
}

var t = 0;
const mult = document.getElementById("multi");
const lerpValue = document.getElementById("lerp");
const heightt = document.getElementById("height");
const flat = document.getElementById("flat");
const x = document.getElementById("x");
const y = document.getElementById("y");
const z = document.getElementById("z");
var renderLoop = function() {
    scene.render();
    t -= 0.01;
    // Updating
    document.getElementById("multiLabel").innerHTML = "Data multiplier: " + mult.value;
    document.getElementById("lerpLabel").innerHTML = "Lerp time: " +lerpValue.value;
    document.getElementById("heightLabel").innerHTML = "Height reduction: " + heightt.value;
    document.getElementById("flatLabel").innerHTML = "Height reduction (flat): " + flat.value;
    document.getElementById("xLabel").innerHTML = "Light X: " + x.value;
    document.getElementById("yLabel").innerHTML = "Light Y: " + y.value;
    document.getElementById("zLabel").innerHTML = "Light Z: " + z.value;
    if (ready) {
        analyser.getByteTimeDomainData(dataArray);
        var prevHeight = 0;
        for (i = 0; i < blocks.length; i++) {
            var height = dataArray[i * Number(mult.value)];
            var realScale = lerp(blocks[i].scaling.y, height / Number(heightt.value) - Number(flat.value), Number(lerpValue.value));
            blocks[i].scaling = new BABYLON.Vector3(1, realScale, 1);
            //prevHeight = height;
        }
        light.direction = new BABYLON.Vector3(Number(x.value), Number(y.value), Number(z.value))
    }
};
engine.runRenderLoop(renderLoop);

//---------------------------------------------------//

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});