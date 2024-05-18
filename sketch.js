
//holds CCs we don't want to be affected by Cueing
var SKIP_CUE_CCS = [
  CC_CUE,
];

var scene = 0;
var scenes = [
  'steep_and_fast',
]

function preload(){
  scene = 0;
  loadScene();
}

function loadScene(){
 //load from json
 fetch("midictrl_"+scenes[scene]+'.json')
  .then((res) => res.text())
  .then((text) => {
    var arr = JSON.parse(text);
    console.log(arr);

    arr.ctrls.forEach(async (ctrl) => {
      var proto = new MidiCtrl();
      var res = Object.assign(proto,ctrl);
      console.log(res);
      addCtrl(res);
    });

   })
  .catch((e) => console.error(e));
}

function setup() {
 createCanvas(windowWidth, windowHeight);

 noCursor();

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;

 console.log(ctrls);
}


function draw() {

  
  for (let [key, value] of Object.entries(ctrls)) {
    getCtrl(key).update();
}
  
  steep_and_fast();
}


// a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
