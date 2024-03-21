const NUM_CURVES = 55;
const LINE_STROKE = false;
const STEPS_DYNAMIC = true; //use static amt of steps for more orderly geometric pattern
const DYNAMIC_IMAGE = true; //set false to see default location of each bezier point
const DEFAULT_SPEED = 777; 
const MIN_SPEED = 55;

const CC_VELOCITY = 41;
var velocity = 0;
const CC_ACCEL = 42;
var acceleration = .1;
const CC_FADE = 51;
var fade = 255;
const CC_SIZE_A = 43;
var size_a =  150;
const CC_SIZE_B = 44;
var size_b = 3;
const CC_X1 = 61;
var X1 = 42;
const X1_MIN = -30;
const X1_MAX = 200;
const CC_X2 = 62;
var X2 = 10;

var steps = size_a; 
var frameSize = 666;
var marginSize;

function onMIDIMessage(data) {
  msg = new MIDI_Message(data.data);


  switch(msg.note){
    case CC_VELOCITY:
      velocity = 64 - msg.velocity;
      console.log("Velocity " + velocity);
      break;
    case CC_ACCEL:
      acceleration = msg.velocity / 20 + .1;
      console.log("acceleration " + acceleration);
      break;
    case CC_FADE:
      fade = msg.velocity == 127 ? 255 : msg.velocity / 2;
      console.log("FADE " + msg.velocity);
      break;
    case CC_SIZE_A:
      size_a = msg.velocity;
      console.log("size_a " + msg.velocity);
      break;
    case CC_SIZE_B:
      size_b = msg.velocity;
      console.log("size_b " + msg.velocity);
      break;
    case CC_X1:
      X1 = map(msg.velocity,0,127,X1_MIN,X1_MAX);
      console.log("x1 " + msg.velocity);
      break;
    case CC_X2:
      X2 = msg.velocity;
      console.log("x2 " + msg.velocity);
      break;



    default:
      console.log(msg.note + " " + msg.velocity);
  }




}


function setup() {
 createCanvas(windowWidth, windowHeight);


 midiInput = new MIDIInput();
 // Override onMIDIMessage callback with custom function
 midiInput.onMIDIMessage = onMIDIMessage;

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;
}

function draw() {

  background(0,fade);
  
  //start at 2 because initial curve is kinda lame
  for(let i = 2; i < NUM_CURVES; i++)
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

    var red = 255;
    var grn = 100 + (yClrMod % 99); 
    var blu = 90 - yClrMod % 100;
    fill(red,grn,blu);

    if(STEPS_DYNAMIC){
      //make amt of steps increase as y increases
      steps = map(y1,windowHeight / 10,windowHeight * 10 / 7,size_b,size_a);
    }

    for (let a = 0; a <= steps; a++) {
      //t represents how far along we are on the curve represented by 0.0 - 1.0
      let t = a / steps;

      if(DYNAMIC_IMAGE){
        //modulates t based on time which makes each point flow from start to end
        var speed = (velocity / 64) * DEFAULT_SPEED + MIN_SPEED;
        speed /= acceleration;
        t += (millis() % speed) / (speed * steps );
      } 


      let x = bezierPoint(x1, x2, x3, x4, t);
      let mirrorX = bezierPoint(mirror1, mirror2, mirror3, mirror4, t);
      let y = bezierPoint(y1, y2, y3, y4, t);

      let circleSize = map(y4,windowHeight * 3 / 4,windowHeight,3,7);

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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerCanvas();
  background(0);
}
