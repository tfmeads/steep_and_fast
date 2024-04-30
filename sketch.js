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
var grn =  100;
const CC_BLU = 64;
var blu =  90;
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
var CUE_CC = false; //when true, wait until CC value stops changing to change actual value
var last_cc = [];

var steps = size_a; 
var frameSize = 666;
var marginSize;
var SKIP_CUE_CCS = [CC_CUE,CC_DIR]; //holds CCs we don't want to be affected by Cueing

var ctrls = [];

function setup() {
 createCanvas(windowWidth, windowHeight);

 //doesn't work if you set it above for some reason
 red = 255;

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;

 var cue = new MidiCtrl(CC_CUE,'CUE','',0);
  cue.isBoolean = true;
 addCtrl(cue);

 var ctrl = new MidiCtrl(CC_RADIUS,'Radius','',radius);
 ctrl.min = RADIUS_MIN;
 ctrl.max = RADIUS_MAX;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_ACCEL,'Acceleration','',acceleration);
 ctrl.min = .1;
 ctrl.max = 7;
 ctrl.lerpAmt = .8;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_FADE,'Fade','',fade);
 ctrl.min = 0;
 ctrl.max = 255;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_SIZE_A,'SIZE_A','',size_a);
 ctrl.min = 0;
 ctrl.max = 127;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_SIZE_B,'SIZE_B','',size_b);
 ctrl.min = 0;
 ctrl.max = 127;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_CURVES,'CURVES','',curves);
 ctrl.min = NUM_CURVES_MIN;
 ctrl.max = NUM_CURVES_MAX;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_X1,'X1','',X1);
 ctrl.min = X1_MIN;
 ctrl.max = X1_MAX;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_X2,'X2','',X2);
 ctrl.min = 0;
 ctrl.max = 127;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_RANGE,'RANGE','',range);
 ctrl.min = RANGE_MIN;
 ctrl.max = RANGE_MAX;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_RED,'RED','',red);
 ctrl.min = 0;
 ctrl.max = 255;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_BLU,'BLU','',blu);
 ctrl.min = 100;
 ctrl.max = 200;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_GRN,'GRN','',grn);
 ctrl.min = -50;
 ctrl.max = 300;
 addCtrl(ctrl);
 var ctrl = new MidiCtrl(CC_DIR,'DIR','',0);
ctrl.isBoolean = true;
 addCtrl(ctrl);

}


function draw() {

  var ctrl = getCtrl(CC_RADIUS);
  radius = ctrl.val;
  var ctrl = getCtrl(CC_ACCEL);
  acceleration = ctrl.val;
  var ctrl = getCtrl(CC_FADE);
  fade = ctrl.val;
  var ctrl = getCtrl(CC_SIZE_A);
  size_a = ctrl.val;
  var ctrl = getCtrl(CC_SIZE_B);
  size_b = ctrl.val;
  var ctrl = getCtrl(CC_CURVES);
  curves = ctrl.val;
  var ctrl = getCtrl(CC_X1);
  X1 = ctrl.val;
  var ctrl = getCtrl(CC_X2);
  X2 = ctrl.val;
  var ctrl = getCtrl(CC_RANGE);
  range = ctrl.val;
  var ctrl = getCtrl(CC_RED);
  red = ctrl.val;
  var ctrl = getCtrl(CC_BLU);
  blu = ctrl.val;
  var ctrl = getCtrl(CC_GRN);
  grn = ctrl.val;

  var ctrl = getCtrl(CC_DIR);
  dir = ctrl.active ? 1 : 0;
  
  
  ctrls.forEach((element) => element.update());

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

    var _grn = grn + (yClrMod % (range * 99)); 
    var _blu = blu - (yClrMod % (range * 100));
    fill(red,_grn,_blu);

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
