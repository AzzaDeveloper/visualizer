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
for (i = 0; i < 15; i += 1) {
    for (j = 0; j < 15; j += 1) {
        var box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
        box.position.x = j;
        box.position.z = i;
    }
}
//----------------Audio Handling-----------------//

var buffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
  
    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        dogBarkingBuffer = buffer;
      }, onError);
    }
    request.send();
}
// Creating analyser
var analyser = context.createAnalyser();
// Requesting the sound
const audioElement = document.querySelector('audio');
audioElement.src = URL.createObjectURL(document.getElementsByTagName('input')[0].files[0]);
// pass it into the audio context
const track = context.createMediaElementSource(audioElement);
track.connect(analyser);
track.connect(context.destination);
// Play
audioElement.play();
//------------------------------------------------//

var t = 0;
var renderLoop = function() {
    scene.render();
    t -= 0.01;
};
engine.runRenderLoop(renderLoop);

//---------------------------------------------------//

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});