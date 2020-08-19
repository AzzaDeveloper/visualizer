// Grabbing the canvas (i just felt like i had to put a comment)
const canvas = document.getElementById("canvas");
// Babylon.js setup
const engine = new BABYLON.Engine(canvas, true);
//-----------------------------------------------//

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(40 / 255, 50 / 255, 55 / 255)
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
//
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
camera.keysUp.push(87);    // W
camera.keysDown.push(83)   // D        
camera.keysLeft.push(65);  // A            
camera.keysRight.push(68); // S
// Light
var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
// Rows of blocks, 25 x 25
var blocks = [];
for (i = 0; i < 20; i += 2) {
    for (j = 0; j < 20; j += 2) {
        var box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, scene);
        box.position.x = j;
        box.position.z = i;
        blocks.push(box);
    }
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
    track.buffer = audioBuffer;
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
loadSound("https://raw.githubusercontent.com/AzzaDeveloper/visualizer/master/camellia.mp3");
console.log(audioBuffer);
// Creating analyser
var analyser = context.createAnalyser();
// pass it into the audio context
// Play
//------------------------------------------------//

function lerp(a, b, t) {
    return a + (b - a) * t
}

var t = 0;
var renderLoop = function() {
    scene.render();
    t -= 0.01;
    //
    if (ready) {
        analyser.getByteTimeDomainData(dataArray);
        for (i = 0; i < blocks.length; i++) {
            var height = dataArray[i * 10];
            var realScale = lerp(blocks[i].scaling.y, height - 128, 0.05);
            blocks[i].scaling = new BABYLON.Vector3(1, realScale, 1);
        }
    }
};
engine.runRenderLoop(renderLoop);

//---------------------------------------------------//

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});