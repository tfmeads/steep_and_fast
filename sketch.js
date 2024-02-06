const NUM_CURVES = 55;
const LINE_STROKE = false;
const STEPS_DYNAMIC = true; //use static amt of steps for more orderly geometric pattern
const STEPS_DYNAMIC_A =  33;
const STEPS_DYNAMIC_B = 3;
const DYNAMIC_IMAGE = true; //set false to see default location of each bezier point
const DEFAULT_SPEED = 777; 

var colorFillAlpha = 255;
var steps = 7; 
var frameSize = 666;
var marginSize;

function setup() {
 createCanvas(windowWidth, windowHeight);

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;
}

function draw() {

  background(0,colorFillAlpha);
  

  //start at 2 because initial curve is kinda lame
  for(let i = 2; i < NUM_CURVES; i++)
  {  
    let x1 = marginSize + 85 * i,
    x2 = marginSize + 10 * i,
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
    var blu = 90 - yClrMod;
    fill(red,grn,blu);

    if(STEPS_DYNAMIC){
      //make amt of steps increase as y increases
      steps = map(y1,windowHeight / 10,windowHeight * 10 / 7,STEPS_DYNAMIC_B,STEPS_DYNAMIC_A);
    }

    for (let a = 0; a <= steps; a++) {
      //t represents how far along we are on the curve represented by 0.0 - 1.0
      let t = a / steps;

      if(DYNAMIC_IMAGE){
        //modulates t based on time which makes each point flow from start to end
        t += (millis() % DEFAULT_SPEED) / (DEFAULT_SPEED * steps );
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
