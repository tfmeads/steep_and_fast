const LINE_STROKE = false;
const DYNAMIC_IMAGE = true; //set false to see default location of each bezier point
const DEFAULT_SPEED = 777; 
const MIN_SPEED = 55;


const CC_ACCEL = 41;
var acceleration = 2;
const CC_RADIUS = 42;
var radius = .3;
const RADIUS_MIN = .1;
const RADIUS_MAX = 3;
const CC_FADE = 51;
var fade = 255;
const CC_CURVES = 52;
const NUM_CURVES_MIN = 14;
const NUM_CURVES_MAX = 127;
var curves = 55;
const CC_RANGE = 53;
const RANGE_MIN = .3;
const RANGE_MAX = 7;
var range = 1;
const CC_SIZE_A = 43;
var size_a =  150;
const CC_RED = 63;
var red =  255;
const CC_GRN = 54;
var grnMod =  100;
const CC_BLU = 64;
var bluMod =  90;
const CC_SIZE_B = 44;
var size_b = 3;
const CC_X1 = 61;
var X1 = 42;
const X1_MIN = -30;
const X1_MAX = 200;
const CC_X2 = 62;
var X2 = 10;
const CC_DIR = 24;
var FLOW_DIR = 1; //1 = forward
const CC_CUE = 14;
const CUE_TIME = 333;
var CUE_CC = false; //when true, wait until CC value stops changing to change actual value
var last_cc = [];

var steps = size_a; 
var frameSize = 666;
var marginSize;
var SKIP_CUE_CCS = [CC_CUE,CC_DIR]; //holds CCs we don't want to be affected by Cueing

function setup() {
 createCanvas(windowWidth, windowHeight);

 //doesn't work if you set it above for some reason
 red = 255;

 midiInput = new MIDIInput();
 // Override onMIDIMessage callback with custom function
 midiInput.onMIDIMessage = onMIDIMessage;

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;
}

function draw() {

  background(0,fade);
  
  //start at 2 because initial curve is kinda lame
  for(let i = 2; i < curves; i++)
  {  
    let x1 = marginSize + X1 * i,
    x2 = marginSize + X2 * i,
    x3 = marginSize + 90,
    x4 = marginSize + 15 * i;

    let y1 = 20 * i,
    y2 = 10,
    y3 = 90,
    y4 = 80 * i;

    noFill();
    if(!LINE_STROKE){
      noStroke();
    }
    bezier(x1, y1, x2, y2, x3, y3, x4, y4);

    //subtract original x coords from width to mirror, keep y the same
    let mirror1 = windowWidth - x1,
    mirror2 = windowWidth - x2,
    mirror3 = windowWidth - x3,
    mirror4 = windowWidth - x4;

    bezier(mirror1,y1,mirror2,y2,mirror3,y3,mirror4, y4);

    //colors start changing halfway down the screen
    let yClrMod = -50 + map(y1,windowHeight/2,windowHeight,3,333);

    var grn = grnMod + (yClrMod % (range * 99)); 
    var blu = bluMod - (yClrMod % (range * 100));
    fill(red,grn,blu);

    //make amt of steps increase as y increases
    steps = map(y1,windowHeight / 10,windowHeight * 10 / 7,size_b,size_a);


    for (let a = 0; a <= steps; a++) {
      //t represents how far along we are on the curve represented by 0.0 - 1.0
      let t = a / steps;

      if(DYNAMIC_IMAGE){
        //modulates t based on time which makes each point flow from start to end
        var speed = DEFAULT_SPEED + MIN_SPEED;
        speed /= acceleration * FLOW_DIR;
        t += (millis() % speed) / (speed * steps );
      } 


      let x = bezierPoint(x1, x2, x3, x4, t);
      let mirrorX = bezierPoint(mirror1, mirror2, mirror3, mirror4, t);
      let y = bezierPoint(y1, y2, y3, y4, t);

      let circleSize = map(y4,windowHeight * 3 / 4,windowHeight,radius * 3,radius * 7);

      if(t < 0.8){
        noStroke();
      }
      else{
        stroke(200,30,255);
      }

      circle(x, y, circleSize);
      circle(mirrorX,y, circleSize);
  }}
}


function onMIDIMessage(data) {
  msg = new MIDI_Message(data.data);

  last_cc[msg.note] = millis();

  if(CUE_CC && !SKIP_CUE_CCS.includes(msg.note)){
    sleep(CUE_TIME).then(function(){
      if(millis() - last_cc[msg.note] > CUE_TIME){
        handleCC(msg);
      }
    })
  }
  else{
    handleCC(msg);
  }
}

function handleCC(msg){

  
  switch(msg.note){
    case CC_RADIUS:
      radius = map(msg.velocity,0,127,RADIUS_MIN,RADIUS_MAX);
      console.log("RADIUS " + radius);
      break;
    case CC_ACCEL:
      acceleration = msg.velocity / 20 + .1;
      console.log("acceleration " + acceleration);
      break;
    case CC_FADE:
      fade = msg.velocity == 127 ? 255 : msg.velocity / 2;
      console.log("FADE " + fade);
      break;
    case CC_SIZE_A:
      size_a = msg.velocity;
      console.log("size_a " + msg.velocity);
      break;
    case CC_SIZE_B:
      size_b = msg.velocity;
      console.log("size_b " + msg.velocity);
      break;
    case CC_CURVES:
      curves = int(map(msg.velocity,0,127,NUM_CURVES_MIN,NUM_CURVES_MAX));
      console.log("curves " + radius);
      break;
    case CC_X1:
      X1 = map(msg.velocity,0,127,X1_MIN,X1_MAX);
      console.log("x1 " + X1);
      break;
    case CC_RANGE:
      range = map(msg.velocity,0,127,RANGE_MIN,RANGE_MAX);
      console.log("range " + range);
      break;
    case CC_RED:
      red = (msg.velocity * 2) + 1;
      console.log("red " + red);
      break;
    case CC_BLU:
      bluMod = map(msg.velocity,0,127,100,200);
      console.log("blu " + bluMod);
      break;
    case CC_GRN:
      grnMod = map(msg.velocity,0,127,-50,300);
      console.log("grn " + grnMod);
      break;
    case CC_X2:
      X2 = msg.velocity;
      console.log("x2 " + msg.velocity);
      break;
    case CC_CUE:
      if(msg.velocity > 0){
        CUE_CC = !CUE_CC;
        console.log("Cue " + (CUE_CC ? "On" : "Off"));
      }
      break;
    case CC_DIR:  
      if(msg.velocity > 0){
        FLOW_DIR = -FLOW_DIR;
        console.log("Flow " + (FLOW_DIR > 0 ? "Forward" : "Reverse"));
      }
      break;


    default:
      console.log(msg.note + " " + msg.velocity);
  }
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
  center();
  background(0);
}
